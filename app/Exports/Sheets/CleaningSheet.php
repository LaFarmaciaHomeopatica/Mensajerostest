<?php

namespace App\Exports\Sheets;

use App\Models\CleaningReport;
use App\Models\Messenger;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;

class CleaningSheet implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithTitle
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
        $query = CleaningReport::with('messenger')
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

    public function map($report): array
    {
        return [
            $report->created_at->format('Y-m-d'),
            $report->messenger->name ?? 'N/A',
            $report->messenger->vehicle ?? 'N/A',
            $report->type ?? '-',
            $report->created_at->format('H:i'),
        ];
    }

    public function headings(): array
    {
        return [
            'Fecha',
            'Mensajero',
            'Placa',
            'Tipo de Limpieza',
            'Hora',
        ];
    }

    public function title(): string
    {
        return 'Limpieza';
    }
}
