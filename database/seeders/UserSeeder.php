<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Zonal;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use PhpOffice\PhpSpreadsheet\IOFactory;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $inputFileName = storage_path('app/users.xlsx');
        $spreadsheet = IOFactory::load($inputFileName);
        $worksheet = $spreadsheet->getActiveSheet();
        $rows = $worksheet->toArray();
        
        // Asumimos que la primera fila son los encabezados
        $headers = array_shift($rows);
        
        // Convertir los encabezados a claves más fáciles de manejar
        $headerMap = array_flip($headers);
        
        foreach ($rows as $row) {
            try {
                // Buscar el circuit_id basado en el nombre corto del zonal
                $zonal = Zonal::where('short_name', trim($row[$headerMap['NOMBRE CORTO']]))->first();
                if (!$zonal) {
                    echo "Error: No se encontró el zonal '{$row[$headerMap['NOMBRE CORTO']]}' para el usuario {$row[$headerMap['NOMBRE']]}\n";
                    continue;
                }

                $circuit = $zonal->circuits()->first();
                if (!$circuit) {
                    echo "Error: No se encontró ningún circuito para el zonal '{$row[$headerMap['NOMBRE CORTO']]}' (usuario: {$row[$headerMap['NOMBRE']]})\n";
                    continue;
                }

                // Asegurar que el DNI tenga 8 dígitos
                $dni = str_pad($row[$headerMap['DNI']], 8, '0', STR_PAD_LEFT);
                
                // Intentar encontrar un usuario existente por DNI
                $user = User::where('dni', $dni)->first();
                
                if ($user) {
                    // Actualizar usuario existente
                    $user->update([
                        'name' => $row[$headerMap['NOMBRE']],
                        'email' => $row[$headerMap['CORREO']],
                        'cel' => $row[$headerMap['MOVIL']],
                        'circuit_id' => $circuit->id,
                    ]);
                    
                    // Sincronizar roles (elimina roles anteriores y asigna el nuevo)
                    $user->syncRoles([$row[$headerMap['ROL']]]);
                    
                    echo "Usuario actualizado: {$row[$headerMap['NOMBRE']]} (DNI: {$dni})\n";
                } else {
                    // Crear nuevo usuario
                    $user = User::create([
                        'name' => $row[$headerMap['NOMBRE']],
                        'email' => $row[$headerMap['CORREO']],
                        'dni' => $dni,
                        'password' => Hash::make($dni), // Usar DNI como contraseña
                        'cel' => $row[$headerMap['MOVIL']],
                        'circuit_id' => $circuit->id,
                    ]);
                    
                    // Asignar el rol
                    $user->assignRole($row[$headerMap['ROL']]);
                    
                    echo "Usuario creado: {$row[$headerMap['NOMBRE']]} (DNI: {$dni})\n";
                }
            } catch (\Exception $e) {
                echo "Error inesperado con usuario {$row[$headerMap['NOMBRE']]}: {$e->getMessage()}\n";
                continue;
            }
        }
    }
}
