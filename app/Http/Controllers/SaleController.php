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
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);
        $date = $request->input('date', now()->setTimezone('America/Lima')->format('Y-m-d'));
        $query = Sale::with([
            'user.circuit.zonal',
            'user.zonificador.circuit.zonal',
            'webproduct.product'
        ]);

        // Filtro por fecha
        if ($date && $date !== '') {
            $query->whereDate('date', $date);
        }

        // Filtro por PDV
        if ($pdv = $request->pdv) {
            $query->whereHas('user', function($q) use ($pdv) {
                $q->where('name', 'like', "%{$pdv}%")
                    ->orWhere('dni', 'like', "%{$pdv}%");
            });
        }

        // Filtro por comisionable
        if ($commissionable = $request->commissionable) {
            if ($commissionable !== 'all') {
                $query->where('commissionable_charge', $commissionable === 'true');
            }
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

        // Filtro por producto
        if ($product = $request->product) {
            if ($product !== 'all') {
                $query->whereHas('webproduct', function($q) use ($product) {
                    $q->where('product_id', $product);
                });
            }
        }

        // Filtro por web producto
        if ($webproduct = $request->webproduct) {
            if ($webproduct !== 'all') {
                $query->where('webproduct_id', $webproduct);
            }
        }

        // Obtener totales para los filtros actuales
        $totals = [
            'recharge_amount' => $query->sum('recharge_amount'),
            'accumulated_amount' => $query->sum('accumulated_amount'),
            'commissionable_charges' => $query->count(),
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
                'page' => $page,
                'per_page' => $perPage,
                'date' => $date,
                'pdv' => $pdv,
                'zonificado' => $zonificado,
                'product' => $product,
                'webproduct' => $webproduct,
                'commissionable' => $commissionable,
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
        $sale = Sale::create($request->validated());

        return back()->with('success', 'Venta creada correctamente.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SaleRequest $request, Sale $sale)
    {
        $sale->update($request->validated());

        return back()->with('success', 'Venta actualizada correctamente.');
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

        // Primera hoja: Instrucciones
        $spreadsheet->getActiveSheet()
            ->setTitle('Instrucciones')
            ->setCellValue('A1', 'Instrucciones para la carga masiva de ventas')
            ->setCellValue('A3', '1. La segunda hoja contiene la plantilla para cargar las ventas.')
            ->setCellValue('A4', '2. Los campos marcados con (*) son obligatorios.')
            ->setCellValue('A5', '3. El formato de fecha debe ser DD/MM/YYYY.')
            ->setCellValue('A6', '4. El DNI del PDV debe existir en el sistema.')
            ->setCellValue('A7', '5. El ID del producto web debe existir en el sistema.')
            ->setCellValue('A8', '6. La calidad del cluster debe ser uno de: Cluster 1: IMEI nuevo, Cluster 2: IMEI reutilizado, Cluster 3: IMEI en 2 alta, Cluster 4: IMEI sospechoso, Cluster 5: Sin trafico, PENDIENTE CLUSTERIZAR')
            ->setCellValue('A9', '7. La acción debe ser una de: MULTIMARCA, PDV PREMIUM, PDV REGULAR, NO GESTIONABLE')
            ->setCellValue('A10', '8. Los montos deben ser números enteros.')
            ->setCellValue('A11', '9. El campo comisionable debe ser 1 (Sí) o 0 (No).');

        // Segunda hoja: Plantilla
        $worksheet = $spreadsheet->createSheet();
        $worksheet->setTitle('Plantilla');

        // Encabezados
        $headers = [
            'DNI PDV (*)',
            'Fecha (*)',
            'Calidad Cluster (*)',
            'Fecha Recarga (*)',
            'Monto Recarga (*)',
            'Monto Acumulado (*)',
            'Comisionable (*)',
            'Acción (*)',
            'ID Producto Web (*)',
        ];

        // Establecer encabezados
        foreach ($headers as $col => $header) {
            $worksheet->setCellValue(chr(65 + $col) . '1', $header);
        }

        // Ajustar ancho de columnas
        foreach (range('A', 'I') as $col) {
            $worksheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Crear el archivo
        $writer = new Xlsx($spreadsheet);
        $filename = 'plantilla_carga_ventas.xlsx';

        // Descargar
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
        try {
            $file = $request->file('file');
            if (!$file) {
                throw new \Exception('No se ha seleccionado ningún archivo');
            }

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
                    $validClusters = ['Cluster 1: IMEI nuevo', 'Cluster 2: IMEI reutilizado', 'Cluster 3: IMEI en 2 alta', 'Cluster 4: IMEI sospechoso', 'Cluster 5: Sin trafico', 'PENDIENTE CLUSTERIZAR'];
                    if (!in_array($clusterQuality, $validClusters)) {
                        throw new \Exception('Calidad del cluster no válida');
                    }

                    // Validar acción
                    $validActions = ['MULTIMARCA', 'PDV PREMIUM', 'PDV REGULAR', 'NO GESTIONABLE'];
                    if (!in_array($action, $validActions)) {
                        throw new \Exception('Acción no válida');
                    }

                    // Validar montos
                    if (!is_numeric($rechargeAmount) || !is_numeric($accumulatedAmount)) {
                        throw new \Exception('Los montos deben ser números');
                    }

                    if ($rechargeAmount < 0 || $accumulatedAmount < 0) {
                        throw new \Exception('Los montos deben ser positivos');
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
