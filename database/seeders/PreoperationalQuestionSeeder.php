<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PreoperationalQuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $questions = [
            // Vehículo
            ['category' => 'Vehículo', 'label' => 'Luces (delanteras, traseras, direccionales)', 'key' => 'luces', 'order' => 10],
            ['category' => 'Vehículo', 'label' => 'Frenos (funcionamiento correcto)', 'key' => 'frenos', 'order' => 20],
            ['category' => 'Vehículo', 'label' => 'Llantas (estado y presión)', 'key' => 'llantas', 'order' => 30],
            ['category' => 'Vehículo', 'label' => 'Espejos retrovisores', 'key' => 'espejos', 'order' => 40],
            ['category' => 'Vehículo', 'label' => 'Limpieza general del vehículo', 'key' => 'limpieza', 'order' => 50],

            // Seguridad
            ['category' => 'Seguridad', 'label' => 'Cinturón de seguridad', 'key' => 'cinturon', 'order' => 60],
            ['category' => 'Seguridad', 'label' => 'Casco (en buen estado)', 'key' => 'casco', 'order' => 70],
            ['category' => 'Seguridad', 'label' => 'Chaleco reflectivo', 'key' => 'chaleco', 'order' => 80],
            ['category' => 'Seguridad', 'label' => 'Kit de carreteras (botiquín, extintor)', 'key' => 'kit_carreteras', 'order' => 90],

            // Documentos
            ['category' => 'Documentos', 'label' => 'SOAT vigente', 'key' => 'soat', 'order' => 100],
            ['category' => 'Documentos', 'label' => 'Licencia de conducción', 'key' => 'licencia', 'order' => 110],
            ['category' => 'Documentos', 'label' => 'Tarjeta de propiedad', 'key' => 'tarjeta_propiedad', 'order' => 120],
        ];

        foreach ($questions as $question) {
            \App\Models\PreoperationalQuestion::updateOrCreate(
                ['key' => $question['key']],
                $question
            );
        }
    }
}
