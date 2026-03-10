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
            // Estado Mecánico de la Motocicleta
            ['category' => 'Estado Mecánico', 'label' => 'Frenos (delantero y trasero)', 'key' => 'frenos', 'order' => 10],
            ['category' => 'Estado Mecánico', 'label' => 'Luces (delantera, trasera, direccionales, freno)', 'key' => 'luces', 'order' => 20],
            ['category' => 'Estado Mecánico', 'label' => 'Llantas (estado, presión, profundidad de labrado)', 'key' => 'llantas', 'order' => 30],
            ['category' => 'Estado Mecánico', 'label' => 'Espejos retrovisores (ambos lados)', 'key' => 'espejos', 'order' => 40],
            ['category' => 'Estado Mecánico', 'label' => 'Cadena de transmisión (tensión y lubricación)', 'key' => 'cadena', 'order' => 50],
            ['category' => 'Estado Mecánico', 'label' => 'Nivel de aceite del motor', 'key' => 'aceite', 'order' => 60],
            ['category' => 'Estado Mecánico', 'label' => 'Sistema de escape (sin fugas)', 'key' => 'escape', 'order' => 70],
            ['category' => 'Estado Mecánico', 'label' => 'Pito/bocina (funcionamiento)', 'key' => 'pito', 'order' => 80],
            ['category' => 'Estado Mecánico', 'label' => 'Suspensión (amortiguadores)', 'key' => 'suspension', 'order' => 90],

            // Seguridad Personal
            ['category' => 'Seguridad Personal', 'label' => 'Casco (certificado, sin grietas)', 'key' => 'casco', 'order' => 100],
            ['category' => 'Seguridad Personal', 'label' => 'Chaleco reflectivo', 'key' => 'chaleco', 'order' => 110],
            ['category' => 'Seguridad Personal', 'label' => 'Guantes de protección', 'key' => 'guantes', 'order' => 120],
            ['category' => 'Seguridad Personal', 'label' => 'Calzado cerrado adecuado', 'key' => 'calzado', 'order' => 130],

            // Seguridad del Vehículo
            ['category' => 'Seguridad del Vehículo', 'label' => 'Botiquín de primeros auxilios', 'key' => 'botiquin', 'order' => 140],
            ['category' => 'Seguridad del Vehículo', 'label' => 'Kit de herramientas básicas', 'key' => 'herramientas', 'order' => 150],
            ['category' => 'Seguridad del Vehículo', 'label' => 'Triángulos de seguridad', 'key' => 'triangulos', 'order' => 160],

            // Documentación
            ['category' => 'Documentación', 'label' => 'SOAT vigente', 'key' => 'soat', 'order' => 170],
            ['category' => 'Documentación', 'label' => 'Licencia de conducción (A2 o superior)', 'key' => 'licencia', 'order' => 180],
            ['category' => 'Documentación', 'label' => 'Tarjeta de propiedad', 'key' => 'tarjeta_propiedad', 'order' => 190],
            ['category' => 'Documentación', 'label' => 'Revisión técnico-mecánica vigente', 'key' => 'tecnomecanica', 'order' => 200],

            // Limpieza y Presentación
            ['category' => 'Limpieza y Presentación', 'label' => 'Limpieza general de la motocicleta', 'key' => 'limpieza', 'order' => 210],
            ['category' => 'Limpieza y Presentación', 'label' => 'Placa visible y legible', 'key' => 'placa', 'order' => 220],
        ];

        foreach ($questions as $question) {
            \App\Models\PreoperationalQuestion::updateOrCreate(
                ['key' => $question['key']],
                $question
            );
        }
    }
}
