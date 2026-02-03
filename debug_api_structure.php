<?php

require __DIR__ . '/vendor/autoload.php';

use Illuminate\Support\Facades\Http;

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$apiKey = "3a36861f3edc3c68d42ad5d3aa72de58e49d22043c102cf22962f77125667556";
$baseUrl = "https://farmaciahom.dispatchtrack.com/api/external/v1/routes";
$date = '02-02-2026'; // Yesterday

echo "🔍 Debugging DispatchTrack API Response Structure\n";
echo "📅 Date: {$date}\n\n";

try {
    // 1. Fetch routes
    $response = Http::withHeaders([
        'X-AUTH-TOKEN' => $apiKey,
    ])->get($baseUrl, [
                'date' => $date,
            ]);

    if (!$response->successful()) {
        echo "❌ Failed to fetch routes\n";
        exit(1);
    }

    $data = $response->json();
    $routes = $data['response']['routes'] ?? [];

    echo "✅ Found " . count($routes) . " routes\n\n";

    // 2. Get details for the first route
    if (!empty($routes)) {
        $firstRoute = $routes[0];
        $routeId = $firstRoute['id'] ?? null;

        echo "📋 First Route Details:\n";
        echo "   ID: {$routeId}\n";
        echo "   Driver: " . ($firstRoute['driver_name'] ?? 'N/A') . "\n";
        echo "   Started: " . ($firstRoute['started_at'] ?? 'N/A') . "\n";
        echo "   Ended: " . ($firstRoute['ended_at'] ?? 'N/A') . "\n\n";

        // 3. Fetch detailed route information
        if ($routeId) {
            echo "🔍 Fetching detailed route information for route {$routeId}...\n\n";

            $detailUrl = "{$baseUrl}/{$routeId}";
            $detailResp = Http::withHeaders([
                'X-AUTH-TOKEN' => $apiKey,
            ])->get($detailUrl);

            if ($detailResp->successful()) {
                $routeDetail = $detailResp->json()['response'] ?? [];

                echo "📦 Route Detail Structure:\n";
                echo json_encode($routeDetail, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

                // Check for dispatches
                $dispatches = $routeDetail['dispatches'] ?? [];
                echo "📊 Dispatches Found: " . count($dispatches) . "\n\n";

                if (!empty($dispatches)) {
                    echo "📋 First Dispatch Structure:\n";
                    echo json_encode($dispatches[0], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

                    // List all available fields
                    echo "📝 Available Fields in Dispatch:\n";
                    foreach (array_keys($dispatches[0]) as $key) {
                        echo "   - {$key}\n";
                    }
                } else {
                    echo "⚠️  No dispatches found in route detail!\n";
                    echo "Available keys in route detail:\n";
                    foreach (array_keys($routeDetail) as $key) {
                        echo "   - {$key}\n";
                    }
                }
            } else {
                echo "❌ Failed to fetch route details\n";
                echo "Status: " . $detailResp->status() . "\n";
                echo "Body: " . $detailResp->body() . "\n";
            }
        }
    }

} catch (\Exception $e) {
    echo "❌ Exception: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
