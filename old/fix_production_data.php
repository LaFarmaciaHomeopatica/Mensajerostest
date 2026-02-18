<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Messenger;
use App\Models\Shift;
use App\Models\DispatchLocation;

echo "Iniciando reparación de datos...\n";

// 1. Asegurar Locaciones
if (DispatchLocation::count() === 0) {
    echo "Poblando locaciones...\n";
    $locations = [
        [
            'name' => 'Principal',
            'address' => 'CALLE 116 # 15B-26',
            'prefix' => 'WH',
            'current_consecutive' => 537050
        ],
        [
            'name' => 'Teusaquillo',
            'address' => 'CALLE 34 # 16-24',
            'prefix' => 'TE',
            'current_consecutive' => 1000
        ],
    ];
    foreach ($locations as $loc) {
        DispatchLocation::create($loc);
    }
}

// 2. Asegurar Mensajeros
if (Messenger::count() === 0) {
    echo "Poblando mensajeros...\n";
    $messengers = [
        ["name" => "Franklinn Ortiz", "vehicle" => "VAS19D", "duration" => 60],
        ["name" => "Francisco Navas", "vehicle" => "QMP51F", "duration" => 60],
        ["name" => "Yordy Alafaro", "vehicle" => "VMQ92F", "duration" => 60],
    ];
    foreach ($messengers as $m) {
        Messenger::create([
            'name' => $m['name'],
            'vehicle' => $m['vehicle'],
            'lunch_duration' => $m['duration']
        ]);
    }
}

// 3. Crear Turnos para HOY
$today = date('Y-m-d');
echo "Creando turnos para $today...\n";
$messengers = Messenger::where('is_active', true)->get();
$locNames = ['Principal', 'Teusaquillo'];
$startTimes = ['06:00', '07:00', '08:00', '09:00'];
$endTimes = ['14:00', '15:00', '16:00', '17:00', '18:00'];

$count = 0;
foreach ($messengers as $m) {
    $exists = Shift::where('messenger_id', $m->id)->where('date', $today)->exists();
    if (!$exists) {
        Shift::create([
            'messenger_id' => $m->id,
            'date' => $today,
            'start_time' => $startTimes[array_rand($startTimes)],
            'end_time' => $endTimes[array_rand($endTimes)],
            'location' => $locNames[array_rand($locNames)],
            'status' => 'scheduled'
        ]);
        $count++;
    }
}

echo "Proceso finalizado. Turnos creados: $count\n";
