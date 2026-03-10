<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Messenger;
use App\Models\Shift;
use App\Models\ShiftCompletion;
use Carbon\Carbon;

class TestExitsSeeder extends Seeder
{
    public function run()
    {
        // Obtener hasta 31 mensajeros activos para crear 31 registros por día
        $messengers = Messenger::where('is_active', true)->take(31)->get();
        if ($messengers->count() === 0) {
            $this->command->info("No hay mensajeros activos para crear registros.");
            return;
        }

        // Necesitamos 300 registros. 300 / 31 = casi 10 días.
        $days = (int) ceil(300 / $messengers->count());
        $startDate = Carbon::today()->subDays($days - 1);

        $totalCreated = 0;

        for ($i = 0; $i < $days; $i++) {
            $currentDate = $startDate->copy()->addDays($i);

            foreach ($messengers as $messenger) {
                if ($totalCreated >= 300) {
                    break 2;
                }

                // 1. Asegurarse que tiene un Shift para la fecha
                Shift::updateOrCreate(
                    [
                        'messenger_id' => $messenger->id,
                        'date' => $currentDate->toDateString(),
                    ],
                    [
                        'start_time' => '07:00',
                        'end_time' => '17:00',
                        'status' => 'assigned',
                        'location' => 'Base'
                    ]
                );

                // 2. Aleatoriamente el turno finaliza entre -30 min (temprano) y +60 min (tarde)
                $diffMinutes = rand(-30, 60);
                $finishedAt = $currentDate->copy()->setTime(17, 0)->addMinutes($diffMinutes);

                // Borramos cualquier ShiftCompletion existente para ese mensajero en esa fecha
                ShiftCompletion::where('messenger_id', $messenger->id)
                    ->whereDate('finished_at', $currentDate->toDateString())
                    ->delete();

                // Creamos el ShiftCompletion
                ShiftCompletion::create([
                    'messenger_id' => $messenger->id,
                    'finished_at' => $finishedAt,
                    'created_at' => $finishedAt,
                    'updated_at' => $finishedAt
                ]);

                $totalCreated++;
            }
        }

        $this->command->info("Se han insertado {$totalCreated} registros de prueba satisfactoriamente.");
    }
}
