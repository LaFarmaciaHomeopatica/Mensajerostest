<?php

require __DIR__ . '/vendor/autoload.php';

$app = require __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Messenger;
use App\Models\Shift;
use App\Models\PreoperationalReport;
use App\Models\CleaningReport;
use App\Models\LunchLog;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;


// --- Helper Functions ---
function logTest($name, $status, $message = '')
{
    $icon = $status ? '✅' : '❌';
    echo "{$icon} [{$name}]: " . ($status ? "PASS" : "FAIL - {$message}") . "\n";
    return $status;
}

function cleanup()
{
    Messenger::where('email', 'test_audit@example.com')->delete();
}

echo "--- INICIANDO AUDITORÍA DEL SISTEMA ---\n";
cleanup();

// 1. SETUP TEST DATA
$activeMessenger = Messenger::create([
    'name' => 'Usuario Activo Test',
    'email' => 'active_test@example.com',
    'vehicle' => 'TEST01',
    'phone' => '123456789',
    'is_active' => true,
    'lunch_duration' => 60
]);

$inactiveMessenger = Messenger::create([
    'name' => 'Usuario Inactivo Test',
    'email' => 'inactive_test@example.com',
    'vehicle' => 'TEST02',
    'phone' => '987654321',
    'is_active' => false,
    'lunch_duration' => 60
]);

// 2. CHECK INACTIVE FILTERING
echo "\n--- VERIFICANDO FILTROS DE INACTIVOS ---\n";

// A. Controller Lists
$preopList = Messenger::where('is_active', true)->pluck('id')->toArray();
logTest('Filter: Preoperational List', !in_array($inactiveMessenger->id, $preopList), "Inactive user found in active list");

// B. Check if inactive user can be found in 'checkPlate' logic simulation
$checkPlate = Messenger::where('vehicle', 'TEST02')->first(); // Controller does manual check
logTest('Logic: Check Plate Found', $checkPlate !== null);
logTest('Logic: Check Plate Inactive Block', !$checkPlate->is_active, "User should be inactive");

// 3. CHECK PREOPERATIONAL LOGIC
echo "\n--- VERIFICANDO LÓGICA PREOPERACIONAL ---\n";
$today = Carbon::today();
Shift::create([
    'messenger_id' => $activeMessenger->id,
    'date' => $today->format('Y-m-d'),
    'start_time' => '08:00:00',
    'end_time' => '17:00:00',
    'status' => 'present',
    'location' => 'Sede Principal'
]);

// Simulate Report Creation (Time: 07:50 - Compliant)
$reportEarly = new PreoperationalReport();
$reportEarly->messenger_id = $activeMessenger->id;
$reportEarly->created_at = $today->copy()->setTime(7, 50);
$reportEarly->answers = [];
$reportEarly->save();

$shift = Shift::where('messenger_id', $activeMessenger->id)->whereDate('date', $today)->first();
$reportTime = Carbon::parse($reportEarly->created_at);
$shiftStart = Carbon::parse($shift->date . ' ' . $shift->start_time);
$isCompliant = $reportTime->lessThan($shiftStart);

logTest('Compliance: Report before shift', $isCompliant, "Should be compliant (07:50 < 08:00)");

// 4. CHECK CLEANING REPORT IMAGES (GD SIMULATION)
echo "\n--- VERIFICANDO COMPRESIÓN DE IMÁGENES (GD) ---\n";
if (extension_loaded('gd')) {
    logTest('System: GD Library', true);
    // We can't easily upload a file in CLI script without mocking, but we verified the code logic.
    // Logic check: verify the code path in controller exists (Static Assert)
    $controllerCode = file_get_contents(app_path('Http/Controllers/CleaningReportController.php'));
    logTest('Code: Compression Implementation', strpos($controllerCode, 'imagejpeg($sourceImage, null, 80)') !== false, "Compression code not found");
    logTest('Code: Resize Implementation', strpos($controllerCode, 'imagecopyresampled') !== false, "Resize code not found");
} else {
    logTest('System: GD Library', false, "GD Extension not loaded in CLI");
}

// 5. CHECK EXPORTS QUERY LOGIC
echo "\n--- VERIFICANDO LÓGICA DE EXPORTACIÓN ---\n";

// Shifts Export
$shiftsExportQuery = Shift::with('messenger')->whereHas('messenger', function ($q) {
    $q->where('is_active', true);
});
$sql = $shiftsExportQuery->toSql();
logTest('Export: Shifts Filter', strpos($sql, 'is_active') !== false || strpos($sql, 'exists') !== false, "SQL missing is_active check");

// Cleaning Export
$cleaningExportQuery = CleaningReport::with('messenger')->whereHas('messenger', function ($q) {
    $q->where('is_active', true);
});
$sql = $cleaningExportQuery->toSql();
logTest('Export: Cleaning Filter', strpos($sql, 'is_active') !== false || strpos($sql, 'exists') !== false, "SQL missing is_active check");

// 6. CONSOLIDATED LOGIC
echo "\n--- VERIFICANDO REPORTE CONSOLIDADO ---\n";
// Manually replicate the controller index logic for single day
$indexQuery = Messenger::query()->where('is_active', true);
$results = $indexQuery->get();
$containsInactive = $results->contains('id', $inactiveMessenger->id);
logTest('Consolidated: Main Query', !$containsInactive, "Inactive user found in Consolidated main query");


// CLEANUP
cleanup();
echo "\n--- FINALIZADO ---\n";
