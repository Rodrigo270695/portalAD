<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Circuit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use PhpOffice\PhpSpreadsheet\IOFactory;

class User2Seeder extends Seeder
{
    public function run(): void
    {
        $inputFileName = storage_path('app/users2.xlsx');
        $spreadsheet = IOFactory::load($inputFileName);
        $worksheet = $spreadsheet->getActiveSheet();
        $rows = $worksheet->toArray();
        
        // Asumimos que la primera fila son los encabezados
        $headers = array_shift($rows);
        
        // Convertir los encabezados a claves más fáciles de manejar
        $headerMap = array_flip($headers);
        
        foreach ($rows as $row) {
            try {
                // Buscar el circuit_id directamente por el nombre del circuito
                $circuit = Circuit::where('name', trim($row[$headerMap['CIRCUITO']]))->first();
                if (!$circuit) {
                    echo "Error: No se encontró el circuito '{$row[$headerMap['CIRCUITO']]}' para el usuario {$row[$headerMap['NOMBRE']]}\n";
                    continue;
                }

                // Asegurar que el DNI tenga 8 dígitos
                $dni = str_pad($row[$headerMap['DNI']], 8, '0', STR_PAD_LEFT);

                // Buscar el zonificador por DNI si existe en la columna G
                $zonificadorId = null;
                if (!empty($row[$headerMap['DNI ZONIFICADO']])) {
                    $dniZonificador = str_pad($row[$headerMap['DNI ZONIFICADO']], 8, '0', STR_PAD_LEFT);
                    $zonificador = User::whereHas('roles', function ($query) {
                        $query->where('name', 'zonificado');
                    })->where('dni', $dniZonificador)->first();

                    if ($zonificador) {
                        $zonificadorId = $zonificador->id;
                    } else {
                        echo "Advertencia: No se encontró el zonificador con DNI {$dniZonificador} para el usuario {$row[$headerMap['NOMBRE']]}\n";
                    }
                }
                
                // Intentar encontrar un usuario existente por DNI
                $user = User::where('dni', $dni)->first();
                
                if ($user) {
                    // Actualizar usuario existente
                    $user->update([
                        'name' => $row[$headerMap['NOMBRE']],
                        'email' => $row[$headerMap['CORREO']],
                        'cel' => $row[$headerMap['MOVIL']],
                        'circuit_id' => $circuit->id,
                        'zonificado_id' => $zonificadorId,
                    ]);
                    
                    // Sincronizar roles (asignar rol pdv)
                    $user->syncRoles(['pdv']);
                    
                    echo "Usuario actualizado: {$row[$headerMap['NOMBRE']]} (DNI: {$dni}) (PDV)\n";
                } else {
                    // Crear nuevo usuario
                    $user = User::create([
                        'name' => $row[$headerMap['NOMBRE']],
                        'email' => $row[$headerMap['CORREO']],
                        'dni' => $dni,
                        'password' => Hash::make($dni), // Usar DNI como contraseña
                        'cel' => $row[$headerMap['MOVIL']],
                        'circuit_id' => $circuit->id,
                        'zonificado_id' => $zonificadorId,
                    ]);
                    
                    // Asignar el rol pdv
                    $user->assignRole('pdv');
                    
                    echo "Usuario creado: {$row[$headerMap['NOMBRE']]} (DNI: {$dni}) (PDV)\n";
                }
            } catch (\Exception $e) {
                echo "Error inesperado con usuario {$row[$headerMap['NOMBRE']]}: {$e->getMessage()}\n";
                continue;
            }
        }
    }
}
