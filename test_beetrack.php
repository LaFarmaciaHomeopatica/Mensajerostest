<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$service = new \App\Services\BeetrackService();

echo "Configured Timezone: " . config('app.timezone') . "\n";
echo "Current Date (for API): " . now()->format('d-m-Y H:i:s') . "\n";

// 1. Fetch real messengers

// 1. Fetch real messengers
$messengers = \App\Models\Messenger::all();
echo "Loaded " . $messengers->count() . " local messengers.\n";

// 2. Fetch Beetrack Data
echo "Fetching Beetrack data...\n";
try {
    // We need to access the protected method or just dump from the service if we modify it.
    // Ideally, we just check the service output.
    $data = $service->getDispatchStatus();
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit;
}

if (!isset($data['activos'])) {
    file_put_contents('debug_output.txt', "No active routes found or error:\n" . print_r($data, true));
    exit;
}

$output = "Found " . count($data['activos']) . " active routes.\n";
// Print first active route info to see structure
if (count($data['activos']) > 0) {
    $output .= print_r($data['activos'][0], true);

    /*
        // --- Manual Detail Fetch Debug RE-ENABLED ---
        $apiKey = "3a36861f3edc3c68d42ad5d3aa72de58e49d22043c102cf22962f77125667556";
        $baseUrl = "https://farmaciahom.dispatchtrack.com/api/external/v1/routes";
        $today = now()->format('d-m-Y');

        $routesResp = \Illuminate\Support\Facades\Http::withHeaders(['X-AUTH-TOKEN' => $apiKey])
            ->get($baseUrl, ['date' => $today]);

        $rawRoutes = $routesResp->json()['response']['routes'] ?? [];
        if (count($rawRoutes) > 0) {
            $firstRoute = $rawRoutes[0];
            $idRuta = $firstRoute['id'];
            $output .= "\n\n--- Testing Detail Fetch for Route ID: {$idRuta} ---\n";

            $detailUrl = "{$baseUrl}/{$idRuta}";
            $detailResp = \Illuminate\Support\Facades\Http::timeout(15)->withHeaders(['X-AUTH-TOKEN' => $apiKey])->get($detailUrl);

            $output .= "Status: " . $detailResp->status() . "\n";

            $detailData = $detailResp->json()['response'] ?? [];
            $routeData = $detailData['route'] ?? $detailData;
            $dispatches = $routeData['dispatches'] ?? [];

            $output .= "Dispatches found: " . count($dispatches) . "\n";
            if (count($dispatches) > 0) {
                $output .= "First 5 Dispatches Statuses:\n";
                foreach (array_slice($dispatches, 0, 5) as $d) {
                    // Check multiple fields that might indicate status
                    $status = $d['id'] ?? 'null';
                    $subtatus = $d['substatus'] ?? 'null';
                    $delivered = $d['delivered'] ?? 'null';
                    $execution_status = $d['execution_status'] ?? 'null';

                    $output .= " - ID: {$d['id']}, Status: {$status}, Substatus: {$subtatus}, Delivered: {$delivered}\n";
                }
            }
        }
    */
}

file_put_contents('debug_output.txt', $output);

/*
// 2. Mock Beetrack Data
echo "Using Mocked Beetrack data...\n";
$data = [
...
];
*/

// 3. Test Matching Logic
$normalize = function ($str) {
    return strtoupper(trim(str_replace(['á', 'é', 'í', 'ó', 'ú', 'ñ'], ['A', 'E', 'I', 'O', 'U', 'N'], mb_strtolower($str, 'UTF-8'))));
};

// Simulate Controller Logic
$now = now();
$messengersData = $messengers->map(function ($m) use ($now, $data) {
    // Normalization Helper
    $normalize = function ($str) {
        return strtoupper(trim(str_replace(['á', 'é', 'í', 'ó', 'ú', 'ñ'], ['A', 'E', 'I', 'O', 'U', 'N'], mb_strtolower($str, 'UTF-8'))));
    };

    // Beetrack Status
    $beetrackInfo = null;
    $status = 'Disponible';

    if (isset($data['activos'])) {
        $active = collect($data['activos'])->first(function ($item) use ($m, $normalize) {
            $beetrackName = $normalize($item['nombre']);
            $localName = $normalize($m->name);
            return str_contains($beetrackName, $localName) || str_contains($localName, $beetrackName);
        });

        if ($active) {
            $status = 'En Ruta';
            $beetrackInfo = $active;
        }
    }

    return [
        'id' => $m->id,
        'name' => $m->name,
        'status' => $status,
        'beetrack_info' => $beetrackInfo,
    ];
});

echo "\n--- JSON Response Preview ---\n";
echo json_encode([
    'messengers' => $messengersData,
    'timestamp' => $now->toDateTimeString()
], JSON_PRETTY_PRINT);
