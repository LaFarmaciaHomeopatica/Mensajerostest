<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

use App\Models\Messenger;
use Carbon\Carbon;

class ShiftsTemplateExport implements FromArray, WithHeadings, ShouldAutoSize
{
    public function array(): array
    {
        $messengers = Messenger::where('is_active', true)
            ->orderBy('name')
            ->get();

        $rows = [];
        $date = Carbon::tomorrow()->format('Y-m-d'); // Default to tomorrow

        foreach ($messengers as $messenger) {
            $rows[] = [
                $date,
                $messenger->name,
                '08:00', // Default Start
                '17:00', // Default End
                'Presente', // Default Status
                'Principal', // Default Location
            ];
        }

        return $rows;
    }

    public function headings(): array
    {
        return [
            'Fecha',
            'Nombre_Mensajero',
            'Hora_Inicio',
            'Hora_Fin',
            'Estado',
            'Ubicacion'
        ];
    }
}
