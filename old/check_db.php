<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\LunchLog;
use App\Models\ShiftCompletion;
use App\Models\Shift;
use App\Models\User;

echo "LunchLogs: " . LunchLog::count() . "\n";
echo "ShiftCompletions: " . ShiftCompletion::count() . "\n";
echo "Shifts: " . Shift::count() . "\n";

$dev = User::where('email', 'dev@lafarmacia.com')->first();
if ($dev) {
    echo "Dev Role: " . $dev->role . "\n";
} else {
    echo "Dev User NOT FOUND\n";
}
