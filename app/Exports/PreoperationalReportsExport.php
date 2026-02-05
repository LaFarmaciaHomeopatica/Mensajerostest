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
    protected $location;
    protected $questions;

    public function __construct($startDate, $endDate, $messengerId = null, $location = null)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->messengerId = $messengerId;
        $this->location = $location;
        // Fetch all questions to ensure we have headers even for inactive ones if they have data
        // For simplicity and consistency with the current active list:
        $this->questions = \App\Models\PreoperationalQuestion::orderBy('order')->get();
    }

    public function collection()
    {
        $query = PreoperationalReport::with('messenger')
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

        if ($this->location && $this->location !== '') {
            $location = $this->location;
            $query->whereExists(function ($q) use ($location) {
                $q->select(\Illuminate\Support\Facades\DB::raw(1))
                    ->from('shifts')
                    ->whereColumn('shifts.messenger_id', 'preoperational_reports.messenger_id')
                    ->whereRaw('DATE(shifts.date) = DATE(preoperational_reports.created_at)')
                    ->where('shifts.location', $location);
            });
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

        $row = [
            $report->created_at->format('Y-m-d H:i:s'),
            $report->messenger->name ?? 'N/A',
            $report->messenger->vehicle ?? 'N/A',
            $shift ? ($shift->location ?? 'principal') : 'N/A',
            $shift ? $shift->start_time : 'Sin turno',
            $compliance,
        ];

        // Add dynamic answers
        foreach ($this->questions as $question) {
            $value = $answers[$question->key] ?? null;
            if ($question->type === 'text') {
                $row[] = $value ?? '-';
            } else {
                $row[] = ($value === true) ? 'SÍ' : (($value === false) ? 'NO' : '-');
            }
        }

        $row[] = $report->observations ?? '-';

        return $row;
    }

    public function headings(): array
    {
        $headers = [
            'Fecha/Hora',
            'Mensajero',
            'Placa',
            'Sede/Ubicación',
            'Hora Ingreso',
            'Cumplimiento',
        ];

        // Add dynamic question labels
        foreach ($this->questions as $question) {
            $headers[] = $question->label;
        }

        $headers[] = 'Observaciones';

        return $headers;
    }
}
