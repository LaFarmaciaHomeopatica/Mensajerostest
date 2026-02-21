<?php

namespace App\Exports;

use App\Models\Shift;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Carbon\Carbon;

class ExitReportExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
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
        $query = Shift::with(['messenger', 'messenger.shiftCompletions'])
            ->whereBetween('date', [
                Carbon::parse($this->startDate)->toDateString(),
                Carbon::parse($this->endDate)->toDateString()
            ]);

        if ($this->messengerId) {
            $query->where('messenger_id', $this->messengerId);
        }

        return $query->orderBy('date', 'desc')->get();
    }

    public function map($shift): array
    {
        $completion = $shift->messenger->shiftCompletions()
            ->whereDate('finished_at', $shift->date)
            ->first();

        if (!$completion || !$shift->end_time) {
            return [];
        }

        $scheduledEnd = Carbon::parse($shift->date . ' ' . $shift->end_time);
        $actualEnd = Carbon::parse($completion->finished_at);
        $diffMinutes = $scheduledEnd->diffInMinutes($actualEnd, false);

        return [
            $shift->messenger->name,
            $shift->date,
            $scheduledEnd->format('H:i'),
            $actualEnd->format('H:i'),
            $diffMinutes > 0 ? "+$diffMinutes" : $diffMinutes,
            $diffMinutes > 15 ? 'Retraso' : ($diffMinutes < -15 ? 'Anticipado' : 'A Tiempo')
        ];
    }

    public function headings(): array
    {
        return [
            'Mensajero',
            'Fecha',
            'Hora Programada',
            'Hora Reportada',
            'Diferencia (Min)',
            'Estado'
        ];
    }
}
