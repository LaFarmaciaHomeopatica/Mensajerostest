<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LunchLog;
use App\Models\Messenger;
use App\Models\DispatchLocation;
use App\Services\BeetrackService;
use Inertia\Inertia;

class UnifiedController extends Controller
{
    public function index(BeetrackService $beetrack)
    {
        // 1. Get Beetrack Live Data
        $beetrackData = $beetrack->getDispatchStatus();

        // 2. Get Messengers with active Lunch Logs
        $messengers = Messenger::with([
            'lunchLogs' => function ($q) {
                $q->where('status', 'active')->latest();
            }
        ])->get();

        $now = now();

        // 3. Transform Messenger Data
        $messengersData = $messengers->map(function ($m) use ($now, $beetrackData) {
            // Lunch Status
            $log = $m->lunchLogs()
                ->whereDate('start_time', today())
                ->orderBy('start_time', 'desc')
                ->first();

            $status = 'Disponible'; // Default
            $class = 'status-libre';
            $range = 'Sin horario';

            if ($log) {
                $start = $log->start_time;
                $end = $log->end_time;

                if ($now->between($start, $end)) {
                    $status = 'En Almuerzo';
                    $class = 'status-almuerzo'; // CSS class mapping
                } elseif ($now->greaterThan($end)) {
                    $status = 'Disponible';
                }
                $range = $start->format('h:i A') . ' - ' . $end->format('h:i A');
            }

            // Beetrack Status Overwrite (Priority 2)
            $beetrackInfo = null;
            if (isset($beetrackData['activos'])) {
                $active = collect($beetrackData['activos'])->first(function ($item) use ($m) {
                    return str_contains(strtoupper($item['nombre']), strtoupper($m->name));
                });

                if ($active) {
                    $status = 'En Ruta';
                    $class = 'status-en-ruta';
                    $beetrackInfo = $active; // Contains progress
                }
            }

            // Check if finished
            $finished = null;
            if (isset($beetrackData['libres'])) {
                $finished = collect($beetrackData['libres'])->first(function ($item) use ($m) {
                    return str_contains(strtoupper($item['nombre']), strtoupper($m->name));
                });
            }

            return [
                'id' => $m->id,
                'name' => $m->name,
                'vehicle' => $m->vehicle,
                'location' => $m->location ?? 'principal', // Default to principal
                'status' => $status,
                'class_name' => $class,
                'lunch_range' => $range,
                'beetrack_info' => $beetrackInfo,
                'finished_info' => $finished,
                'priority' => ($status === 'En Ruta') ? 2 : 1, // Order: Available first
            ];
        });

        return Inertia::render('Dashboard', [
            'messengers' => $messengersData,
            'dispatch_locations' => DispatchLocation::all(),
            'beetrack_data' => $beetrackData,
        ]);
    }

    public function updateLocation(Request $request, Messenger $messenger)
    {
        $request->validate([
            'location' => 'required|string|in:principal,teusaquillo',
        ]);

        $messenger->update(['location' => $request->location]);

        return back();
    }
}
