<?php

namespace App\Exports;

use App\Models\Messenger;
use App\Models\Shift;
use App\Models\PreoperationalReport;
use App\Models\CleaningReport;
use App\Models\LunchLog;
use App\Models\ShiftCompletion;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class ConsolidatedReportExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    protected $startDate;
    protected $endDate;
    protected $messengerId;
    protected $location;

    public function __construct($startDate, $endDate, $messengerId = null, $location = null)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->messengerId = $messengerId;
        $this->location = $location;
    }

    public function collection()
    {
        $period = CarbonPeriod::create($this->startDate, $this->endDate);
        $data = collect();
        $dateStrings = [];

        foreach ($period as $date) {
            $dateStrings[] = $date->toDateString();
        }

        $messengersQuery = Messenger::query()->where('is_active', true)->orderBy('name');

        if ($this->messengerId) {
            $messengersQuery->where('id', $this->messengerId);
        }

        // Apply location filter: only fetch messengers who have a shift in that location for at least one day in the period?
        // Or just filter the daily rows. Filtering daily rows is easier.
        // But to be consistent with the view, if I select a location, I expect to see rows for that location.
        // It's cleaner to fetch all messengers and then filter rows during generation.

        $messengers = $messengersQuery->get();

        foreach ($dateStrings as $date) {
            foreach ($messengers as $messenger) {
                // Fetch daily data for each messenger
                // Ideally this should be eagerly loaded efficiently, but for N days * M messengers it might be heavy.
                // Optimizing: eager load relationships for the whole range for all messengers? 
                // Then filter in memory? 
                // Let's stick to simple queries first or the existing pattern but iterating.
                // Actually, let's keep it simple: one row object per messenger per day.

                // Fetch shift for this date
                $shift = Shift::where('messenger_id', $messenger->id)->whereDate('date', $date)->first();

                // If location filter is on and shift doesn't match/exist, skip
                if ($this->location && (!$shift || $shift->location !== $this->location)) {
                    continue;
                }

                $preop = PreoperationalReport::where('messenger_id', $messenger->id)->whereDate('created_at', $date)->first();
                $cleaning = CleaningReport::where('messenger_id', $messenger->id)->whereDate('created_at', $date)->get();
                $lunch = LunchLog::where('messenger_id', $messenger->id)->whereDate('created_at', $date)->first();
                $shiftEnd = ShiftCompletion::where('messenger_id', $messenger->id)->whereDate('finished_at', $date)->first();

                // Build the row data object
                $row = (object) [
                    'date' => $date,
                    'messenger_name' => $messenger->name,
                    'vehicle' => $messenger->vehicle,
                    'location' => $shift ? $shift->location : 'principal',
                    'shift_start' => $shift ? $shift->start_time : null,
                    'preop' => $preop,
                    'cleaning' => $cleaning,
                    'lunch' => $lunch,
                    'shiftEnd' => $shiftEnd,
                    'shift_obj' => $shift
                ];

                $data->push($row);
            }
        }

        return $data;
    }

    public function map($row): array
    {
        // Calculate Preop Compliance
        $preopStatus = 'No realizado';
        $preopCompliance = '-';
        $preopTime = '-';

        if ($row->preop) {
            $preopStatus = 'Realizado';
            $preopTime = $row->preop->created_at->format('H:i');

            if ($row->shift_obj && $row->shift_obj->start_time) {
                $reportTime = $row->preop->created_at->timezone(config('app.timezone'));
                $shiftStart = Carbon::parse($row->shift_obj->date)->setTimeFromTimeString($row->shift_obj->start_time);
                $preopCompliance = $reportTime->lessThan($shiftStart) ? 'A tiempo' : 'Tardío';
            } else {
                $preopCompliance = $row->shift_obj ? 'Incompleto' : 'Sin turno';
            }
        }

        // Cleaning
        $cleaningStatus = '-';
        if ($row->cleaning && $row->cleaning->count() > 0) {
            $types = $row->cleaning->pluck('type')->unique()->implode(', ');
            $cleaningStatus = "Realizado (" . $row->cleaning->count() . "): $types";
        }

        // Lunch
        $lunchStatus = '-';
        $lunchStart = '-';
        $lunchEnd = '-';
        if ($row->lunch) {
            $lunchStatus = 'En curso';
            if ($row->lunch->end_time) {
                $lunchStatus = 'Completado';
                $lunchEnd = $row->lunch->end_time->format('H:i');
            }
            $lunchStart = $row->lunch->start_time->format('H:i');
        }

        // Shift End
        $shiftEndTime = '-';
        if ($row->shiftEnd) {
            $shiftEndTime = $row->shiftEnd->finished_at->format('H:i');
        }

        return [
            $row->date,
            $row->messenger_name,
            $row->vehicle,
            $row->location,
            $row->shift_start ?? 'Sin turno',
            $preopStatus,
            $preopTime,
            $preopCompliance,
            $cleaningStatus,
            $lunchStatus,
            $lunchStart,
            $lunchEnd,
            $shiftEndTime
        ];
    }

    public function headings(): array
    {
        return [
            'Fecha',
            'Mensajero',
            'Placa',
            'Sede',
            'Hora Turno',
            'Estado Preoperacional',
            'Hora Reporte',
            'Cumplimiento',
            'Limpieza',
            'Estado Almuerzo',
            'Inicio Almuerzo',
            'Fin Almuerzo',
            'Fin Turno'
        ];
    }
}
