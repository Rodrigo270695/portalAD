<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Rodrigo Granja',
            'email' => 'test@example.com',
            'dni' => '77344506',
            'password' => Hash::make("admin"),
            'cel' => '976709811',
            'circuit_id' => 1,
            // zonificado_id is nullable, so we don't need to include it
        ]);
        $admin->assignRole('admin');

        // Crear un usuario con rol PDV
        $pdvUser = User::create([
            'name' => 'Usuario PDV',
            'email' => 'pdv@example.com',
            'dni' => '12345678',
            'password' => Hash::make("password"),
            'cel' => '987654321',
            'circuit_id' => 1,
            // zonificado_id es opcional
        ]);
        $pdvUser->assignRole('pdv');
    }
}
