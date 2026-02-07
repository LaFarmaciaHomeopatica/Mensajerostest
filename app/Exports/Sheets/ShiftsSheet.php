<?php

namespace App\Exports\Sheets;

use App\Models\Shift;
use App\Models\Messenger;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;

class ShiftsSheet implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithTitle
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
        $query = Shift::with('messenger')
            ->whereBetween('date', [$this->startDate, $this->endDate]);

        if ($this->messengerId) {
            $query->where('messenger_id', $this->messengerId);
        } else {
            $query->whereIn('messenger_id', Messenger::where('exclude_from_analytics', false)->pluck('id'));
        }

        return $query->orderBy('date', 'desc')->orderBy('messenger_id');
    }

    public function map($shift): array
    {
        return [
            $shift->date,
            $shift->messenger->name ?? 'N/A',
            $shift->messenger->vehicle ?? 'N/A',
            $shift->location ?? 'principal',
            $shift->start_time ?? '-',
            $shift->end_time ?? '-',
            $shift->status ?? 'activo',
        ];
    }

    public function headings(): array
    {
        return [
            'Fecha',
            'Mensajero',
            'Placa',
            'Sede/Ubicación',
            'Hora Inicio',
            'Hora Fin',
            'Estado',
        ];
    }

    public function title(): string
    {
        return 'Turnos';
    }
}
