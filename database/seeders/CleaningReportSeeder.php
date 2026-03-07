<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CleaningReport;
use App\Models\Messenger;
use Carbon\Carbon;

class CleaningReportSeeder extends Seeder
{
    public function run()
    {
        // Only use active messengers to ensure they show up in the reports
        $messengers = Messenger::where('is_active', true)->get();

        if ($messengers->isEmpty()) {
            // If no active messengers, use any messenger
            $messengers = Messenger::all();
        }

        if ($messengers->isEmpty()) {
            return;
        }

        $items = ['maleta', 'moto'];
        $types = ['semanal_superficial', 'mensual_profunda'];
        $observations = [
            'Todo bien',
            'Se realizó limpieza profunda en las costuras',
            'Limpieza de rines y cadena',
            'La maleta tiene un pequeño roto, pero se limpió bien',
            'Se usó jabón desengrasante',
            'Uso de silicona para plásticos',
            'Limpieza de maleta interior y exterior',
            'Messenger realizó el aseo completo',
        ];

        // Clear existing to avoid confusion
        CleaningReport::truncate();

        for ($i = 0; $i < 50; $i++) {
            $messenger = $messengers->random();
            $item = $items[array_rand($items)];
            $type = $types[array_rand($types)];

            // Generate more records for "today" to ensure visibility
            if ($i < 10) {
                $date = Carbon::now();
            } else {
                $date = Carbon::now()->subDays(rand(0, 15))->subHours(rand(0, 23))->subMinutes(rand(0, 59));
            }

            CleaningReport::create([
                'messenger_id' => $messenger->id,
                'item' => $item,
                'type' => $type,
                'observations' => $observations[array_rand($observations)] ?? null,
                'created_at' => $date,
                'updated_at' => $date,
            ]);
        }
    }
}
