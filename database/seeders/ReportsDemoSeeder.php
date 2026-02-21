<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Messenger;
use App\Models\Shift;
use Carbon\Carbon;

class ReportsDemoSeeder extends Seeder
{
    public function run(): void
    {
        $messengers = Messenger::where('is_active', true)->get();

        if ($messengers->isEmpty()) {
            $this->command->warn('No hay mensajeros activos. Saltando seeder.');
            return;
        }

        $this->command->info("Generando datos ficticios para {$messengers->count()} mensajeros (últimos 60 días)...");

        $lunchRows = [];
        $exitRows = [];
        $now = now();
        $startDate = Carbon::now()->subDays(60)->startOfDay();
        $endDate = Carbon::now()->subDay()->endOfDay();

        // Pre-load existing lunch dates per messenger to avoid duplicates
        $existingLunch = DB::table('lunch_logs')
            ->whereDate('start_time', '>=', $startDate)
            ->get(['messenger_id', DB::raw('DATE(start_time) as day')])
            ->groupBy('messenger_id')
            ->map(fn($rows) => $rows->pluck('day')->flip());

        // Pre-load existing exit dates per messenger
        $existingExit = DB::table('shift_completions')
            ->whereDate('finished_at', '>=', $startDate)
            ->get(['messenger_id', DB::raw('DATE(finished_at) as day')])
            ->groupBy('messenger_id')
            ->map(fn($rows) => $rows->pluck('day')->flip());

        // Pre-load shifts indexed by [messenger_id][date]
        $shifts = Shift::whereDate('date', '>=', $startDate)
            ->whereDate('date', '<=', $endDate)
            ->get()
            ->groupBy('messenger_id')
            ->map(fn($rows) => $rows->keyBy(fn($s) => Carbon::parse($s->date)->format('Y-m-d')));

        for ($d = $startDate->copy(); $d->lte($endDate); $d->addDay()) {
            if ($d->isSunday())
                continue;
            $dateStr = $d->format('Y-m-d');

            foreach ($messengers as $messenger) {
                // --- Lunch ---
                $alreadyHasLunch = isset($existingLunch[$messenger->id][$dateStr]);
                if (!$alreadyHasLunch && rand(1, 100) <= 85) {
                    $hour = rand(11, 14);
                    $minute = rand(0, 59);
                    $start = $d->copy()->setTime($hour, $minute, 0);
                    $duration = $messenger->lunch_duration ?? 45;
                    $end = $start->copy()->addMinutes($duration);

                    $lunchRows[] = [
                        'messenger_id' => $messenger->id,
                        'start_time' => $start->toDateTimeString(),
                        'end_time' => $end->toDateTimeString(),
                        'status' => 'completed',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }

                // --- Shift Completion ---
                $alreadyHasExit = isset($existingExit[$messenger->id][$dateStr]);
                if (!$alreadyHasExit) {
                    $shift = $shifts[$messenger->id][$dateStr] ?? null;
                    if ($shift && $shift->end_time) {
                        [$h, $m] = explode(':', substr($shift->end_time, 0, 5));
                        $scheduled = $d->copy()->setTime((int) $h, (int) $m, 0);
                        $deviation = rand(-15, 300);
                        $actual = $scheduled->copy()->addMinutes($deviation);

                        $exitRows[] = [
                            'messenger_id' => $messenger->id,
                            'finished_at' => $actual->toDateTimeString(),
                            'notes' => null,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ];
                    }
                }
            }
        }

        // Bulk insert in chunks of 500
        foreach (array_chunk($lunchRows, 500) as $chunk) {
            DB::table('lunch_logs')->insert($chunk);
        }
        foreach (array_chunk($exitRows, 500) as $chunk) {
            DB::table('shift_completions')->insert($chunk);
        }

        $this->command->info("✓ " . count($lunchRows) . " registros de almuerzo insertados.");
        $this->command->info("✓ " . count($exitRows) . " registros de salida insertados.");
    }
}
