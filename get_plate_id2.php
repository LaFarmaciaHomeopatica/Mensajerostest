<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$m = \App\Models\Messenger::find(2);
file_put_contents('plate_id2.txt', $m->vehicle);
