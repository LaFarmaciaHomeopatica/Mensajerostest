<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$firstNames = [
    'JUAN',
    'CARLOS',
    'JOSE',
    'LUIS',
    'MIGUEL',
    'PEDRO',
    'JORGE',
    'ANDRES',
    'DAVID',
    'DANIEL',
    'JAVIER',
    'FERNANDO',
    'RICARDO',
    'ALEJANDRO',
    'SERGIO',
    'MANUEL',
    'OSCAR',
    'ROBERTO',
    'FRANCISCO',
    'DIEGO',
    'PABLO',
    'RAFAEL',
    'MARIO',
    'EDUARDO',
    'ANTONIO',
    'FELIPE',
    'CESAR',
    'MARTIN',
    'RAUL',
    'MARCO'
];

$secondNames = [
    'ALBERTO',
    'ENRIQUE',
    'ARTURO',
    'EDUARDO',
    'FELIPE',
    'GABRIEL',
    'HECTOR',
    'IGNACIO',
    'JAIME',
    'LEONARDO',
    'MAURICIO',
    'NICOLAS',
    'ORLANDO',
    'PATRICIO',
    'RODRIGO',
    'SEBASTIAN',
    'TOMAS',
    'VICTOR',
    'WILLIAM',
    'XAVIER',
    'YAIR',
    'ANDRES',
    'CAMILO',
    'DANIEL',
    'EMILIO',
    'FABIAN',
    'GUSTAVO',
    'HUGO',
    'IVAN'
];

$lastNames = [
    'GARCIA',
    'RODRIGUEZ',
    'MARTINEZ',
    'HERNANDEZ',
    'LOPEZ',
    'GONZALEZ',
    'PEREZ',
    'SANCHEZ',
    'RAMIREZ',
    'TORRES',
    'FLORES',
    'RIVERA',
    'GOMEZ',
    'DIAZ',
    'CRUZ',
    'MORALES',
    'REYES',
    'GUTIERREZ',
    'ORTIZ',
    'CHAVEZ',
    'RUIZ',
    'JIMENEZ',
    'MENDOZA',
    'CASTILLO',
    'VARGAS',
    'ROMERO',
    'SILVA',
    'CASTRO',
    'RAMOS',
    'MORENO'
];

// Get all messengers
$messengers = DB::table('messengers')->get();

echo "Actualizando " . count($messengers) . " mensajeros a formato completo...\n\n";

$updated = 0;
$usedNames = [];

foreach ($messengers as $messenger) {
    // Generate unique random name (2 nombres + 2 apellidos)
    do {
        $firstName = $firstNames[array_rand($firstNames)];
        $secondName = $secondNames[array_rand($secondNames)];
        $lastName1 = $lastNames[array_rand($lastNames)];
        $lastName2 = $lastNames[array_rand($lastNames)];

        $fullName = "$firstName $secondName $lastName1 $lastName2";
    } while (in_array($fullName, $usedNames));

    $usedNames[] = $fullName;

    DB::table('messengers')
        ->where('id', $messenger->id)
        ->update(['name' => $fullName]);

    echo "✓ ID {$messenger->id}: {$messenger->name} -> $fullName\n";
    $updated++;
}

echo "\n=== RESUMEN ===\n";
echo "Total actualizados: $updated mensajeros\n";
echo "✓ Formato actualizado a: 2 NOMBRES + 2 APELLIDOS\n";
