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
    protected $questions;

    public function __construct($startDate, $endDate, $messengerId = null)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->messengerId = $messengerId;
        // Fetch all questions to ensure we have headers even for inactive ones if they have data
        // For simplicity and consistency with the current active list:
        $this->questions = \App\Models\PreoperationalQuestion::orderBy('order')->get();
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

        $row = [
            $report->created_at->format('Y-m-d H:i:s'),
            $report->messenger->name ?? 'N/A',
            $report->messenger->vehicle ?? 'N/A',
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
