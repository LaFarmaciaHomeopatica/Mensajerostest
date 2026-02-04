<?php

namespace App\Exports;

use App\Models\LunchLog;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Carbon\Carbon;

class LunchReportsExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    protected $startDate;
    protected $endDate;

    public function __construct($startDate, $endDate)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function collection()
    {
        return LunchLog::with('messenger')
            ->whereBetween('start_time', [
                Carbon::parse($this->startDate)->startOfDay(),
                Carbon::parse($this->endDate)->endOfDay()
            ])
            ->orderBy('start_time', 'desc')
            ->get();
    }

    public function map($log): array
    {
        return [
            $log->messenger->name ?? 'N/A',
            $log->messenger->vehicle ?? 'N/A',
            $log->start_time->format('Y-m-d'),
            $log->start_time->format('H:i:s'),
            $log->end_time->format('H:i:s'),
            $log->status === 'active' ? 'Activo' : $log->status,
        ];
    }

    public function headings(): array
    {
        return [
            'Mensajero',
            'Placa',
            'Fecha',
            'Hora Inicio',
            'Hora Fin (Est.)',
            'Estado',
        ];
    }
}
