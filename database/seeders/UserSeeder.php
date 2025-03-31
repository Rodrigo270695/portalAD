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
            'zonal_id' => 1,
        ]);
        $admin->assignRole('admin');

    }
}
