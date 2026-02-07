<?php

namespace App\Exports\Sheets;

use App\Models\InternalProcedure;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;

class InternalProceduresSheet implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithTitle
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
        $query = InternalProcedure::with('messenger')
            ->whereBetween('created_at', [
                Carbon::parse($this->startDate)->startOfDay(),
                Carbon::parse($this->endDate)->endOfDay()
            ]);

        if ($this->messengerId) {
            $query->where('messenger_id', $this->messengerId);
        }

        return $query->orderBy('created_at', 'desc');
    }

    public function map($procedure): array
    {
        $statusLabels = [
            'created' => 'Creado',
            'synced' => 'Sincronizado',
            'failed' => 'Error',
        ];

        return [
            $procedure->created_at->format('Y-m-d H:i'),
            $procedure->code,
            $procedure->messenger->name ?? 'No asignado',
            $procedure->item_name ?? '-',
            $procedure->destination_address,
            $procedure->destination_city ?? '-',
            $procedure->contact_name,
            $procedure->contact_phone ?? '-',
            $statusLabels[$procedure->status] ?? $procedure->status,
            $procedure->beetrack_id ?? '-',
        ];
    }

    public function headings(): array
    {
        return [
            'Fecha Creación',
            'Código',
            'Mensajero',
            'Acción',
            'Destino',
            'Ciudad',
            'Contacto',
            'Teléfono',
            'Estado',
            'ID Beetrack',
        ];
    }

    public function title(): string
    {
        return 'Trámites Internos';
    }
}
