<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Messenger;
use App\Models\Shift;
use App\Models\PreoperationalReport;
use App\Models\CleaningReport;
use App\Models\LunchLog;
use App\Models\ShiftCompletion;
use App\Models\DispatchLog;
use App\Models\DispatchLocation;
use Carbon\Carbon;

class AnalyticsMockDataSeeder extends Seeder
{
    public function run(): void
    {
        $messengers = Messenger::where('is_active', true)->get();
        if ($messengers->isEmpty()) {
            return;
        }

        $locations = DispatchLocation::all();
        if ($locations->isEmpty()) {
            $locations = collect([
                DispatchLocation::create(['name' => 'Principal', 'prefix' => 'PRIN', 'address' => 'Calle 1 # 2-3']),
                DispatchLocation::create(['name' => 'Norte', 'prefix' => 'NRT', 'address' => 'Av Norte # 4-5']),
            ]);
        }

        $preopKeys = ['luces', 'frenos', 'llantas', 'espejos', 'limpieza', 'cinturon', 'casco', 'chaleco', 'kit_carreteras', 'soat', 'licencia', 'tarjeta_propiedad'];
        $cleaningTypes = ['maletas_semanal', 'maletas_mensual', 'motos_semanal', 'motos_mensual'];

        // Loop for the last 30 days
        for ($i = 30; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);

            // Skip weekends for most messengers if you want realism, but let's keep it simple for now
            // and just seed every day as requested.

            foreach ($messengers as $messenger) {
                // 1. Shift
                $startTime = "08:00";
                $isAbsent = rand(1, 100) > 95; // 5% absenteeism

                $shift = Shift::updateOrCreate(
                    ['messenger_id' => $messenger->id, 'date' => $date->toDateString()],
                    [
                        'start_time' => $startTime,
                        'end_time' => '17:00:00',
                        'status' => $isAbsent ? 'absent' : 'present',
                        'location' => $locations->random()->name
                    ]
                );

                if ($isAbsent)
                    continue;

                // 2. Preoperational Report
                $isLate = rand(1, 10) > 8;
                $reportHour = $isLate ? "08:" . rand(10, 30) : "07:" . rand(45, 59);
                $reportTime = $date->copy()->setTimeFromTimeString($reportHour);

                $answers = [];
                foreach ($preopKeys as $key) {
                    $answers[$key] = rand(1, 100) > 2; // 2% failure rate
                }

                PreoperationalReport::create([
                    'messenger_id' => $messenger->id,
                    'answers' => $answers,
                    'observations' => rand(1, 50) === 1 ? 'Revisión rutinaria con novedad menor' : null,
                    'created_at' => $reportTime,
                    'updated_at' => $reportTime
                ]);

                // 3. Cleaning Report (occassionally - weekly-ish)
                if (rand(1, 100) > 85) {
                    $cType = $cleaningTypes[array_rand($cleaningTypes)];
                    CleaningReport::create([
                        'messenger_id' => $messenger->id,
                        'type' => $cType,
                        'answers' => [
                            'aseo_general' => rand(1, 20) > 1,
                            'desinfeccion' => rand(1, 20) > 1,
                            'orden' => rand(1, 20) > 1
                        ],
                        'evidence_path' => 'cleaning_evidence/mock_' . rand(1, 5) . '.jpg',
                        'observations' => 'Limpieza de rutina ' . $cType,
                        'created_at' => $date->copy()->addHours(rand(9, 16)),
                    ]);
                }

                // 4. Lunch Log
                $lunchStart = $date->copy()->addHours(12)->addMinutes(rand(0, 45));
                $duration = rand(55, 65); // Very centered around 60
                $lunchEnd = $lunchStart->copy()->addMinutes($duration);

                LunchLog::create([
                    'messenger_id' => $messenger->id,
                    'start_time' => $lunchStart,
                    'end_time' => $lunchEnd,
                    'status' => 'finished',
                    'created_at' => $lunchStart,
                ]);

                // 5. Shift Completion
                $finishTime = $date->copy()->addHours(17)->addMinutes(rand(0, 30));
                ShiftCompletion::create([
                    'messenger_id' => $messenger->id,
                    'finished_at' => $finishTime,
                    'created_at' => $finishTime,
                ]);

                // 6. Dispatch Logs
                $numRoutes = rand(1, 4);
                for ($r = 0; $r < $numRoutes; $r++) {
                    DispatchLog::create([
                        'messenger_id' => $messenger->id,
                        'location_id' => $locations->where('name', $shift->location)->first()->id ?? $locations->first()->id,
                        'consecutive' => $shift->location === 'Teusaquillo' ? 'TE' . rand(10000, 99999) : 'WH' . rand(500000, 599999),
                        'guides_count' => rand(5, 35),
                        'date' => $date->toDateString(),
                        'created_at' => $date->copy()->addHours(8 + ($r * 2))->addMinutes(rand(0, 50)),
                    ]);
                }

                // 7. Internal Procedures (Tramites Internos)
                if (rand(1, 10) > 7) {
                    \App\Models\InternalProcedure::create([
                        'messenger_id' => $messenger->id,
                        'description' => 'Trámite de mensajería: ' . ['Cobro de factura', 'Entrega de documentos', 'Gestión bancaria', 'Entrega de medicamentos'][rand(0, 3)],
                        'destination_address' => 'Calle ' . rand(10, 190) . ' # ' . rand(10, 99) . '-' . rand(10, 99),
                        'contact_name' => 'Cliente Mock ' . rand(1, 100),
                        'contact_phone' => '3' . rand(0, 2) . rand(1, 9) . rand(1000000, 9999999),
                        'status' => 'synced',
                        'beetrack_id' => 'BT' . rand(1000000, 9999999),
                        'created_at' => $date->copy()->addHours(rand(9, 16)),
                    ]);
                }
            }
        }
    }
}
