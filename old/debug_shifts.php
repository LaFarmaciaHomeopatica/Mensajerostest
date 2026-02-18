<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

use App\Models\Messenger;
use App\Models\Shift;
use App\Models\PreoperationalReport;
use Carbon\Carbon;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$messengerName = 'Gonzalez';
$messengers = Messenger::where('name', 'like', "%$messengerName%")->get();

foreach ($messengers as $messenger) {
    if (strpos($messenger->name, 'John') === false)
        continue;

    $today = Carbon::today()->toDateString();

    $shifts = Shift::where('messenger_id', $messenger->id)
        ->whereDate('date', $today)
        ->get();

    echo "Messenger: {$messenger->name} has " . $shifts->count() . " shifts on $today.\n";
    foreach ($shifts as $shift) {
        echo " - Shift Start: " . $shift->start_time . "\n";
    }
}
