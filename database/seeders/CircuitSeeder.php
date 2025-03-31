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
            'name' => 'Circuito Principal',
            'address' => 'Dirección Principal 123',
            'active' => true,
            'zonal_id' => 1, // Chiclayo
        ]);

        // Create additional circuits
        Circuit::create([
            'name' => 'Circuito Norte',
            'address' => 'Av. Norte 456',
            'active' => true,
            'zonal_id' => 1, // Chiclayo
        ]);

        Circuit::create([
            'name' => 'Circuito Sur',
            'address' => 'Av. Sur 789',
            'active' => true,
            'zonal_id' => 2, // Piura
        ]);
    }
}
