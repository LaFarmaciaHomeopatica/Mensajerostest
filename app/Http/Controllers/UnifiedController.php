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

        // 2. Get Messengers with active Lunch Logs AND Shifts for today
        $messengers = Messenger::where('is_active', true)
            ->with([
                'shifts' => function ($q) {
                    $q->whereDate('date', today());
                },
                'lunchLogs' => function ($q) {
                    $q->where('status', 'active')->latest();
                },
                'shiftCompletions' => function ($q) {
                    $q->whereDate('finished_at', today());
                }
            ])->get()
            // Filter: Must have a shift today AND status is not 'absent'
            ->filter(function ($messenger) {
                $shift = $messenger->shifts->first();
                return $shift && $shift->status !== 'absent';
            });

        $now = now();

        // 3. Transform Messenger Data
        $messengersData = $messengers->map(function ($m) use ($now, $beetrackData) {
            $shift = $m->shifts->first();

            // Lunch Status
            $log = $m->lunchLogs->first();

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

            // Helper to normalize strings (more aggressive for plates)
            $normalize = function ($str) {
                if (!$str)
                    return '';
                return strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $str));
            };

            // Beetrack Status Overwrite (Priority 2)
            $beetrackInfo = null;
            if (isset($beetrackData['activos'])) {
                $active = collect($beetrackData['activos'])->first(function ($item) use ($m, $normalize) {
                    $beetrackPlate = $normalize($item['unidad'] ?? '');
                    $localPlate = $normalize($m->vehicle);

                    if ($localPlate && $beetrackPlate && $beetrackPlate === $localPlate) {
                        // Optional: \Log::info("UnifiedController Index: Match! {$m->name}");
                        return true;
                    }
                    return false;
                });

                if ($active) {
                    $status = 'En Ruta';
                    $class = 'status-en-ruta';
                    $beetrackInfo = $active; // Contains progress
                }
            }

            // Check if finished
            $finished = null;
            // Check internal ShiftCompletion first (more reliable for "Finished Shift" button)
            $completion = $m->shiftCompletions->first();
            if ($completion) {
                $finished = [
                    'hora_cierre' => $completion->finished_at->format('h:i A')
                ];
                $status = 'Finalizado';
                $class = 'pendiente'; // Using 'pendiente' gray style for finished
            }
            // Fallback to Beetrack "libres" if needed, or keep separate? 
            // User requirement: "Finalizo su turno o esta todavia disponible"
            // Let's stick to our internal completion or Beetrack free, but internal is explicit action.

            if (!$finished && isset($beetrackData['libres'])) {
                // Optional: Check Beetrack "libres" if not explicitly finished in our system?
                // For now, rely on our system or Beetrack as valid sources.
            }

            // Find any match (active or free) to override name
            $btMatch = null;
            if (isset($beetrackData['activos']) || isset($beetrackData['libres'])) {
                $allBt = collect($beetrackData['activos'] ?? [])->concat($beetrackData['libres'] ?? []);
                $btMatch = $allBt->first(fn($item) => $normalize($item['unidad'] ?? '') === $normalize($m->vehicle));
            }

            return [
                'id' => $m->id,
                'name' => $btMatch ? ($btMatch['nombre'] ?? $m->name) : $m->name,
                'vehicle' => $m->vehicle,
                'location' => $shift->location ?? 'principal', // Use shift location
                'status' => $status,
                'class_name' => $class,
                'lunch_range' => $range,
                'beetrack_info' => $beetrackInfo,
                'finished_info' => $finished,
                'priority' => ($status === 'En Ruta') ? 2 : 1, // Order: Available first
            ];
        })->values(); // Reset keys after filter

        return Inertia::render('Dashboard', [
            'messengers' => $messengersData,
            'dispatch_locations' => DispatchLocation::all(),
            'beetrack_data' => $beetrackData,
        ]);
    }



    public function getMessengerStatus(BeetrackService $beetrack)
    {
        // 1. Get Beetrack Live Data (Cached if possible, but for now live)
        $beetrackData = $beetrack->getDispatchStatus();

        // 2. Get Messengers
        $messengers = Messenger::where('is_active', true)
            ->with([
                'shifts' => function ($q) {
                    $q->whereDate('date', today());
                },
                'lunchLogs' => function ($q) {
                    $q->where('status', 'active')->latest();
                },
                'shiftCompletions' => function ($q) {
                    $q->whereDate('finished_at', today());
                }
            ])->get()
            ->filter(function ($messenger) {
                $shift = $messenger->shifts->first();
                return $shift && $shift->status !== 'absent';
            });

        $now = now();

        // 3. Transform Data
        $messengersData = $messengers->map(function ($m) use ($now, $beetrackData) {
            $shift = $m->shifts->first();

            // Lunch Status
            $log = $m->lunchLogs->first();

            $status = 'Disponible';
            $class = 'status-libre';
            $range = 'Sin horario';

            if ($log) {
                $start = $log->start_time;
                $end = $log->end_time;

                if ($now->between($start, $end)) {
                    $status = 'En Almuerzo';
                    $class = 'status-almuerzo';
                } elseif ($now->greaterThan($end)) {
                    $status = 'Disponible';
                }
                $range = $start->format('h:i A') . ' - ' . $end->format('h:i A');
            }

            // Normalization Helper
            // Beetrack Status
            $beetrackInfo = null;
            $active = null;
            if (isset($beetrackData['activos'])) {
                // Normalization Helper (more aggressive)
                $normalize = function ($str) {
                    if (!$str)
                        return '';
                    return strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $str));
                };

                $active = collect($beetrackData['activos'])->first(function ($item) use ($m, $normalize) {
                    $beetrackPlate = $normalize($item['unidad']);
                    $localPlate = $normalize($m->vehicle);

                    if ($localPlate && $beetrackPlate && $beetrackPlate === $localPlate) {
                        \Log::info("UnifiedController: MATCH FOUND! Messenger: {$m->name}, Plate: {$localPlate}");
                        return true;
                    }
                    return false;
                });
            }
            if ($active) {
                $status = 'En Ruta';
                $class = 'status-en-ruta';
                $beetrackInfo = $active;
            }

            // Finished Status
            $finished = null;
            $completion = $m->shiftCompletions->first();
            if ($completion) {
                $finished = [
                    'hora_cierre' => $completion->finished_at->format('h:i A')
                ];
                $status = 'Finalizado';
                $class = 'pendiente';
            }

            // Find any match (active or free) to override name
            $btMatch = null;
            if (isset($beetrackData['activos']) || isset($beetrackData['libres'])) {
                $allBt = collect($beetrackData['activos'] ?? [])->concat($beetrackData['libres'] ?? []);
                $btMatch = $allBt->first(fn($item) => $normalize($item['unidad'] ?? '') === $normalize($m->vehicle));
            }

            return [
                'id' => $m->id,
                'name' => $btMatch ? ($btMatch['nombre'] ?? $m->name) : $m->name,
                'vehicle' => $m->vehicle,
                'location' => $shift->location ?? 'principal',
                'status' => $status,
                'class_name' => $class,
                'lunch_range' => $range,
                'beetrack_info' => $beetrackInfo,
                'finished_info' => $finished,
                'priority' => ($status === 'En Ruta') ? 2 : 1,
            ];
        })->values();

        return response()->json([
            'messengers' => $messengersData,
            'beetrack_data' => $beetrackData,
            'timestamp' => $now->toDateTimeString()
        ]);
    }
}
