<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$m = \App\Models\Messenger::whereHas('shifts')->first();
if (!$m)
    $m = \App\Models\Messenger::first();
file_put_contents('plate.txt', $m->vehicle);
