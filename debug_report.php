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

echo "Debug script started.\n";

$messengerName = 'Gonzalez';
$messengers = Messenger::where('name', 'like', "%$messengerName%")->get();

if ($messengers->isEmpty()) {
    echo "No messengers found matching '$messengerName'.\n";
    exit;
}

foreach ($messengers as $messenger) {
    if (strpos($messenger->name, 'John') === false)
        continue;

    echo "------------------------------------------------\n";
    echo "Messenger: " . $messenger->name . " (ID: " . $messenger->id . ")\n";

    $today = Carbon::today()->toDateString();
    echo "Today: $today\n";

    $preop = PreoperationalReport::where('messenger_id', $messenger->id)
        ->whereDate('created_at', $today)
        ->first();

    $shift = Shift::where('messenger_id', $messenger->id)
        ->whereDate('date', $today)
        ->first();

    if ($preop) {
        $raw = $preop->getAttributes()['created_at'];
        echo "Report Created At (Raw): " . $raw . "\n";
        echo "Report Created At (Carbon): " . $preop->created_at . " (" . $preop->created_at->timezoneName . ")\n";
        echo "Report Created At (Format H:i): " . $preop->created_at->format('H:i') . "\n";
    } else {
        echo "No Preoperational Report for today.\n";
    }

    if ($shift) {
        echo "Shift Date: " . $shift->date . "\n";
        echo "Shift Start Time: " . $shift->start_time . "\n";

        $shiftStart = Carbon::parse($shift->date . ' ' . $shift->start_time);
        echo "Calculated Shift Start: " . $shiftStart . " (" . $shiftStart->timezoneName . ")\n";

        if ($preop) {
            $compliant = $preop->created_at->lessThan($shiftStart);
            echo "Compliant (Is " . $preop->created_at . " < " . $shiftStart . "?): " . ($compliant ? 'YES' : 'NO') . "\n";
        }
    } else {
        echo "No Shift found for today.\n";
    }
}
echo "Debug script finished.\n";
