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
            'email' => 'rodrigo.granja@grupomaclabi.com',
            'dni' => '77344506',
            'password' => Hash::make("*Rodrigo95*"),
            'cel' => '976709811',
            'circuit_id' => 1,
        ]);
        $admin->assignRole('admin');
    }
}
