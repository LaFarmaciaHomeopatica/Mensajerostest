<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Messenger;
use App\Models\Shift;
use App\Models\PreoperationalReport;
use App\Models\PreoperationalQuestion;
use App\Models\CleaningReport;
use App\Models\LunchLog;
use App\Models\ShiftCompletion;
use Carbon\Carbon;

class MassiveDataSeeder extends Seeder
{
    public function run()
    {
        $messengers = Messenger::where('is_active', true)->get();
        if ($messengers->isEmpty()) {
            $messengers = Messenger::all();
        }

        if ($messengers->isEmpty())
            return;

        $questions = PreoperationalQuestion::where('active', true)->get();
        if ($questions->isEmpty()) {
            // Create some dummy questions if none exist
            PreoperationalQuestion::create(['category' => 'General', 'label' => '¿Casco en buen estado?', 'key' => 'helmet', 'active' => true, 'order' => 1]);
            PreoperationalQuestion::create(['category' => 'Mecánica', 'label' => '¿Frenos funcionando?', 'key' => 'brakes', 'active' => true, 'order' => 2]);
            $questions = PreoperationalQuestion::all();
        }

        $items = ['maleta', 'moto'];
        $cleanTypes = ['semanal_superficial', 'mensual_profunda'];

        $startDate = Carbon::now()->subDays(30);
        $endDate = Carbon::now();

        // Clear tables to start fresh
        Shift::truncate();
        PreoperationalReport::truncate();
        CleaningReport::truncate();
        LunchLog::truncate();
        ShiftCompletion::truncate();

        for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
            // Skip Sundays usually? Let's say 80% of messengers work on any given day
            foreach ($messengers as $messenger) {
                if (rand(1, 100) > 85)
                    continue; // 15% absenteeism simulation

                $dateStr = $date->toDateString();

                // 1. Create Shift
                $startTimeStr = sprintf('%02d:00:00', rand(6, 9));
                $endTimeStr = sprintf('%02d:00:00', rand(16, 20));

                Shift::create([
                    'messenger_id' => $messenger->id,
                    'date' => $dateStr,
                    'start_time' => $startTimeStr,
                    'end_time' => $endTimeStr,
                    'status' => 'completed',
                    'location' => 'principal'
                ]);

                // 2. Preoperational (90% compliance)
                if (rand(1, 100) <= 90) {
                    // Punctuality: 70% on time, 30% late
                    $isLate = rand(1, 100) > 70;
                    $shiftStart = Carbon::parse($dateStr . ' ' . $startTimeStr);

                    if ($isLate) {
                        $prepTime = $shiftStart->copy()->addMinutes(rand(5, 45));
                    } else {
                        $prepTime = $shiftStart->copy()->subMinutes(rand(5, 30));
                    }

                    $answers = [];
                    foreach ($questions as $q) {
                        $answers[$q->key] = rand(1, 100) > 5 ? 'yes' : 'no';
                    }

                    PreoperationalReport::create([
                        'messenger_id' => $messenger->id,
                        'answers' => $answers,
                        'observations' => $isLate ? 'Llegué un poco tarde por tráfico' : null,
                        'created_at' => $prepTime,
                        'updated_at' => $prepTime,
                    ]);
                }

                // 3. Lunch Log (95% coverage)
                if (rand(1, 100) <= 95) {
                    $lunchStart = Carbon::parse($dateStr . ' ' . rand(12, 14) . ':' . rand(0, 59) . ':00');
                    $lunchEnd = $lunchStart->copy()->addMinutes(rand(30, 60));

                    LunchLog::create([
                        'messenger_id' => $messenger->id,
                        'start_time' => $lunchStart,
                        'end_time' => $lunchEnd,
                        'status' => 'completed',
                        'created_at' => $lunchStart,
                        'updated_at' => $lunchEnd,
                    ]);
                }

                // 4. Cleaning Report (15% chance per day)
                if (rand(1, 100) <= 15) {
                    $cleanTime = Carbon::parse($dateStr . ' ' . rand(9, 17) . ':00:00');
                    CleaningReport::create([
                        'messenger_id' => $messenger->id,
                        'item' => $items[array_rand($items)],
                        'type' => $cleanTypes[array_rand($cleanTypes)],
                        'observations' => 'Limpieza de rutina',
                        'created_at' => $cleanTime,
                        'updated_at' => $cleanTime,
                    ]);
                }

                // 5. Shift Completion (Final de turno) (85% coverage)
                if (rand(1, 100) <= 85) {
                    $endTime = Carbon::parse($dateStr . ' ' . $endTimeStr);
                    ShiftCompletion::create([
                        'messenger_id' => $messenger->id,
                        'finished_at' => $endTime,
                        'created_at' => $endTime,
                        'updated_at' => $endTime,
                    ]);
                }
            }
        }
    }
}
