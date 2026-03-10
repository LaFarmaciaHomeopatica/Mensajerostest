<?php

namespace App\Exports;

use App\Models\Shift;
use App\Models\PreoperationalReport;
use App\Models\ShiftCompletion;
use App\Models\LunchLog;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Carbon\Carbon;

class GlobalOperationExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
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
        $start = Carbon::parse($this->startDate)->startOfDay();
        $end = Carbon::parse($this->endDate)->endOfDay();

        // Base query: Shifts
        $shiftsQuery = Shift::with('messenger')
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->whereHas('messenger', function ($q) {
                $q->where('exclude_from_analytics', false);
            });

        if ($this->messengerId) {
            $shiftsQuery->where('messenger_id', $this->messengerId);
        }

        $shifts = $shiftsQuery->orderBy('date', 'desc')
            ->orderBy('messenger_id')
            ->get();

        // Fetch auxiliary data for mapping
        // We could do this per row, but for performance let's fetch in chunks if needed.
        // For now, let's fetch all relevant logs in the range.

        // Fetch auxiliary data with filters applied for performance and accuracy
        $preopQuery = PreoperationalReport::whereBetween('created_at', [$start, $end])
            ->whereHas('messenger', function ($q) {
                $q->where('exclude_from_analytics', false);
            });
        if ($this->messengerId) {
            $preopQuery->where('messenger_id', $this->messengerId);
        }
        $preops = $preopQuery->get()->groupBy(function ($item) {
            return $item->messenger_id . '_' . $item->created_at->toDateString();
        });

        $exitQuery = ShiftCompletion::whereBetween('created_at', [$start, $end])
            ->whereHas('messenger', function ($q) {
                $q->where('exclude_from_analytics', false);
            });
        if ($this->messengerId) {
            $exitQuery->where('messenger_id', $this->messengerId);
        }
        $exits = $exitQuery->get()->groupBy(function ($item) {
            return $item->messenger_id . '_' . $item->created_at->toDateString();
        });

        $lunchQuery = LunchLog::whereBetween('start_time', [$start, $end])
            ->whereHas('messenger', function ($q) {
                $q->where('exclude_from_analytics', false);
            });
        if ($this->messengerId) {
            $lunchQuery->where('messenger_id', $this->messengerId);
        }
        $lunches = $lunchQuery->get()->groupBy(function ($item) {
            return $item->messenger_id . '_' . $item->start_time->toDateString();
        });

        return $shifts->map(function ($shift) use ($preops, $exits, $lunches) {
            $key = $shift->messenger_id . '_' . $shift->date;

            $preop = $preops->get($key)?->first();
            $exit = $exits->get($key)?->first();
            $lunch = $lunches->get($key)?->first();

            return [
                'date' => $shift->date,
                'messenger' => $shift->messenger->name ?? 'N/A',
                'vehicle' => $shift->messenger->vehicle ?? 'N/A',
                'location' => ucfirst($shift->location),
                'shift_start' => $shift->start_time ? substr($shift->start_time, 0, 5) : '-',
                'shift_end' => $shift->end_time ? substr($shift->end_time, 0, 5) : '-',
                'status' => $this->getStatusLabel($shift->status),
                'preop_time' => $preop ? $preop->created_at->format('H:i') : '-',
                'preop_status' => $preop ? ($this->hasIssues($preop) ? 'Con Novedad' : 'OK') : 'No reportado',
                'lunch_start' => $lunch ? $lunch->start_time->format('H:i') : '-',
                'lunch_end' => $lunch && $lunch->end_time ? $lunch->end_time->format('H:i') : '-',
                'lunch_duration' => $lunch && $lunch->end_time ? $lunch->start_time->diffInMinutes($lunch->end_time) . ' min' : '-',
                'exit_time' => $exit ? $exit->created_at->format('H:i') : '-',
            ];
        });
    }

    protected function getStatusLabel($status)
    {
        $labels = [
            'present' => 'Presente',
            'absent' => 'No Asiste',
            'no_shift' => 'Sin Turno',
            'pending' => 'Pendiente'
        ];
        return $labels[$status] ?? $status;
    }

    protected function hasIssues($preop)
    {
        if (!is_array($preop->answers))
            return false;
        foreach ($preop->answers as $ans) {
            if ($ans === false || $ans === 'no' || $ans === 'malo' || $ans === 'NO')
                return true;
        }
        return false;
    }

    public function map($row): array
    {
        return [
            $row['date'],
            $row['messenger'],
            $row['vehicle'],
            $row['location'],
            $row['shift_start'],
            $row['shift_end'],
            $row['status'],
            $row['preop_time'],
            $row['preop_status'],
            $row['lunch_start'],
            $row['lunch_end'],
            $row['lunch_duration'],
            $row['exit_time'],
        ];
    }

    public function headings(): array
    {
        return [
            'Fecha',
            'Mensajero',
            'Placa',
            'Sede',
            'Turno Inicio',
            'Turno Fin',
            'Asistencia',
            'Preoperacional (Hora)',
            'Preoperacional (Estado)',
            'Almuerzo Inicio',
            'Almuerzo Fin',
            'Almuerzo Duración',
            'Reporte Salida',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
