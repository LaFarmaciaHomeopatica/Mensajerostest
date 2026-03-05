<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

use App\Services\BeetrackService;
use App\Models\Messenger;

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$service = new BeetrackService();
$result = $service->getDispatchStatus();

echo "--- BEETRACK DATA ---\n";
if ($result['status'] === 'success') {
    $all = array_merge($result['activos']->toArray(), $result['libres']->toArray());
    foreach ($all as $bt) {
        echo "Nombre: {$bt['nombre']} | Unidad: {$bt['unidad']} | Activo: " . ($bt['activo'] ? 'SI' : 'NO') . " | Lat: {$bt['lat']} | Lng: {$bt['lng']}\n";
    }
} else {
    echo "Error: " . $result['message'] . "\n";
}

echo "\n--- LOCAL MESSENGERS ---\n";
$messengers = Messenger::where('is_active', true)->get();
foreach ($messengers as $m) {
    echo "ID: {$m->id} | Nombre: {$m->name} | Vehiculo: {$m->vehicle}\n";
}

echo "\n--- MATCHING RESULTS ---\n";
foreach ($messengers as $m) {
    $normalize = function ($str) {
        return strtoupper(preg_replace('/[^A-Z0-9]/', '', $str));
    };

    $vNormalized = $normalize($m->vehicle);
    $match = null;
    foreach ($all ?? [] as $bt) {
        if ($normalize($bt['unidad']) === $vNormalized) {
            $match = $bt;
            break;
        }
    }

    if ($match) {
        echo "MATCH FOUND: {$m->name} ({$m->vehicle}) <-> {$match['nombre']} ({$match['unidad']}) | Position: {$match['lat']}, {$match['lng']}\n";
    } else {
        echo "NO MATCH: {$m->name} ({$m->vehicle})\n";
    }
}
