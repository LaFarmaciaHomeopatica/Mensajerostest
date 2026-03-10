<?php

namespace App\Exports;

use App\Models\PreoperationalReport;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Carbon\Carbon;

class PreoperationalReportsExport implements FromCollection, WithHeadings, WithMapping
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
        return PreoperationalReport::with('messenger')
            ->whereDate('created_at', '>=', $this->startDate)
            ->whereDate('created_at', '<=', $this->endDate)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function headings(): array
    {
        return [
            'DNI Mensajero',
            'Sede Mensajero',
            'Vehículo',
            'Nombre Mensajero',
            'Fecha',
            'Hora',
            'Respuestas (JSON)',
            'Respuestas (SÍ)',
            'Respuestas (NO)',
            '¿Llenado a Tiempo?',
            'Observaciones',
        ];
    }

    public function map($report): array
    {
        $shift = $report->messenger->shifts()
            ->where('date', $report->created_at->toDateString())
            ->where('status', '!=', 'absent')
            ->where('status', '!=', 'no_shift')
            ->first();

        $onTime = 'Sin Turno';
        if ($shift) {
            $shiftStart = Carbon::parse($shift->date . ' ' . $shift->start_time);
            if ($report->created_at->lte($shiftStart)) {
                $onTime = 'A Tiempo';
            } else {
                $onTime = 'No';
            }
        }

        $yesCount = 0;
        $noCount = 0;
        if (is_array($report->answers)) {
            foreach ($report->answers as $ans) {
                if ($ans === true || $ans === 'si' || $ans === 'bueno' || $ans === 'SÍ')
                    $yesCount++;
                else if ($ans === false || $ans === 'no' || $ans === 'malo' || $ans === 'NO')
                    $noCount++;
            }
        }

        return [
            $report->messenger->id_card ?? 'N/A',
            $report->messenger->location ?? 'N/A',
            $report->messenger->vehicle ?? 'N/A',
            $report->messenger->name ?? 'N/A',
            $report->created_at->format('d/m/Y'),
            $report->created_at->format('H:i:s'),
            json_encode($report->answers, JSON_UNESCAPED_UNICODE),
            $yesCount,
            $noCount,
            $onTime,
            $report->observations ?? 'Ninguna',
        ];
    }
}
