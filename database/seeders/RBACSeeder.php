<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RBACSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Regente Farmacia',
                'email' => 'regente@lafarmacia.com',
                'password' => Hash::make('asd123'),
                'role' => 'regente',
            ],
            [
                'name' => 'Mensajero Prueba',
                'email' => 'mensajero@lafarmacia.com',
                'password' => Hash::make('asd123'),
                'role' => 'mensajero',
            ],
            [
                'name' => 'Gestor Tramites',
                'email' => 'tramites@lafarmacia.com',
                'password' => Hash::make('asd123'),
                'role' => 'tramites',
            ],
            [
                'name' => 'Lider Despachos',
                'email' => 'despachos@lafarmacia.com',
                'password' => Hash::make('asd123'),
                'role' => 'lider',
            ],
            [
                'name' => 'Administrador Sistema',
                'email' => 'admin@lafarmacia.com',
                'password' => Hash::make('asd123'),
                'role' => 'administrador',
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }
    }
}
