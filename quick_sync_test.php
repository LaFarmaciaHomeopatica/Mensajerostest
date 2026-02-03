<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\BeetrackService;
use App\Models\Messenger;
use App\Models\MessengerMetric;

$beetrack = new BeetrackService();
$date = '02-02-2026';

echo "🔄 Quick sync test for first 3 messengers...\n";
echo "📅 Date: {$date}\n\n";

$result = $beetrack->getDetailedMetrics($date);

if ($result['status'] !== 'success') {
    echo "❌ Failed: " . ($result['message'] ?? 'Unknown error') . "\n";
    exit(1);
}

$metrics = array_slice($result['metrics'], 0, 3); // Only first 3

foreach ($metrics as $metric) {
    echo "👤 {$metric['driver_name']} ({$metric['vehicle_plate']})\n";
    echo "   Rutas: {$metric['total_routes']}\n";
    echo "   Entregas: {$metric['total_deliveries']}\n";
    echo "   Exitosas: {$metric['successful_deliveries']}\n";
    echo "   A tiempo: {$metric['on_time_deliveries']}\n";
    echo "   Tarde: {$metric['late_deliveries']}\n";
    echo "   Tasa a tiempo: {$metric['on_time_rate']}%\n";
    echo "\n";

    // Try to save to DB
    $messenger = Messenger::where('name', 'LIKE', '%' . $metric['driver_name'] . '%')->first();
    if ($messenger) {
        MessengerMetric::updateOrCreate(
            [
                'date' => '2026-02-02',
                'messenger_id' => $messenger->id,
            ],
            [
                'vehicle_plate' => $metric['vehicle_plate'],
                'total_routes' => $metric['total_routes'],
                'completed_routes' => $metric['completed_routes'],
                'active_routes' => $metric['active_routes'],
                'avg_time_per_route' => $metric['avg_time_per_route'],
                'total_deliveries' => $metric['total_deliveries'],
                'successful_deliveries' => $metric['successful_deliveries'],
                'failed_deliveries' => $metric['failed_deliveries'],
                'on_time_deliveries' => $metric['on_time_deliveries'],
                'late_deliveries' => $metric['late_deliveries'],
                'completion_rate' => $metric['completion_rate'],
                'on_time_rate' => $metric['on_time_rate'],
                'last_synced_at' => now(),
            ]
        );
        echo "   ✅ Saved to DB (messenger_id: {$messenger->id})\n\n";
    } else {
        echo "   ⚠️  Messenger not found in DB\n\n";
    }
}

echo "✅ Quick test complete!\n";
