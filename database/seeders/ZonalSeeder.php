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
            'name' => 'Chiclayo',
            'short_name' => 'CHI',
            'active' => true,
        ]);
        Zonal::create([
            'name' => 'Piura',
            'short_name' => 'PIU',
            'active' => true,
        ]);
    }
}
