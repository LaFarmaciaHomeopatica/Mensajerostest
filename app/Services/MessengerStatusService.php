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

    public function getLocalStatus()
    {
        $messengers = Messenger::where('is_active', true)
            ->with([
                'shifts' => function ($q) {
                    $q->whereDate('date', today());
                },
                'lunchLogs' => function ($q) {
                    $q->where('status', 'active')
                        ->whereDate('start_time', today())
                        ->latest();
                },
                'shiftCompletions' => function ($q) {
                    $q->whereDate('finished_at', today());
                }
            ])->get();

        $now = now();

        $messengersData = $messengers->filter(function ($messenger) {
            $shift = $messenger->shifts->first();
            return $shift && $shift->status !== 'absent';
        })
            ->map(fn($m) => $this->formatMessengerData($m, $now))
            ->values();

        return [
            'messengers' => $messengersData,
            'beetrack_data' => null,
        ];
    }

    public function getSingleStatus($messengerId)
    {
        $m = Messenger::with([
            'shifts' => function ($q) {
                $q->whereDate('date', today());
            },
            'lunchLogs' => function ($q) {
                $q->where('status', 'active')
                    ->whereDate('start_time', today())
                    ->latest();
            },
            'shiftCompletions' => function ($q) {
                $q->whereDate('finished_at', today());
            }
        ])->find($messengerId);

        if (!$m)
            return null;

        return $this->formatMessengerData($m);
    }

    public function formatMessengerData($m, $now = null)
    {
        $now = $now ?? now();
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

        $finished = null;
        $completion = $m->shiftCompletions->first();
        if ($completion) {
            $finished = [
                'hora_cierre' => $completion->finished_at->format('h:i A')
            ];
            $status = 'Finalizado';
            $class = 'pendiente';
        }

        $shift_info = 'Sin Turno';
        if ($shift) {
            $start = \Carbon\Carbon::parse($shift->start_time)->format('h:i A');
            $end = \Carbon\Carbon::parse($shift->end_time)->format('h:i A');
            $shift_info = $start . ' - ' . $end;
        }

        return [
            'id' => $m->id,
            'name' => $m->name,
            'vehicle' => $m->vehicle,
            'location' => strtolower($shift->location ?? 'principal'),
            'status' => $status,
            'class_name' => $class,
            'lunch_range' => $range,
            'shift_info' => $shift_info,
            'finished_info' => $finished,
            'beetrack_info' => null, // Placeholder for async load
            'priority' => 1,
            'lat' => null,
            'lng' => null,
        ];
    }

    public function getBeetrackStatus()
    {
        return $this->beetrack->getDispatchStatus();
    }
}
