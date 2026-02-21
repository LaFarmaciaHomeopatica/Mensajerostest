<?php

file_put_contents(__DIR__ . '/debug_output.txt', "Script started at " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

use App\Services\BeetrackService;

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$service = new BeetrackService();
$result = $service->getDispatchStatus();

if ($result['status'] === 'success') {
    $activos = $result['activos'];
    file_put_contents(__DIR__ . '/debug_output.txt', "SUCCESS: Found " . count($activos) . " active messengers.\n", FILE_APPEND);
    foreach ($activos as $m) {
        $line = "Messenger: {$m['nombre']} | Unit: {$m['unidad']} | Lat: " . ($m['lat'] ?? 'NULL') . " | Lng: " . ($m['lng'] ?? 'NULL') . "\n";
        file_put_contents(__DIR__ . '/debug_output.txt', $line, FILE_APPEND);
    }
} else {
    file_put_contents(__DIR__ . '/debug_output.txt', "ERROR: " . $result['message'] . "\n", FILE_APPEND);
}

echo "Done. Check debug_output.txt\n";
