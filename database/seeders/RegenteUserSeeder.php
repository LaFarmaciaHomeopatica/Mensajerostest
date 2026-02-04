<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RegenteUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'regente@lafarmacia.com'],
            [
                'name' => 'Regente La Farmacia',
                'password' => Hash::make('asd123'),
                'role' => 'regente',
            ]
        );
    }
}
