<?php

namespace Database\Seeders;

use App\Models\Zonal;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ZonalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Zonal::create([
            'name' => 'CHICLAYO',
            'short_name' => 'CHI',
            'active' => true,
        ]);
        Zonal::create([
            'name' => 'IQUITOS',
            'short_name' => 'IQUIT',
            'active' => true,
        ]);
        Zonal::create(attributes: [
            'name' => 'CAJAMARCA',
            'short_name' => 'CAJAM',
            'active' => true,
        ]);
        Zonal::create([
            'name' => 'PIURA',
            'short_name' => 'PIU',
            'active' => true,
        ]);
        Zonal::create([
            'name' => 'TARAPOTO',
            'short_name' => 'TARAP',
            'active' => true,
        ]);
        Zonal::create(attributes: [
            'name' => 'TRUJILLO',
            'short_name' => 'TRU',
            'active' => true,
        ]);
        Zonal::create(attributes: [
            'name' => 'TUMBES',
            'short_name' => 'TUM',
            'active' => true,
        ]);
    }
}
