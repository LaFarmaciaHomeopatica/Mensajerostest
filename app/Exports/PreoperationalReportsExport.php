<?php

namespace App\Exports;

use App\Models\PreoperationalReport;
use App\Models\Shift;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Carbon\Carbon;

class PreoperationalReportsExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
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

    public function collection()
    {
        $query = PreoperationalReport::with('messenger')
            ->whereBetween('created_at', [
                Carbon::parse($this->startDate)->startOfDay(),
                Carbon::parse($this->endDate)->endOfDay()
            ])
            ->orderBy('created_at', 'desc');

        if ($this->messengerId) {
            $query->where('messenger_id', $this->messengerId);
        }

        return $query->get();
    }

    public function map($report): array
    {
        // Find shift for the same date
        $shift = Shift::where('messenger_id', $report->messenger_id)
            ->whereDate('date', $report->created_at->format('Y-m-d'))
            ->first();

        $compliance = 'N/A';
        if ($shift) {
            $reportTime = Carbon::parse($report->created_at);
            $shiftDateTime = Carbon::parse($shift->date . ' ' . $shift->start_time);
            $compliance = $reportTime->lessThan($shiftDateTime) ? 'A tiempo' : 'Tardío';
        }

        $answers = $report->answers;

        return [
            $report->created_at->format('Y-m-d H:i:s'),
            $report->messenger->name ?? 'N/A',
            $report->messenger->vehicle ?? 'N/A',
            $shift ? $shift->start_time : 'Sin turno',
            $compliance,
            ($answers['luces'] ?? false) ? 'SÍ' : 'NO',
            ($answers['frenos'] ?? false) ? 'SÍ' : 'NO',
            ($answers['llantas'] ?? false) ? 'SÍ' : 'NO',
            ($answers['espejos'] ?? false) ? 'SÍ' : 'NO',
            ($answers['cinturon'] ?? false) ? 'SÍ' : 'NO',
            ($answers['casco'] ?? false) ? 'SÍ' : 'NO',
            ($answers['chaleco'] ?? false) ? 'SÍ' : 'NO',
            ($answers['soat'] ?? false) ? 'SÍ' : 'NO',
            ($answers['licencia'] ?? false) ? 'SÍ' : 'NO',
            ($answers['tarjeta_propiedad'] ?? false) ? 'SÍ' : 'NO',
            ($answers['kit_carreteras'] ?? false) ? 'SÍ' : 'NO',
            ($answers['limpieza'] ?? false) ? 'SÍ' : 'NO',
            $report->observations ?? '-',
        ];
    }

    public function headings(): array
    {
        return [
            'Fecha/Hora',
            'Mensajero',
            'Placa',
            'Hora Ingreso',
            'Cumplimiento',
            'Luces',
            'Frenos',
            'Llantas',
            'Espejos',
            'Cinturón',
            'Casco',
            'Chaleco',
            'SOAT',
            'Licencia',
            'Tarjeta Propiedad',
            'Kit Carreteras',
            'Limpieza',
            'Observaciones',
        ];
    }
}
