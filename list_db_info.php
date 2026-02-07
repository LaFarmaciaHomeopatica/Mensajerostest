<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== USUARIOS EN LA BASE DE DATOS ===\n\n";

$users = DB::table('users')->select('id', 'name', 'email', 'role')->get();

foreach ($users as $user) {
    echo "ID: {$user->id}\n";
    echo "Nombre: {$user->name}\n";
    echo "Email: {$user->email}\n";
    echo "Rol: {$user->role}\n";
    echo "---\n";
}

echo "\n=== MENSAJEROS (muestra) ===\n\n";
$messengers = DB::table('messengers')->select('id', 'name', 'vehicle')->limit(5)->get();

foreach ($messengers as $m) {
    echo "Placa: {$m->vehicle} - Nombre: {$m->name}\n";
}

echo "\n=== PREGUNTAS PREOPERACIONALES ===\n\n";
$questions = DB::table('preoperational_questions')
    ->select('category', DB::raw('GROUP_CONCAT(label SEPARATOR ", ") as items'), DB::raw('COUNT(*) as total'))
    ->groupBy('category')
    ->orderBy(DB::raw('MIN(`order`)'))
    ->get();

foreach ($questions as $q) {
    echo "{$q->category} ({$q->total}):\n";
    echo "  {$q->items}\n\n";
}
