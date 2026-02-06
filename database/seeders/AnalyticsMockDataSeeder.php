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

        // Loop for the last 7 days
        for ($i = 7; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);

            foreach ($messengers as $messenger) {
                // 1. Shift
                $startTime = "08:00";
                $shift = Shift::updateOrCreate(
                    ['messenger_id' => $messenger->id, 'date' => $date->toDateString()],
                    [
                        'start_time' => $startTime,
                        'status' => rand(1, 10) > 1 ? 'present' : 'absent',
                        'location' => $locations->random()->name
                    ]
                );

                if ($shift->status !== 'present')
                    continue;

                // 2. Preoperational Report
                $isLate = rand(1, 10) > 8;
                $reportHour = $isLate ? "08:" . rand(10, 30) : "07:" . rand(45, 59);
                $reportTime = $date->copy()->setTimeFromTimeString($reportHour);

                $answers = [];
                foreach ($preopKeys as $key) {
                    $answers[$key] = rand(1, 20) > 1; // 5% failure rate
                }

                PreoperationalReport::create([
                    'messenger_id' => $messenger->id,
                    'answers' => $answers,
                    'observations' => rand(1, 10) > 8 ? 'Revisión rutinaria con novedad menor' : null,
                    'created_at' => $reportTime,
                    'updated_at' => $reportTime
                ]);

                // 3. Cleaning Report (occassionally)
                if (rand(1, 10) > 7) {
                    $cType = $cleaningTypes[array_rand($cleaningTypes)];
                    CleaningReport::create([
                        'messenger_id' => $messenger->id,
                        'type' => $cType,
                        'answers' => [
                            'aseo_general' => rand(1, 10) > 1,
                            'desinfeccion' => rand(1, 10) > 1,
                            'orden' => rand(1, 10) > 1
                        ],
                        'evidence_path' => 'evidence/mock.jpg',
                        'observations' => 'Limpieza de ejemplo',
                        'created_at' => $date->copy()->addHours(rand(9, 17)),
                    ]);
                }

                // 4. Lunch Log
                $lunchStart = $date->copy()->addHours(12)->addMinutes(rand(0, 60));
                $duration = rand(45, 75); // Some > 60 mins
                $lunchEnd = $lunchStart->copy()->addMinutes($duration);

                LunchLog::create([
                    'messenger_id' => $messenger->id,
                    'start_time' => $lunchStart,
                    'end_time' => $lunchEnd,
                    'status' => 'finished',
                    'created_at' => $lunchStart,
                ]);

                // 5. Shift Completion
                $finishTime = $date->copy()->addHours(17)->addMinutes(rand(0, 60));
                ShiftCompletion::create([
                    'messenger_id' => $messenger->id,
                    'finished_at' => $finishTime,
                ]);

                // 6. Dispatch Logs
                $numRoutes = rand(1, 3);
                for ($r = 0; $r < $numRoutes; $r++) {
                    DispatchLog::create([
                        'messenger_id' => $messenger->id,
                        'location_id' => $locations->where('name', $shift->location)->first()->id ?? $locations->first()->id,
                        'consecutive' => 'MOCK-' . rand(1000, 9999),
                        'guides_count' => rand(5, 25),
                        'date' => $date->toDateString(),
                    ]);
                }
            }
        }
    }
}
