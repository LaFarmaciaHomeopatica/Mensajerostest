<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

use Illuminate\Support\Facades\Http;

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$apiKey = "3a36861f3edc3c68d42ad5d3aa72de58e49d22043c102cf22962f77125667556";
$baseUrl = "https://farmaciahom.dispatchtrack.com/api/external/v1/gps";
$today = now()->format('d-m-Y');

echo "Fetching GPS data for $today...\n";

$response = Http::timeout(30)->withHeaders([
    'X-AUTH-TOKEN' => $apiKey,
])->get($baseUrl, ['date' => $today]);

if ($response->successful()) {
    $data = $response->json();
    file_put_contents(__DIR__ . '/beetrack_gps_response.json', json_encode($data, JSON_PRETTY_PRINT));
    echo "GPS data saved to beetrack_gps_response.json\n";

    $gpsPoints = $data['response']['gps'] ?? [];
    echo "Total GPS points: " . count($gpsPoints) . "\n";

    if (count($gpsPoints) > 0) {
        $first = $gpsPoints[0];
        echo "Sample GPS Point:\n";
        print_r($first);
    }
} else {
    echo "Error: " . $response->status() . "\n";
    echo $response->body() . "\n";
}
