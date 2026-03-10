<?php

namespace App\Exports;

use App\Models\CleaningReport;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Carbon\Carbon;

class CleaningReportsExport implements FromCollection, WithHeadings, WithMapping
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
        return CleaningReport::with('messenger')
            ->whereDate('created_at', '>=', $this->startDate)
            ->whereDate('created_at', '<=', $this->endDate)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function headings(): array
    {
        return [
            'ID Mensajero',
            'Nombre Mensajero',
            'Vehículo',
            'Elemento',
            'Tipo de Limpieza',
            'Fecha',
            'Hora',
            'Observaciones',
        ];
    }

    public function map($report): array
    {
        return [
            $report->messenger->id_card ?? 'N/A',
            $report->messenger->name ?? 'N/A',
            $report->messenger->vehicle ?? 'N/A',
            $report->item === 'maleta' ? 'Maleta' : 'Motocicleta',
            $report->type === 'semanal_superficial' ? 'Semanal (Superficial)' : 'Mensual (Profunda)',
            $report->created_at->format('d/m/Y'),
            $report->created_at->format('H:i:s'),
            $report->observations ?? 'Ninguna',
        ];
    }
}
