<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

use Illuminate\Support\Facades\Http;

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$apiKey = "3a36861f3edc3c68d42ad5d3aa72de58e49d22043c102cf22962f77125667556";
$baseUrl = "https://farmaciahom.dispatchtrack.com/api/external/v1/routes";
$today = now()->format('d-m-Y');

echo "Fetching sample route from Beetrack...\n";

$response = Http::timeout(20)->withHeaders([
    'X-AUTH-TOKEN' => $apiKey,
])->get($baseUrl, ['date' => $today]);

if ($response->successful()) {
    $data = $response->json();
    $routes = $data['response']['routes'] ?? [];
    echo "Total routes: " . count($routes) . "\n";

    if (count($routes) > 0) {
        $first = $routes[0];
        echo "Sample Route Data:\n";
        echo "Driver: " . ($first['driver_name'] ?? 'N/A') . "\n";
        echo "Vehicle: " . ($first['truck']['identifier'] ?? 'N/A') . "\n";
        echo "Latitude: " . ($first['latitude'] ?? 'N/A') . "\n";
        echo "Longitude: " . ($first['longitude'] ?? 'N/A') . "\n";
        echo "Truck Latitude: " . ($first['truck']['latitude'] ?? 'N/A') . "\n";
        echo "Truck Longitude: " . ($first['truck']['longitude'] ?? 'N/A') . "\n";

        // Let's check if there are coordinates in ANY route
        $withCoords = 0;
        foreach ($routes as $r) {
            if (($r['latitude'] ?? $r['truck']['latitude'] ?? null)) {
                $withCoords++;
            }
        }
        echo "Routes with coordinates: $withCoords\n";
    }
} else {
    echo "Error: " . $response->status() . "\n";
    echo $response->body() . "\n";
}
