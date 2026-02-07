<?php

namespace App\Exports\Sheets;

use App\Models\PreoperationalReport;
use App\Models\Messenger;
use App\Models\Shift;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;

class PreoperationalSheet implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithTitle
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
        $query = PreoperationalReport::with('messenger')
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
        $compliance = '-';
        $shiftTime = '-';

        // Get shift for this date
        $shift = Shift::where('messenger_id', $report->messenger_id)
            ->whereDate('date', $report->created_at->toDateString())
            ->first();

        if ($shift && $shift->start_time) {
            $shiftTime = $shift->start_time;
            $reportTime = $report->created_at->timezone(config('app.timezone'));
            $shiftStart = Carbon::parse($shift->date)->setTimeFromTimeString($shift->start_time);
            $compliance = $reportTime->lessThan($shiftStart) ? 'A tiempo' : 'Tardío';
        }

        return [
            $report->created_at->format('Y-m-d'),
            $report->messenger->name ?? 'N/A',
            $report->messenger->vehicle ?? 'N/A',
            $report->created_at->format('H:i'),
            $shiftTime,
            $compliance,
        ];
    }

    public function headings(): array
    {
        return [
            'Fecha',
            'Mensajero',
            'Placa',
            'Hora Reporte',
            'Hora Turno',
            'Cumplimiento',
        ];
    }

    public function title(): string
    {
        return 'Preoperacionales';
    }
}
