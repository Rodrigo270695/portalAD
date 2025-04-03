<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaleRequest;
use App\Models\Sale;
use App\Models\User;
use App\Models\WebProduct;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class SaleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Obtener parámetros de la solicitud
        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);
        $date = $request->input('date', now()->format('Y-m-d'));
        $query = Sale::with([
            'user.circuit.zonal',
            'user.zonificador.circuit.zonal',
            'webproduct.product'
        ]);

        // Filtro por fecha
        if ($date) {
            $query->whereDate('date', $date);
        }

        // Filtro por PDV
        if ($pdv = $request->pdv) {
            $query->whereHas('user', function($q) use ($pdv) {
                $q->where('name', 'like', "%{$pdv}%")
                    ->orWhere('dni', 'like', "%{$pdv}%");
            });
        }

        // Filtro por búsqueda general
        if ($search = $request->search) {
            $query->where(function($q) use ($search) {
                $q->whereHas('user', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('dni', 'like', "%{$search}%");
                })->orWhereHas('user.circuit.zonal', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('short_name', 'like', "%{$search}%");
                })->orWhereHas('webProduct', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
            });
        }

        // Filtro por Zonificado y Zonal
        if ($zonificado = $request->zonificado) {
            $query->whereHas('user.zonificador', function($q) use ($zonificado) {
                $q->where('name', 'like', "%{$zonificado}%")
                    ->orWhereHas('circuit.zonal', function($q) use ($zonificado) {
                        $q->where('name', 'like', "%{$zonificado}%")
                            ->orWhere('short_name', 'like', "%{$zonificado}%");
                    });
            });
        }

        // Obtener totales para los filtros actuales
        $totals = [
            'recharge_amount' => $query->sum('recharge_amount'),
            'accumulated_amount' => $query->sum('accumulated_amount'),
            'commissionable_charges' => $query->where('commissionable_charge', true)->count(),
        ];

        // Paginar los resultados
        $sales = $query
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 10)
            ->withQueryString();

        $users = User::role('pdv')->orderBy('name')->get(['id', 'name', 'dni']);
        $webProducts = WebProduct::query()
            ->select('id', 'name', 'description', 'product_id')
            ->with(['product' => function($query) {
                $query->select('id', 'name', 'description');
            }])
            ->whereHas('product')
            ->orderBy('name')
            ->get();
        // Obtener fechas únicas para el filtro
        $dates = Sale::distinct()->orderBy('date', 'desc')->pluck('date');

        return Inertia::render('Sale/Index', [
            'sales' => $sales,
            'users' => $users,
            'webProducts' => $webProducts,
            'filters' => [
                'search' => $search,
                'page' => $page,
                'per_page' => $perPage,
                'date' => $date,
                'pdv' => $pdv,
                'zonificado' => $zonificado,
            ],
            'dates' => $dates,
            'totals' => $totals,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SaleRequest $request)
    {
        $validated = $request->validated();
        Sale::create($validated);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Venta registrada correctamente']);
        }

        return to_route('sales.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SaleRequest $request, Sale $sale)
    {
        $validated = $request->validated();
        $sale->update($validated);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Venta actualizada correctamente']);
        }

        return to_route('sales.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sale $sale)
    {
        $sale->delete();

        if (request()->wantsJson()) {
            return response()->json(['message' => 'Venta eliminada correctamente']);
        }

        return to_route('sales.index');
    }

    /**
     * Delete multiple sales at once.
     */
    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['required', 'exists:sales,id'],
        ]);

        Sale::whereIn('id', $request->ids)->delete();

        return response()->json(['message' => 'Ventas eliminadas correctamente']);
    }

    /**
     * Show the bulk upload form.
     */
    public function bulk()
    {
        return Inertia::render('Sale/Bulk', [
            'users' => User::role('pdv')->orderBy('name')->get(['id', 'name', 'dni']),
            'webProducts' => WebProduct::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Download the template for bulk upload.
     */
    public function downloadTemplate()
    {
        $spreadsheet = new Spreadsheet();

        // Hoja de instrucciones
        $worksheet = $spreadsheet->getActiveSheet();
        $worksheet->setTitle('Instrucciones');

        $instructions = [
            ['Instrucciones para la carga masiva de ventas:'],
            [''],
            ['1. Use la hoja "Ventas" para ingresar los datos'],
            ['2. No modifique los encabezados de las columnas'],
            ['3. Todos los campos son obligatorios'],
            ['4. La fecha debe estar en formato DD/MM/YYYY'],
            ['5. El DNI debe existir en el sistema'],
            ['6. Los montos deben ser números enteros positivos'],
            ['7. La calidad del cluster debe ser una de las siguientes: A+, A, B, C'],
            ['8. La acción debe ser una de las siguientes: REGULAR, PREMIUM'],
            ['9. El ID del producto web debe existir en el sistema'],
        ];

        foreach ($instructions as $index => $row) {
            $worksheet->fromArray($row, null, 'A' . ($index + 1));
        }

        // Hoja de ventas
        $worksheet = $spreadsheet->createSheet();
        $worksheet->setTitle('Ventas');

        // Encabezados
        $headers = [
            'DNI PDV',
            'Fecha (DD/MM/YYYY)',
            'Calidad Cluster',
            'Fecha Recarga',
            'Monto Recarga',
            'Monto Acumulado',
            'Cargo Comisionable (1=Sí, 0=No)',
            'Acción',
            'ID Producto Web',
        ];

        $worksheet->fromArray([$headers], null, 'A1');

        // Ejemplo
        $example = [
            '12345678',
            date('d/m/Y'),
            'A',
            date('d/m/Y'),
            '100',
            '500',
            '1',
            'REGULAR',
            '1',
        ];

        $worksheet->fromArray([$example], null, 'A2');

        // Dar formato
        foreach (range('A', 'I') as $col) {
            $worksheet->getColumnDimension($col)->setAutoSize(true);
        }

        $writer = new Xlsx($spreadsheet);
        $filename = 'plantilla_ventas.xlsx';

        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="' . $filename . '"');
        header('Cache-Control: max-age=0');

        $writer->save('php://output');
        exit;
    }

    /**
     * Process the bulk upload file.
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx', 'max:10240'],
        ]);

        try {
            $file = $request->file('file');
            $reader = new \PhpOffice\PhpSpreadsheet\Reader\Xlsx();
            $spreadsheet = $reader->load($file->getPathname());
            $worksheet = $spreadsheet->getSheet(1); // Hoja de ventas
            $rows = $worksheet->toArray();

            // Remover encabezados
            array_shift($rows);

            $results = [
                'total' => 0,
                'success' => 0,
                'errors' => [],
            ];

            DB::beginTransaction();

            foreach ($rows as $index => $row) {
                $results['total']++;
                $rowNumber = $index + 2;

                try {
                    $dni = $row[0];
                    $date = \DateTime::createFromFormat('d/m/Y', $row[1]);
                    $clusterQuality = $row[2];
                    $rechargeDate = \DateTime::createFromFormat('d/m/Y', $row[3]);
                    $rechargeAmount = $row[4];
                    $accumulatedAmount = $row[5];
                    $commissionableCharge = (bool)$row[6];
                    $action = $row[7];
                    $webProductId = $row[8];

                    // Validar datos básicos
                    if (!$dni || !$date || !$clusterQuality || !$rechargeDate || !$rechargeAmount || !$accumulatedAmount || !$webProductId) {
                        throw new \Exception('Faltan datos requeridos');
                    }

                    // Buscar usuario por DNI
                    $user = User::where('dni', $dni)->first();
                    if (!$user) {
                        throw new \Exception('DNI no encontrado en el sistema');
                    }

                    // Validar producto web
                    $webProduct = WebProduct::find($webProductId);
                    if (!$webProduct) {
                        throw new \Exception('Producto web no encontrado');
                    }

                    // Validar calidad del cluster
                    if (!in_array($clusterQuality, ['A+', 'A', 'B', 'C'])) {
                        throw new \Exception('Calidad del cluster no válida');
                    }

                    // Validar montos
                    if ($rechargeAmount < 0 || $accumulatedAmount < 0) {
                        throw new \Exception('Los montos deben ser positivos');
                    }

                    // Validar acción
                    if (!in_array($action, ['REGULAR', 'PREMIUM'])) {
                        throw new \Exception('Acción no válida');
                    }

                    // Crear venta
                    Sale::create([
                        'user_id' => $user->id,
                        'date' => $date->format('Y-m-d'),
                        'cluster_quality' => $clusterQuality,
                        'recharge_date' => $rechargeDate->format('Y-m-d'),
                        'recharge_amount' => $rechargeAmount,
                        'accumulated_amount' => $accumulatedAmount,
                        'commissionable_charge' => $commissionableCharge,
                        'action' => $action,
                        'webproduct_id' => $webProductId,
                    ]);

                    $results['success']++;
                } catch (\Exception $e) {
                    $results['errors'][] = [
                        'row' => $rowNumber,
                        'message' => $e->getMessage(),
                    ];
                }
            }

            if (empty($results['errors'])) {
                DB::commit();
                return redirect()->back()->with('success', 'Se importaron ' . $results['success'] . ' ventas correctamente');
            } else {
                DB::rollBack();
                return redirect()->back()->with('error', 'Se encontraron errores en la importación')->with('results', $results);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Error al procesar el archivo: ' . $e->getMessage());
        }
    }
}
