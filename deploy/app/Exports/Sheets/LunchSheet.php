<?php

namespace App\Exports\Sheets;

use App\Models\LunchLog;
use App\Models\Messenger;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;

class LunchSheet implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithTitle
{
    protected $startDate;
    protected $endDate;
    protected $messengerId;

    public function __construct($startDate, $endDate, $messengerId = null)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->messengerId = $messengerId;
    }

    public function query()
    {
        $query = LunchLog::with('messenger')
            ->whereBetween('created_at', [
                Carbon::parse($this->startDate)->startOfDay(),
                Carbon::parse($this->endDate)->endOfDay()
            ]);

        if ($this->messengerId) {
            $query->where('messenger_id', $this->messengerId);
        } else {
            $query->whereIn('messenger_id', Messenger::where('exclude_from_analytics', false)->pluck('id'));
        }

        return $query->orderBy('created_at', 'desc');
    }

    public function map($log): array
    {
        $duration = '-';
        $status = 'En curso';

        if ($log->start_time && $log->end_time) {
            $start = Carbon::parse($log->start_time);
            $end = Carbon::parse($log->end_time);
            $duration = $start->diffInMinutes($end) . ' min';
            $status = 'Completado';
        }

        return [
            $log->created_at->format('Y-m-d'),
            $log->messenger->name ?? 'N/A',
            $log->messenger->vehicle ?? 'N/A',
            $log->start_time ? $log->start_time->format('H:i') : '-',
            $log->end_time ? $log->end_time->format('H:i') : '-',
            $duration,
            $status,
        ];
    }

    public function headings(): array
    {
        return [
            'Fecha',
            'Mensajero',
            'Placa',
            'Inicio Almuerzo',
            'Fin Almuerzo',
            'Duración',
            'Estado',
        ];
    }

    public function title(): string
    {
        return 'Almuerzos';
    }
}
