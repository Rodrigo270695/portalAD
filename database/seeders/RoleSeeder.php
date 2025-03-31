<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::create([
            'name' => 'admin',
            'guard_name' => 'web'
        ]);

        Role::create([
            'name' => 'qa',
            'guard_name' => 'web'
        ]);

        Role::create([
            'name' => 'zonificado',
            'guard_name' => 'web'
        ]);

        Role::create([
            'name' => 'pdv',
            'guard_name' => 'web'
        ]);
    }
}
