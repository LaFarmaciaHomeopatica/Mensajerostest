<?php

use App\Exports\ConsolidatedReportExport;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "Starting export test...\n";

    $startDate = Carbon::yesterday()->toDateString();
    $endDate = Carbon::today()->toDateString();

    echo "Exporting from $startDate to $endDate\n";

    $export = new ConsolidatedReportExport($startDate, $endDate);
    $collection = $export->collection();

    echo "Collection count: " . $collection->count() . "\n";

    if ($collection->count() > 0) {
        $firstItem = $collection->first();
        echo "First item data:\n";
        print_r($firstItem);

        echo "Mapping first item...\n";
        $mapped = $export->map($firstItem);
        print_r($mapped);
    }

    echo "Export test completed successfully.\n";

} catch (\Throwable $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
