<?php

namespace App\Services;

use App\Models\Messenger;
use App\Services\BeetrackService;
use App\Models\DispatchLocation;

class MessengerStatusService
{
    protected $beetrack;

    public function __construct(BeetrackService $beetrack)
    {
        $this->beetrack = $beetrack;
    }

    public function getFullStatus()
    {
        $beetrackData = $this->beetrack->getDispatchStatus();

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

        $messengersData = $messengers->map(function ($m) use ($now, $beetrackData) {
            $shift = $m->shifts->first();
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

            $normalize = function ($str) {
                if (!$str)
                    return '';
                return strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $str));
            };

            $beetrackInfo = null;
            if (isset($beetrackData['activos'])) {
                $active = collect($beetrackData['activos'])->first(function ($item) use ($m, $normalize) {
                    return $normalize($item['unidad'] ?? '') === $normalize($m->vehicle);
                });

                if ($active) {
                    $status = 'En Ruta';
                    $class = 'status-en-ruta';
                    $beetrackInfo = $active;
                }
            }

            $finished = null;
            $completion = $m->shiftCompletions->first();
            if ($completion) {
                $finished = [
                    'hora_cierre' => $completion->finished_at->format('h:i A')
                ];
                $status = 'Finalizado';
                $class = 'pendiente';
            }

            $btMatch = null;
            if (isset($beetrackData['activos']) || isset($beetrackData['libres'])) {
                $allBt = collect($beetrackData['activos'] ?? [])->concat($beetrackData['libres'] ?? []);
                $btMatch = $allBt->first(fn($item) => $normalize($item['unidad'] ?? '') === $normalize($m->vehicle));
            }

            return [
                'id' => $m->id,
                'name' => $btMatch ? ($btMatch['nombre'] ?? $m->name) : $m->name,
                'vehicle' => $m->vehicle,
                'location' => strtolower($shift->location ?? 'principal'),
                'status' => $status,
                'class_name' => $class,
                'lunch_range' => $range,
                'beetrack_info' => $beetrackInfo,
                'finished_info' => $finished,
                'priority' => ($status === 'En Ruta') ? 2 : 1,
            ];
        })->values();

        return [
            'messengers' => $messengersData,
            'beetrack_data' => $beetrackData,
        ];
    }
}
