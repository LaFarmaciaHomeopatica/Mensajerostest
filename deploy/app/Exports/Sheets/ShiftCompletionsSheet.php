<?php

namespace App\Exports\Sheets;

use App\Models\ShiftCompletion;
use App\Models\Messenger;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;

class ShiftCompletionsSheet implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithTitle
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
        $query = ShiftCompletion::with('messenger')
            ->whereBetween('finished_at', [
                Carbon::parse($this->startDate)->startOfDay(),
                Carbon::parse($this->endDate)->endOfDay()
            ]);

        if ($this->messengerId) {
            $query->where('messenger_id', $this->messengerId);
        } else {
            $query->whereIn('messenger_id', Messenger::where('exclude_from_analytics', false)->pluck('id'));
        }

        return $query->orderBy('finished_at', 'desc');
    }

    public function map($completion): array
    {
        return [
            $completion->finished_at->format('Y-m-d'),
            $completion->messenger->name ?? 'N/A',
            $completion->messenger->vehicle ?? 'N/A',
            $completion->finished_at->format('H:i'),
        ];
    }

    public function headings(): array
    {
        return [
            'Fecha',
            'Mensajero',
            'Placa',
            'Hora Fin Turno',
        ];
    }

    public function title(): string
    {
        return 'Fin de Turno';
    }
}
