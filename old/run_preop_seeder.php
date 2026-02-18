<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Database\Seeders\PreoperationalQuestionSeeder;
use Illuminate\Support\Facades\Artisan;

// Run the seeder
echo "Ejecutando seeder de preguntas preoperacionales...\n";
Artisan::call('db:seed', ['--class' => 'PreoperationalQuestionSeeder', '--force' => true]);
echo "Seeder ejecutado.\n\n";

// Verify the questions
$questions = DB::table('preoperational_questions')
    ->select('category', DB::raw('COUNT(*) as total'))
    ->groupBy('category')
    ->orderBy(DB::raw('MIN(`order`)'))
    ->get();

echo "=== RESUMEN DE PREGUNTAS POR CATEGORÍA ===\n";
$total = 0;
foreach ($questions as $q) {
    echo "{$q->category}: {$q->total} preguntas\n";
    $total += $q->total;
}
echo "\nTotal de preguntas: $total\n";

// List all questions
echo "\n=== LISTADO COMPLETO ===\n";
$allQuestions = DB::table('preoperational_questions')
    ->orderBy('order')
    ->get(['category', 'label', 'key']);

foreach ($allQuestions as $q) {
    echo "[{$q->category}] {$q->label}\n";
}
