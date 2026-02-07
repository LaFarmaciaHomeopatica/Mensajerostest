<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CalculateMessengerMetrics extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:calculate-messenger-metrics';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting metrics calculation...');
        $today = now();
        $beetrack = app(\App\Services\BeetrackService::class);

        // 1. Get Beetrack Data
        $statusData = $beetrack->getDispatchStatus();

        // Merge active and finished/free messengers
        $allBeetrackData = collect($statusData['activos'] ?? [])->merge($statusData['libres'] ?? []);

        $messengers = \App\Models\Messenger::where('is_active', true)->get();

        foreach ($messengers as $m) {
            $this->info("Processing {$m->name}...");

            // Normalize vehicle for matching
            $normalize = fn($s) => strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $s ?? ''));
            $vehicle = $normalize($m->vehicle);

            $btData = $allBeetrackData->first(function ($item) use ($normalize, $vehicle) {
                return $normalize($item['unidad'] ?? '') === $vehicle;
            });

            if (!$btData) {
                // If no Beetrack data, we might still want to create a record with 0s if they have a shift
                // But generally metrics are about performance on the road.
                // Let's create an empty record to track "No Routes"
                \App\Models\MessengerMetric::updateOrCreate(
                    [
                        'messenger_id' => $m->id,
                        'date' => $today->toDateString()
                    ],
                    [
                        'vehicle_plate' => $m->vehicle,
                        'total_routes' => 0,
                        'total_deliveries' => 0,
                        'successful_deliveries' => 0,
                        'last_synced_at' => now()
                    ]
                );
                continue;
            }

            $metrics = $btData['metrics'] ?? [];

            $totalRoutes = $metrics['routes_count'] ?? 1;
            $isActive = $btData['activo'] ?? false;

            $totalDeliveries = $metrics['total'] ?? 0;
            $successful = $metrics['successful'] ?? 0;
            $failed = $metrics['failed'] ?? 0;

            $rate = ($totalDeliveries > 0) ? round(($successful / $totalDeliveries) * 100, 2) : 0;

            \App\Models\MessengerMetric::updateOrCreate(
                [
                    'messenger_id' => $m->id,
                    'date' => $today->toDateString()
                ],
                [
                    'vehicle_plate' => $m->vehicle,
                    'total_routes' => $totalRoutes,
                    'active_routes' => $isActive ? 1 : 0,
                    'completed_routes' => (!$isActive && $totalRoutes > 0) ? 1 : 0,
                    'total_deliveries' => $totalDeliveries,
                    'successful_deliveries' => $successful,
                    'failed_deliveries' => $failed,
                    'completion_rate' => $rate,
                    'last_synced_at' => now()
                ]
            );
        }

        $this->info('Metrics calculation completed.');
    }
}
