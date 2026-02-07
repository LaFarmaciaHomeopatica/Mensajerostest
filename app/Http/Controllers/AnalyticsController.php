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
            'messengers' => Messenger::where('is_active', true)->where('exclude_from_analytics', false)->orderBy('name')->get(['id', 'name']),
            'locations' => \App\Models\DispatchLocation::select('name')->distinct()->get()->pluck('name')
        ]);
    }

    protected function getBaseQuery($model, Request $request)
    {
        $query = $model::query();

        if ($request->has('messenger_id') && $request->messenger_id != '') {
            $query->where('messenger_id', $request->messenger_id);
        } else {
            // Filter by non-excluded messengers if no specific messenger is requested
            $query->whereIn('messenger_id', Messenger::where('exclude_from_analytics', false)->pluck('id'));
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
        $currentStats = [
            'preop_count' => $this->getBaseQuery(PreoperationalReport::class, $request)->count(),
            'cleaning_count' => $this->getBaseQuery(CleaningReport::class, $request)->count(),
            'lunch_count' => $this->getBaseQuery(LunchLog::class, $request)->count(),
            'completion_count' => $this->getBaseQuery(ShiftCompletion::class, $request)->count(),
        ];

        $prevRequest = $this->getPreviousPeriodRequest($request);
        $prevStats = [
            'preop_count' => $this->getBaseQuery(PreoperationalReport::class, $prevRequest)->count(),
            'cleaning_count' => $this->getBaseQuery(CleaningReport::class, $prevRequest)->count(),
            'lunch_count' => $this->getBaseQuery(LunchLog::class, $prevRequest)->count(),
            'completion_count' => $this->getBaseQuery(ShiftCompletion::class, $prevRequest)->count(),
        ];

        $trends = [];
        foreach ($currentStats as $key => $value) {
            $prevValue = $prevStats[$key];
            $trends[$key] = $prevValue > 0 ? round((($value - $prevValue) / $prevValue) * 100, 1) : ($value > 0 ? 100 : 0);
        }

        return response()->json([
            'current' => (object) $currentStats,
            'trends' => (object) $trends
        ]);
    }

    private function getPreviousPeriodRequest(Request $request)
    {
        $startDate = Carbon::parse($request->get('start_date', now()->subDays(30)->toDateString()));
        $endDate = Carbon::parse($request->get('end_date', now()->toDateString()));
        $diff = $startDate->diffInDays($endDate) + 1;

        $prevReq = new Request($request->all());
        $prevReq->merge([
            'start_date' => $startDate->copy()->subDays($diff)->toDateString(),
            'end_date' => $startDate->copy()->subDay()->toDateString(),
        ]);
        return $prevReq;
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
        $startDateStr = $request->get('start_date', now()->subDays(7)->toDateString());
        $endDateStr = $request->get('end_date', now()->toDateString());

        $messengersQuery = Messenger::where('is_active', true)->where('exclude_from_analytics', false);
        if ($messengerId) {
            $messengersQuery->where('id', $messengerId);
        }
        $messengers = $messengersQuery->get();

        $messengerIds = $messengers->pluck('id');

        // Batch fetch all relevant shifts
        $shifts = Shift::whereIn('messenger_id', $messengerIds)
            ->whereBetween('date', [$startDateStr, $endDateStr])
            ->where('status', 'present')
            ->get()
            ->groupBy('messenger_id');

        // Batch fetch all relevant preoperational reports
        $reports = PreoperationalReport::whereIn('messenger_id', $messengerIds)
            ->whereBetween('created_at', [Carbon::parse($startDateStr)->startOfDay(), Carbon::parse($endDateStr)->endOfDay()])
            ->get()
            ->mapToGroups(function ($item) {
                return [$item->messenger_id . '_' . $item->created_at->toDateString() => $item];
            });

        $compliance = [];

        foreach ($messengers as $messenger) {
            $mShifts = $shifts->get($messenger->id, collect());
            $onTime = 0;
            $total = $mShifts->count();

            foreach ($mShifts as $shift) {
                $reportKey = $messenger->id . '_' . $shift->date;
                $report = $reports->get($reportKey)?->first();

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

    public function getCleaningComplianceStats(Request $request)
    {
        $messengerId = $request->get('messenger_id');
        $startDateStr = $request->get('start_date', now()->subDays(30)->toDateString());
        $endDateStr = $request->get('end_date', now()->toDateString());

        $startDate = Carbon::parse($startDateStr)->startOfDay();
        $endDate = Carbon::parse($endDateStr)->endOfDay();

        // Calculate weeks and months covered
        $days = $startDate->diffInDays($endDate) + 1;
        $weeks = max(1, round($days / 7));
        $months = max(1, round($days / 30));

        $messengersQuery = Messenger::where('is_active', true)->where('exclude_from_analytics', false);
        if ($messengerId) {
            $messengersQuery->where('id', $messengerId);
        }
        $messengers = $messengersQuery->get();
        $messengerIds = $messengers->pluck('id');

        $reports = CleaningReport::whereIn('messenger_id', $messengerIds)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get()
            ->groupBy('messenger_id');

        $compliance = [];

        foreach ($messengers as $messenger) {
            $mReports = $reports->get($messenger->id, collect());

            $counts = [
                'maletas_semanal' => $mReports->where('type', 'maletas_semanal')->count(),
                'motos_semanal' => $mReports->where('type', 'motos_semanal')->count(),
                'maletas_mensual' => $mReports->where('type', 'maletas_mensual')->count(),
                'motos_mensual' => $mReports->where('type', 'motos_mensual')->count(),
            ];

            // Target: 1 per week/month
            $achieved = min($counts['maletas_semanal'], $weeks) +
                min($counts['motos_semanal'], $weeks) +
                min($counts['maletas_mensual'], $months) +
                min($counts['motos_mensual'], $months);

            $totalTarget = ($weeks * 2) + ($months * 2);

            $compliance[] = [
                'name' => $messenger->name,
                'rate' => $totalTarget > 0 ? round(($achieved / $totalTarget) * 100, 1) : 0,
                'details' => $counts,
                'targets' => ['weeks' => $weeks, 'months' => $months]
            ];
        }

        return response()->json($compliance);
    }

    public function getSectionTrends(Request $request)
    {
        $preops = $this->getBaseQuery(PreoperationalReport::class, $request)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $cleanings = $this->getBaseQuery(CleaningReport::class, $request)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Merge dates
        $allDates = $preops->pluck('date')->merge($cleanings->pluck('date'))->unique()->sort();

        $trends = $allDates->map(function ($date) use ($preops, $cleanings) {
            $p = $preops->firstWhere('date', $date);
            $c = $cleanings->firstWhere('date', $date);
            return [
                'date' => $date,
                'preop' => $p ? $p->count : 0,
                'cleaning' => $c ? $c->count : 0,
            ];
        });

        return response()->json($trends);
    }

    public function getAttendanceComplianceStats(Request $request)
    {
        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date')) : now()->subDays(30);
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date')) : now();
        $messengerId = $request->input('messenger_id');

        $shiftsQuery = Shift::whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()]);
        if ($messengerId) {
            $shiftsQuery->where('messenger_id', $messengerId);
        }
        $shifts = $shiftsQuery->get()->groupBy('messenger_id');

        $messengersQuery = Messenger::where('is_active', true)->where('exclude_from_analytics', false);
        if ($messengerId) {
            $messengersQuery->where('id', $messengerId);
        }
        $messengers = $messengersQuery->get();

        $compliance = [];

        foreach ($messengers as $messenger) {
            $mShifts = $shifts->get($messenger->id, collect());
            $scheduledDates = $mShifts->pluck('date')->unique();
            $expectedReports = $scheduledDates->count() * 2; // Lunch + End of Shift

            if ($expectedReports === 0) {
                $compliance[] = [
                    'name' => $messenger->name,
                    'rate' => 0,
                    'lunch_count' => 0,
                    'completion_count' => 0,
                    'expected' => 0
                ];
                continue;
            }

            $lunchDone = LunchLog::where('messenger_id', $messenger->id)
                ->whereIn(DB::raw('DATE(created_at)'), $scheduledDates)
                ->select(DB::raw('DATE(created_at) as date'))
                ->distinct()
                ->get()
                ->count();

            $completionDone = ShiftCompletion::where('messenger_id', $messenger->id)
                ->whereIn(DB::raw('DATE(finished_at)'), $scheduledDates)
                ->select(DB::raw('DATE(finished_at) as date'))
                ->distinct()
                ->get()
                ->count();

            $totalDone = $lunchDone + $completionDone;

            $compliance[] = [
                'name' => $messenger->name,
                'rate' => round(($totalDone / $expectedReports) * 100, 1),
                'lunch_count' => $lunchDone,
                'completion_count' => $completionDone,
                'expected' => $expectedReports
            ];
        }

        return response()->json($compliance);
    }

    public function getShiftExitAnalysis(Request $request)
    {
        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date')) : now()->subDays(30);
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date')) : now();
        $messengerId = $request->input('messenger_id');

        $query = Shift::with(['messenger', 'messenger.shiftCompletions'])
            ->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()]);

        if ($messengerId) {
            $query->where('messenger_id', $messengerId);
        }

        $shifts = $query->orderBy('date', 'desc')->get();

        $analysis = $shifts->map(function ($shift) {
            // Find completion for this shift date
            $completion = $shift->messenger->shiftCompletions()
                ->whereDate('finished_at', $shift->date)
                ->first();

            if (!$completion || !$shift->end_time) {
                return null;
            }

            $scheduledEnd = Carbon::parse($shift->date . ' ' . $shift->end_time);
            $actualEnd = Carbon::parse($completion->finished_at);

            $diffMinutes = $scheduledEnd->diffInMinutes($actualEnd, false);

            return [
                'date' => $shift->date,
                'messenger' => $shift->messenger->name,
                'scheduled_end' => $scheduledEnd->format('H:i'),
                'actual_end' => $actualEnd->format('H:i'),
                'diff_minutes' => $diffMinutes,
                'status' => $diffMinutes > 0 ? 'late' : ($diffMinutes < 0 ? 'early' : 'on-time')
            ];
        })->filter()->values();

        // Calculate average diff (abs)
        $avgDiff = $analysis->count() > 0 ? round($analysis->avg(fn($a) => abs($a['diff_minutes']))) : 0;

        return response()->json([
            'history' => $analysis,
            'avg_diff' => $avgDiff
        ]);
    }

    public function getGlobalTrend(Request $request)
    {
        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date')) : now()->subDays(30);
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date')) : now();

        $dates = [];
        $curr = $startDate->copy();
        while ($curr <= $endDate) {
            $dates[$curr->toDateString()] = [
                'date' => $curr->toDateString(),
                'preop' => 0,
                'cleaning' => 0,
                'tiempos' => 0
            ];
            $curr->addDay();
        }

        $excludedIds = Messenger::where('exclude_from_analytics', true)->pluck('id');

        PreoperationalReport::whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->whereNotIn('messenger_id', $excludedIds)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->get()
            ->each(function ($r) use (&$dates) {
                if (isset($dates[$r->date]))
                    $dates[$r->date]['preop'] = $r->count;
            });

        CleaningReport::whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->whereNotIn('messenger_id', $excludedIds)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->get()
            ->each(function ($r) use (&$dates) {
                if (isset($dates[$r->date]))
                    $dates[$r->date]['cleaning'] = $r->count;
            });

        LunchLog::whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->whereNotIn('messenger_id', $excludedIds)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->get()
            ->each(function ($r) use (&$dates) {
                if (isset($dates[$r->date]))
                    $dates[$r->date]['tiempos'] += $r->count;
            });

        ShiftCompletion::whereBetween('finished_at', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->whereNotIn('messenger_id', $excludedIds)
            ->select(DB::raw('DATE(finished_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->get()
            ->each(function ($r) use (&$dates) {
                if (isset($dates[$r->date]))
                    $dates[$r->date]['tiempos'] += $r->count;
            });

        return response()->json(array_values($dates));
    }

    public function getPerformanceSummary(Request $request)
    {
        $compliance = collect($this->getComplianceStats($request)->original);
        $cleaningComp = collect($this->getCleaningComplianceStats($request)->original);
        $attendanceComp = collect($this->getAttendanceComplianceStats($request)->original);

        $merged = $compliance->map(function ($comp) use ($cleaningComp, $attendanceComp) {
            $clean = $cleaningComp->firstWhere('name', $comp['name']) ?: ['rate' => 0];
            $attr = $attendanceComp->firstWhere('name', $comp['name']) ?: ['rate' => 0];

            return [
                'name' => $comp['name'],
                'preop_rate' => $comp['rate'],
                'cleaning_rate' => $clean['rate'],
                'attendance_rate' => $attr['rate'],
                'overall' => round(($comp['rate'] + $clean['rate'] + $attr['rate']) / 3, 1)
            ];
        })->sortByDesc('overall');

        $health = [
            'preop' => round($compliance->avg('rate'), 1),
            'cleaning' => round($cleaningComp->avg('rate'), 1),
            'attendance' => round($attendanceComp->avg('rate'), 1),
            'global' => round($merged->avg('overall'), 1)
        ];

        return response()->json([
            'health' => $health,
            'top' => $merged->values()->take(5),
            'attention' => $merged->where('overall', '<', 70)->values()
        ]);
    }

    public function exportData(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'messenger_id' => 'nullable|exists:messengers,id',
        ]);

        $fileName = 'analisis_datos_' . now()->format('Y-m-d_His') . '.xlsx';

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\AnalyticsMultiSheetExport(
                $request->start_date,
                $request->end_date,
                $request->messenger_id
            ),
            $fileName
        );
    }
}
