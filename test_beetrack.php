<?php

require __DIR__ . '/vendor/autoload.php';

use Illuminate\Support\Facades\Http;

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$apiKey = "3a36861f3edc3c68d42ad5d3aa72de58e49d22043c102cf22962f77125667556";
$baseUrl = "https://farmaciahom.dispatchtrack.com/api/external/v1/routes";
$today = date('d-m-Y', strtotime('-1 day')); // Yesterday

echo "🔍 Testing Beetrack API Connection...\n";
echo "📅 Date: {$today}\n\n";

try {
    $response = Http::withHeaders([
        'X-AUTH-TOKEN' => $apiKey,
    ])->get($baseUrl, [
                'date' => $today,
            ]);

    echo "Status Code: " . $response->status() . "\n";

    if (!$response->successful()) {
        echo "❌ API Request Failed!\n";
        echo "Body: " . $response->body() . "\n";
        exit(1);
    }

    $data = $response->json();
    $routes = $data['response']['routes'] ?? [];

    echo "✅ API Connection Successful!\n";
    echo "📊 Total Routes Today: " . count($routes) . "\n\n";

    // Count routes per messenger
    $messengerRoutes = [];

    foreach ($routes as $route) {
        $driverName = $route['driver_name'] ?? $route['driver_identifier'] ?? 'Unknown';
        $routeId = $route['id'] ?? 'N/A';
        $startedAt = $route['started_at'] ?? null;
        $endedAt = $route['ended_at'] ?? null;
        $vehicle = $route['truck']['identifier'] ?? 'N/A';

        if (!isset($messengerRoutes[$driverName])) {
            $messengerRoutes[$driverName] = [
                'total_routes' => 0,
                'active_routes' => 0,
                'finished_routes' => 0,
                'vehicle' => $vehicle,
            ];
        }

        $messengerRoutes[$driverName]['total_routes']++;

        if ($startedAt && !$endedAt) {
            $messengerRoutes[$driverName]['active_routes']++;
        } elseif ($endedAt) {
            $messengerRoutes[$driverName]['finished_routes']++;
        }
    }

    echo "═══════════════════════════════════════════════════════════════\n";
    echo "RESUMEN DE RUTAS POR MENSAJERO\n";
    echo "═══════════════════════════════════════════════════════════════\n\n";

    foreach ($messengerRoutes as $name => $data) {
        echo "👤 {$name} ({$data['vehicle']})\n";
        echo "   Total Rutas: {$data['total_routes']}\n";
        echo "   Activas: {$data['active_routes']}\n";
        echo "   Finalizadas: {$data['finished_routes']}\n";
        echo "\n";
    }

} catch (\Exception $e) {
    echo "❌ Exception: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
