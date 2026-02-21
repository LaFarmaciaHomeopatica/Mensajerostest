<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

use Illuminate\Support\Facades\Http;

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$apiKey = "3a36861f3edc3c68d42ad5d3aa72de58e49d22043c102cf22962f77125667556";
$baseUrl = "https://farmaciahom.dispatchtrack.com/api/external/v1/routes";
$today = now()->format('d-m-Y');

echo "Fetching active routes...\n";

$response = Http::timeout(20)->withHeaders([
    'X-AUTH-TOKEN' => $apiKey,
])->get($baseUrl, ['date' => $today]);

if ($response->successful()) {
    $routes = $response->json()['response']['routes'] ?? [];
    $active = null;
    foreach ($routes as $r) {
        if (($r['started_at'] ?? null) && !($r['ended_at'] ?? null)) {
            $active = $r;
            break;
        }
    }

    if ($active) {
        $id = $active['id'];
        echo "Fetching details for route $id...\n";
        $detailResp = Http::timeout(10)->withHeaders(['X-AUTH-TOKEN' => $apiKey])->get("$baseUrl/$id");
        if ($detailResp->successful()) {
            $details = $detailResp->json()['response'] ?? [];
            file_put_contents(__DIR__ . '/route_details_structure.json', json_encode($details, JSON_PRETTY_PRINT));
            echo "Details saved to route_details_structure.json\n";
        } else {
            echo "Failed to fetch details for route $id\n";
            file_put_contents(__DIR__ . '/route_details_structure.json', json_encode($active, JSON_PRETTY_PRINT));
            echo "Saved raw route object instead.\n";
        }
    } else {
        echo "No active routes found.\n";
    }
} else {
    echo "Error: " . $response->status() . "\n";
}
