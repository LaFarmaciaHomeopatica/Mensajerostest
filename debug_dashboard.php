<?php

use App\Models\Messenger;
use App\Models\Shift;
use Carbon\Carbon;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$log = "";
$log .= "Server Time: " . now() . "\n";
$log .= "Date Today: " . today()->format('Y-m-d') . "\n";

$shiftsToday = Shift::whereDate('date', today())->get();
$log .= "Shifts Count Today: " . $shiftsToday->count() . "\n";

foreach ($shiftsToday as $shift) {
    $messenger = $shift->messenger;
    $log .= " - Shift: Messenger ID {$shift->messenger_id} ({$messenger->name}), Vehicle: {$messenger->vehicle}, Active: {$messenger->is_active}, Status: {$shift->status}, Location: {$shift->location}\n";
}

$activeMessengers = Messenger::where('is_active', true)->count();
$log .= "Active Messengers: " . $activeMessengers . "\n";

$messengersWithShift = Messenger::where('is_active', true)
    ->whereHas('shifts', function ($q) {
        $q->whereDate('date', today());
    })->count();

$log .= "Messengers with Shift Today: " . $messengersWithShift . "\n";

file_put_contents('debug_results.log', $log);
