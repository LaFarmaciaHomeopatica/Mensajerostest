<?php

namespace App\Exports;

use App\Models\Shift;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class ShiftsExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
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
        return Shift::with('messenger')
            ->whereBetween('date', [$this->startDate, $this->endDate])
            ->orderBy('date')
            ->orderBy('location')
            ->get();
    }

    public function map($shift): array
    {
        return [
            $shift->date,
            $shift->messenger->name ?? 'N/A',
            $shift->start_time ? substr($shift->start_time, 0, 5) : '-',
            $shift->end_time ? substr($shift->end_time, 0, 5) : '-',
            $shift->status === 'present' ? 'Presente' : 'No Asiste',
            ucfirst($shift->location),
        ];
    }

    public function headings(): array
    {
        return [
            'Fecha',
            'Mensajero',
            'Hora Inicio',
            'Hora Fin',
            'Estado',
            'Ubicación',
        ];
    }
}
