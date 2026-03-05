<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

use Illuminate\Support\Facades\Http;

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$apiKey = "3a36861f3edc3c68d42ad5d3aa72de58e49d22043c102cf22962f77125667556";
$baseUrl = "https://farmaciahom.dispatchtrack.com/api/external/v1/routes";
$today = now()->format('d-m-Y');

$response = Http::timeout(20)->withHeaders([
    'X-AUTH-TOKEN' => $apiKey,
])->get($baseUrl, ['date' => $today]);

if ($response->successful()) {
    $routes = $response->json()['response']['routes'] ?? [];
    if (count($routes) > 0) {
        file_put_contents(__DIR__ . '/raw_routes_list.json', json_encode($routes[0], JSON_PRETTY_PRINT));
        echo "Saved first route from list to raw_routes_list.json\n";
    } else {
        echo "No routes in list.\n";
    }
} else {
    echo "Error fetching routes.\n";
}
