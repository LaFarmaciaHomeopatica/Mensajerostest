<?php

namespace App\Http\Controllers;

use App\Models\CleaningReport;
use App\Models\PreoperationalReport;
use App\Models\Messenger;
use App\Models\Shift;
use App\Models\LunchLog;
use App\Models\ShiftCompletion;
use App\Models\DispatchLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function index()
    {
        return Inertia::render('Analytics/Dashboard', [
            'messengers' => Messenger::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'locations' => \App\Models\DispatchLocation::select('name')->distinct()->get()->pluck('name')
        ]);
    }

    protected function getBaseQuery($model, Request $request)
    {
        $query = $model::query();

        if ($request->has('messenger_id') && $request->messenger_id != '') {
            $query->where('messenger_id', $request->messenger_id);
        }

        $startDate = $request->get('start_date', now()->subDays(30)->toDateString());
        $endDate = $request->get('end_date', now()->toDateString());

        if ($model === Shift::class || $model === DispatchLog::class) {
            $query->whereBetween('date', [$startDate, $endDate]);
        } elseif ($model === ShiftCompletion::class) {
            $query->whereBetween('finished_at', [Carbon::parse($startDate)->startOfDay(), Carbon::parse($endDate)->endOfDay()]);
        } else {
            $query->whereBetween('created_at', [Carbon::parse($startDate)->startOfDay(), Carbon::parse($endDate)->endOfDay()]);
        }

        return $query;
    }

    public function getGeneralStats(Request $request)
    {
        return response()->json([
            'preop_count' => $this->getBaseQuery(PreoperationalReport::class, $request)->count(),
            'cleaning_count' => $this->getBaseQuery(CleaningReport::class, $request)->count(),
            'lunch_count' => $this->getBaseQuery(LunchLog::class, $request)->count(),
            'completion_count' => $this->getBaseQuery(ShiftCompletion::class, $request)->count(),
            'dispatch_guides' => $this->getBaseQuery(DispatchLog::class, $request)->sum('guides_count'),
        ]);
    }

    public function getCleaningStats(Request $request)
    {
        $trends = $this->getBaseQuery(CleaningReport::class, $request)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $reports = $this->getBaseQuery(CleaningReport::class, $request)->get();
        $quality = ['aseo_general' => 0, 'desinfeccion' => 0, 'orden' => 0, 'total' => $reports->count()];

        foreach ($reports as $report) {
            $ans = $report->answers;
            if ($ans['aseo_general'] ?? false)
                $quality['aseo_general']++;
            if ($ans['desinfeccion'] ?? false)
                $quality['desinfeccion']++;
            if ($ans['orden'] ?? false)
                $quality['orden']++;
        }

        return response()->json(['trends' => $trends, 'quality' => $quality]);
    }

    public function getMechanicalStats(Request $request)
    {
        $reports = $this->getBaseQuery(PreoperationalReport::class, $request)->get();
        $failures = [];
        $questions = \App\Models\PreoperationalQuestion::all()->pluck('label', 'key')->toArray();

        foreach ($reports as $report) {
            if (!is_array($report->answers))
                continue;
            foreach ($report->answers as $key => $value) {
                if ($value === false) {
                    $label = $questions[$key] ?? $key;
                    $failures[$label] = ($failures[$label] ?? 0) + 1;
                }
            }
        }

        $formatted = [];
        foreach ($failures as $label => $count) {
            $formatted[] = ['issue' => $label, 'count' => $count];
        }
        usort($formatted, fn($a, $b) => $b['count'] <=> $a['count']);

        return response()->json(['failures' => array_slice($formatted, 0, 10)]);
    }

    public function getComplianceStats(Request $request)
    {
        $messengerId = $request->get('messenger_id');
        $messengers = $messengerId ? Messenger::where('id', $messengerId)->get() : Messenger::where('is_active', true)->get();

        $startDateStr = $request->get('start_date', now()->subDays(7)->toDateString());
        $endDateStr = $request->get('end_date', now()->toDateString());

        $compliance = [];

        foreach ($messengers as $messenger) {
            $shifts = Shift::where('messenger_id', $messenger->id)
                ->whereBetween('date', [$startDateStr, $endDateStr])
                ->where('status', 'present')
                ->get();

            $onTime = 0;
            $total = $shifts->count();

            foreach ($shifts as $shift) {
                $report = PreoperationalReport::where('messenger_id', $messenger->id)
                    ->whereDate('created_at', $shift->date)
                    ->first();

                if ($report && $shift->start_time) {
                    if ($report->created_at->format('H:i') <= $shift->start_time) {
                        $onTime++;
                    }
                }
            }

            if ($total > 0) {
                $compliance[] = [
                    'name' => $messenger->name,
                    'rate' => round(($onTime / $total) * 100, 1),
                    'shifts' => $total,
                    'on_time' => $onTime
                ];
            }
        }

        return response()->json($compliance);
    }

    public function getLunchStats(Request $request)
    {
        $logs = $this->getBaseQuery(LunchLog::class, $request)
            ->whereNotNull('end_time')
            ->get();

        $durations = [];
        $totalMinutes = 0;

        foreach ($logs as $log) {
            $diff = $log->start_time->diffInMinutes($log->end_time);
            $durations[] = [
                'date' => $log->created_at->toDateString(),
                'duration' => $diff,
                'messenger' => $log->messenger->name ?? 'N/A'
            ];
            $totalMinutes += $diff;
        }

        return response()->json([
            'avg_duration' => count($logs) > 0 ? round($totalMinutes / count($logs)) : 0,
            'history' => array_slice($durations, -20)
        ]);
    }

    public function getShiftCompletionStats(Request $request)
    {
        $driver = DB::getDriverName();
        $format = $driver === 'sqlite' ? "strftime('%H:00', finished_at)" : "DATE_FORMAT(finished_at, '%H:00')";

        $completions = $this->getBaseQuery(ShiftCompletion::class, $request)
            ->select(DB::raw("$format as hour"), DB::raw('count(*) as count'))
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        return response()->json($completions);
    }

    public function getDispatchTrend(Request $request)
    {
        $stats = $this->getBaseQuery(DispatchLog::class, $request)
            ->select('date', DB::raw('count(*) as routes'), DB::raw('sum(guides_count) as guides'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json($stats);
    }

    public function getRouteStats(Request $request)
    {
        $messengerId = $request->get('messenger_id');
        $isToday = $request->get('end_date', now()->toDateString()) === now()->toDateString();

        if ($isToday && !$messengerId) {
            $beetrack = app(\App\Services\BeetrackService::class);
            $status = $beetrack->getDispatchStatus();
            $managed = 0;
            $potential = 0;
            $details = [];

            if ($status['status'] === 'success') {
                $all = array_merge($status['activos']->toArray(), $status['libres']->toArray());
                foreach ($all as $m) {
                    $prog = explode('/', $m['progreso_str'] ?? '');
                    if (count($prog) === 2) {
                        $mManaged = (int) $prog[0];
                        $mPotential = (int) $prog[1];
                        $managed += $mManaged;
                        $potential += $mPotential;

                        $details[] = [
                            'name' => $m['nombre'],
                            'managed' => $mManaged,
                            'potential' => $mPotential,
                            'rate' => $mPotential > 0 ? round(($mManaged / $mPotential) * 100) : 0
                        ];
                    }
                }
            }
            return response()->json([
                'managed' => $managed,
                'potential' => $potential,
                'rate' => $potential > 0 ? round(($managed / $potential) * 100, 1) : 0,
                'details' => $details
            ]);
        }

        // Historical from logs
        $logs = $this->getBaseQuery(DispatchLog::class, $request);
        return response()->json([
            'managed' => $logs->sum('guides_count'),
            'potential' => $logs->sum('guides_count'),
            'rate' => 100, // Placeholder
            'details' => []
        ]);
    }
}
