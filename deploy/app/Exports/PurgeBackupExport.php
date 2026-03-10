<?php

namespace App\Exports;

use App\Models\LunchLog;
use App\Models\ShiftCompletion;
use App\Models\Shift;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Carbon\Carbon;

class PurgeBackupExport implements WithMultipleSheets
{
    protected $startDate;
    protected $endDate;
    protected $tables;

    public function __construct(string $startDate, string $endDate, array $tables)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
        $this->tables = $tables;
    }

    public function sheets(): array
    {
        $sheets = [];

        if (in_array('lunch_logs', $this->tables)) {
            $sheets[] = new LunchLogsSheet($this->startDate, $this->endDate);
        }
        if (in_array('shift_completions', $this->tables)) {
            $sheets[] = new ShiftCompletionsSheet($this->startDate, $this->endDate);
        }
        if (in_array('shifts', $this->tables)) {
            $sheets[] = new ShiftsSheet($this->startDate, $this->endDate);
        }

        return $sheets;
    }
}

// ─── Sheet: Lunch Logs ────────────────────────────────────────────────────────
class LunchLogsSheet implements FromCollection, WithHeadings, WithTitle, ShouldAutoSize
{
    public function __construct(private string $start, private string $end)
    {
    }

    public function title(): string
    {
        return 'Almuerzos';
    }

    public function collection()
    {
        return LunchLog::with('messenger')
            ->whereDate('start_time', '>=', $this->start)
            ->whereDate('start_time', '<=', $this->end)
            ->orderBy('start_time')
            ->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'mensajero' => $r->messenger->name ?? 'N/A',
                'inicio' => $r->start_time?->format('Y-m-d H:i:s'),
                'fin' => $r->end_time?->format('Y-m-d H:i:s'),
                'estado' => $r->status,
                'creado_en' => $r->created_at?->format('Y-m-d H:i:s'),
            ]);
    }

    public function headings(): array
    {
        return ['ID', 'Mensajero', 'Inicio', 'Fin Estimado', 'Estado', 'Creado En'];
    }
}

// ─── Sheet: Shift Completions ─────────────────────────────────────────────────
class ShiftCompletionsSheet implements FromCollection, WithHeadings, WithTitle, ShouldAutoSize
{
    public function __construct(private string $start, private string $end)
    {
    }

    public function title(): string
    {
        return 'Reportes Salida';
    }

    public function collection()
    {
        return ShiftCompletion::with('messenger')
            ->whereDate('finished_at', '>=', $this->start)
            ->whereDate('finished_at', '<=', $this->end)
            ->orderBy('finished_at')
            ->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'mensajero' => $r->messenger->name ?? 'N/A',
                'reporte' => $r->finished_at?->format('Y-m-d H:i:s'),
                'notas' => $r->notes,
                'creado_en' => $r->created_at?->format('Y-m-d H:i:s'),
            ]);
    }

    public function headings(): array
    {
        return ['ID', 'Mensajero', 'Hora Reporte', 'Notas', 'Creado En'];
    }
}

// ─── Sheet: Shifts ────────────────────────────────────────────────────────────
class ShiftsSheet implements FromCollection, WithHeadings, WithTitle, ShouldAutoSize
{
    public function __construct(private string $start, private string $end)
    {
    }

    public function title(): string
    {
        return 'Turnos';
    }

    public function collection()
    {
        return Shift::with('messenger')
            ->whereDate('date', '>=', $this->start)
            ->whereDate('date', '<=', $this->end)
            ->orderBy('date')
            ->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'mensajero' => $r->messenger->name ?? 'N/A',
                'fecha' => $r->date,
                'inicio' => $r->start_time,
                'fin' => $r->end_time,
                'sede' => $r->location,
                'estado' => $r->status,
                'creado_en' => $r->created_at?->format('Y-m-d H:i:s'),
            ]);
    }

    public function headings(): array
    {
        return ['ID', 'Mensajero', 'Fecha', 'Inicio', 'Fin', 'Sede', 'Estado', 'Creado En'];
    }
}
