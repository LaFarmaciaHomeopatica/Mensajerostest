<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$service = new \App\Services\BeetrackService();

echo "Configured Timezone: " . config('app.timezone') . "\n";
echo "Current Date (for API): " . now()->format('d-m-Y H:i:s') . "\n";

// 1. Fetch real messengers

// 1. Fetch real messengers
$messengers = \App\Models\Messenger::all();
echo "Loaded " . $messengers->count() . " local messengers.\n";

// 2. Mock Beetrack Data
echo "Using Mocked Beetrack data...\n";
$data = [
    'status' => 'success',
    'activos' => [
        [
            'nombre' => 'JUAN PEREZ', // Should match 'Juan Perez'
            'unidad' => 'MOTO-01',
            'activo' => true,
            'hora_cierre' => '',
            'progreso_str' => '5/10',
            'porcentaje' => 50
        ]
    ],
    'libres' => []
];

// 3. Test Matching Logic
$normalize = function ($str) {
    return strtoupper(trim(str_replace(['á', 'é', 'í', 'ó', 'ú', 'ñ'], ['A', 'E', 'I', 'O', 'U', 'N'], mb_strtolower($str, 'UTF-8'))));
};

// Simulate Controller Logic
$now = now();
$messengersData = $messengers->map(function ($m) use ($now, $data) {
    // Normalization Helper
    $normalize = function ($str) {
        return strtoupper(trim(str_replace(['á', 'é', 'í', 'ó', 'ú', 'ñ'], ['A', 'E', 'I', 'O', 'U', 'N'], mb_strtolower($str, 'UTF-8'))));
    };

    // Beetrack Status
    $beetrackInfo = null;
    $status = 'Disponible';

    if (isset($data['activos'])) {
        $active = collect($data['activos'])->first(function ($item) use ($m, $normalize) {
            $beetrackName = $normalize($item['nombre']);
            $localName = $normalize($m->name);
            return str_contains($beetrackName, $localName) || str_contains($localName, $beetrackName);
        });

        if ($active) {
            $status = 'En Ruta';
            $beetrackInfo = $active;
        }
    }

    return [
        'id' => $m->id,
        'name' => $m->name,
        'status' => $status,
        'beetrack_info' => $beetrackInfo,
    ];
});

echo "\n--- JSON Response Preview ---\n";
echo json_encode([
    'messengers' => $messengersData,
    'timestamp' => $now->toDateTimeString()
], JSON_PRETTY_PRINT);
