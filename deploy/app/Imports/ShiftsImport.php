<?php

namespace App\Imports;

use App\Models\Messenger;
use App\Models\Shift;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ShiftsImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        // Skip if date or name is missing
        if (!isset($row['fecha']) || !isset($row['nombre_mensajero'])) {
            return null;
        }

        try {
            // Find messenger by name (case-insensitive)
            $messenger = Messenger::where('name', 'LIKE', '%' . trim($row['nombre_mensajero']) . '%')->first();

            if (!$messenger) {
                // Log or skip if messenger not found
                return null;
            }

            // Parse Date (Assuming Excel numeric date or Y-m-d)
            $date = $this->transformDate($row['fecha']);

            if (!$date) {
                return null;
            }

            // Status handling
            $status = strtolower(trim($row['estado'] ?? 'presente')) === 'ausente' ? 'absent' : 'present';
            $location = strtolower(trim($row['ubicacion'] ?? 'principal')) === 'teusaquillo' ? 'teusaquillo' : 'principal';

            // Time parsing
            $startTime = null;
            $endTime = null;

            if ($status === 'present') {
                $startTime = $this->transformTime($row['hora_inicio'] ?? '08:00');
                $endTime = $this->transformTime($row['hora_fin'] ?? '17:00');
            }

            return Shift::updateOrCreate(
                [
                    'messenger_id' => $messenger->id,
                    'date' => $date->format('Y-m-d'),
                ],
                [
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'status' => $status,
                    'location' => $location,
                ]
            );

        } catch (\Exception $e) {
            Log::error('Error importing row: ' . json_encode($row) . ' Error: ' . $e->getMessage());
            return null;
        }
    }

    private function transformDate($value)
    {
        try {
            if (is_numeric($value)) {
                return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($value);
            }
            return Carbon::parse($value);
        } catch (\Exception $e) {
            return null;
        }
    }

    private function transformTime($value)
    {
        try {
            if (is_numeric($value)) {
                return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($value)->format('H:i');
            }
            return Carbon::parse($value)->format('H:i');
        } catch (\Exception $e) {
            return '08:00'; // Default fallback
        }
    }
}
