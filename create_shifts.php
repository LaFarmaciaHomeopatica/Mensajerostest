<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Messenger;
use App\Models\Shift;

$messengers = Messenger::where('is_active', true)->get();
$today = '2026-02-07';
$locations = ['Principal', 'Teusaquillo'];
$startTimes = ['06:00', '07:00', '08:00', '09:00'];
$endTimes = ['14:00', '15:00', '16:00', '17:00', '18:00'];

$count = 0;
foreach ($messengers as $m) {
    // Check if shift already exists for today
    $exists = Shift::where('messenger_id', $m->id)->where('date', $today)->exists();
    if (!$exists) {
        Shift::create([
            'messenger_id' => $m->id,
            'date' => $today,
            'start_time' => $startTimes[array_rand($startTimes)],
            'end_time' => $endTimes[array_rand($endTimes)],
            'location' => $locations[array_rand($locations)],
            'status' => 'scheduled'
        ]);
        $count++;
    }
}

echo "Turnos creados: $count\n";
