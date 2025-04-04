<?php

namespace Database\Seeders;

use App\Models\Circuit;
use Illuminate\Database\Seeder;

class CircuitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a default circuit
        Circuit::create([
            'name' => 'Administrador',
            'address' => 'Av. Elias Aguirre 919',
            'active' => true,
            'zonal_id' => 1, // Chiclayo
        ]);

    }
}
