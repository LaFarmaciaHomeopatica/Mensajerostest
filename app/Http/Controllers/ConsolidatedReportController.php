<?php

namespace App\Http\Controllers;

use App\Models\Messenger;
use App\Models\PreoperationalReport;
use App\Models\CleaningReport;
use App\Models\LunchLog;
use App\Models\ShiftCompletion;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConsolidatedReportController extends Controller
{
    public function index(Request $request)
    {
        $date = $request->input('date', Carbon::today()->toDateString());
        $messengerId = $request->input('messenger_id');
        $location = $request->input('location');

        $query = Messenger::query()->where('is_active', true);

        if ($messengerId) {
            $query->where('id', $messengerId);
        }

        // Location filtering would ideally be done via shifts if we had a direct relationship,
        // or we filter the results after fetching if the relationship is complex.
        // For now, let's fetch the data and focus on the daily records.

        // We need to fetch data for the specific date.
        // Eager load relationships with constraints for the date.
        $query->with([
            'preoperationalReports' => function ($q) use ($date) {
                $q->whereDate('created_at', $date);
            },
            'cleaningReports' => function ($q) use ($date) {
                $q->whereDate('created_at', $date);
            },
            'lunchLogs' => function ($q) use ($date) {
                $q->whereDate('start_time', $date);
            },
            'shiftCompletions' => function ($q) use ($date) {
                $q->whereDate('finished_at', $date);
            },
            'shifts' => function ($q) use ($date) {
                $q->whereDate('date', $date);
            }
        ]);

        // If location filter is present, we might need to filter by the shift's location
        if ($location) {
            $query->whereHas('shifts', function ($q) use ($date, $location) {
                $q->whereDate('date', $date)->where('location', $location);
            });
        }

        // Create the paginator
        $messengers = $query->orderBy('name')->paginate(20)->withQueryString();

        // Transform data for the frontend using through() to keep pagination meta
        $reportData = $messengers->through(function ($messenger) use ($date) {
            $preop = $messenger->preoperationalReports->first();
            $cleaning = $messenger->cleaningReports; // Could be multiple
            $lunch = $messenger->lunchLogs->first();
            $shiftEnd = $messenger->shiftCompletions->first();
            $shift = $messenger->shifts->first();

            $compliant = null;
            $shiftStartTime = null;

            if ($shift && $shift->start_time) {
                $shiftStartTime = Carbon::parse($shift->date)->setTimeFromTimeString($shift->start_time)->format('H:i');
            }

            if ($preop && $shift && $shift->start_time) {
                // Parse dates to compare objects with explicit timezone
                $reportTime = $preop->created_at->timezone(config('app.timezone'));
                $shiftStart = Carbon::parse($shift->date)->setTimeFromTimeString($shift->start_time);
                $compliant = $reportTime->lessThan($shiftStart);
            }

            return [
                'id' => $messenger->id,
                'name' => $messenger->name,
                'vehicle' => $messenger->vehicle,
                'location' => $shift ? $shift->location : 'principal', // Default or from shift
                'preoperational' => $preop ? [
                    'status' => 'Realizado',
                    'compliant' => $compliant,
                    'time' => $preop->created_at->format('H:i'),
                    'shift_start' => $shiftStartTime, // Add this for debugging
                ] : [
                    'status' => 'No realizado',
                    'compliant' => null,
                    'time' => null,
                    'shift_start' => $shiftStartTime, // Show expected shift even if no report
                ],
                'cleaning' => $cleaning->count() > 0 ? [
                    'status' => 'Realizado',
                    'count' => $cleaning->count(),
                    'types' => $cleaning->pluck('type')->unique()->values(),
                ] : null,
                'lunch' => $lunch ? [
                    'start' => $lunch->start_time ? $lunch->start_time->format('H:i') : null,
                    'end' => $lunch->end_time ? $lunch->end_time->format('H:i') : null,
                    'status' => $lunch->end_time ? 'finished' : $lunch->status, // Force finished if end time exists
                ] : null,
                'shift_end' => $shiftEnd ? [
                    'time' => $shiftEnd->finished_at->format('H:i'),
                ] : null,
            ];
        });

        return Inertia::render('Reports/Consolidated', [
            'reportData' => $reportData,
            'filters' => [
                'date' => $date,
                'messenger_id' => $messengerId,
                'location' => $location,
            ],
            'messengers' => Messenger::where('is_active', true)->orderBy('name')->select('id', 'name', 'vehicle')->get(),
            // We need locations for the filter
            'locations' => \App\Models\DispatchLocation::select('name')->distinct()->get()
        ]);
    }

    public function export(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'messenger_id' => 'nullable|exists:messengers,id',
            'location' => 'nullable|string',
        ]);

        $fileName = 'reporte_consolidado_' . now()->format('Y-m-d_His') . '.xlsx';

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\ConsolidatedReportExport(
                $request->start_date,
                $request->end_date,
                $request->messenger_id,
                $request->location
            ),
            $fileName
        );
    }
}
