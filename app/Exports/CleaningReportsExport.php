<?php

namespace App\Exports;

use App\Models\CleaningReport;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Carbon\Carbon;

class CleaningReportsExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    protected $startDate;
    protected $endDate;
    protected $messengerId;
    protected $type;

    public function __construct($startDate, $endDate, $messengerId = null, $type = null)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->messengerId = $messengerId;
        $this->type = $type;
    }

    public function collection()
    {
        $query = CleaningReport::with('messenger')
            ->whereHas('messenger', function ($q) {
                $q->where('is_active', true);
            })
            ->whereBetween('created_at', [
                Carbon::parse($this->startDate)->startOfDay(),
                Carbon::parse($this->endDate)->endOfDay()
            ])
            ->orderBy('created_at', 'desc');

        if ($this->messengerId) {
            $query->where('messenger_id', $this->messengerId);
        }

        if ($this->type && $this->type !== '') {
            $query->where('type', $this->type);
        }

        return $query->get();
    }

    public function map($report): array
    {
        $types = [
            'maletas_semanal' => 'Limpieza Maletas (Semanal)',
            'maletas_mensual' => 'Limpieza Maletas (Mensual)',
            'motos_semanal' => 'Limpieza Moto (Semanal)',
            'motos_mensual' => 'Limpieza Moto (Mensual)',
        ];

        $answers = $report->answers;

        return [
            $report->created_at->format('Y-m-d H:i:s'),
            $report->messenger->name ?? 'N/A',
            $report->messenger->vehicle ?? 'N/A',
            $types[$report->type] ?? $report->type,
            (isset($answers['aseo_general']) && $answers['aseo_general'] === true) ? 'SÍ' : 'NO',
            (isset($answers['desinfeccion']) && $answers['desinfeccion'] === true) ? 'SÍ' : 'NO',
            (isset($answers['orden']) && $answers['orden'] === true) ? 'SÍ' : 'NO',
            $report->observations ?? '-',
            asset('storage/' . $report->evidence_path)
        ];
    }

    public function headings(): array
    {
        return [
            'Fecha/Hora',
            'Mensajero',
            'Placa',
            'Tipo de Reporte',
            'Aseo General',
            'Desinfección',
            'Orden',
            'Observaciones',
            'Link Evidencia'
        ];
    }
}
