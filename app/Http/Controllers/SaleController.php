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
                // Si el pdv parece ser un DNI (solo números), aplicar padding
                if (is_numeric($pdv)) {
                    $paddedDni = str_pad($pdv, 8, '0', STR_PAD_LEFT);
                    $q->where('name', 'like', "%{$pdv}%")
                        ->orWhere('dni', $paddedDni);
                } else {
                    $q->where('name', 'like', "%{$pdv}%")
                        ->orWhere('dni', 'like', "%{$pdv}%");
                }
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
            'success' => session('success'),
            'error' => session('error'),
            'results' => session('results'),
        ]);
    }

    /**
     * Download the template for bulk upload.
     */
    public function downloadTemplate()
    {
        $spreadsheet = new Spreadsheet();

        // Hoja de instrucciones
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Instrucciones');
        $sheet->setCellValue('A1', 'Instrucciones para la carga masiva de ventas');
        $sheet->setCellValue('A3', '1. No modifiques los encabezados de las columnas');
        $sheet->setCellValue('A4', '2. El DNI debe existir en el sistema');
        $sheet->setCellValue('A5', '3. La fecha debe estar en formato YYYY-MM-DD');
        $sheet->setCellValue('A6', '4. El campo comisionable debe ser 1 (Sí) o 0 (No)');
        $sheet->setCellValue('A7', '5. Los montos deben ser números');

        // Hoja de datos
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle('Ventas');
        $sheet->setCellValue('A1', 'DNI PDV');
        $sheet->setCellValue('B1', 'Fecha');
        $sheet->setCellValue('C1', 'Calidad Cluster');
        $sheet->setCellValue('D1', 'Fecha Recarga');
        $sheet->setCellValue('E1', 'Monto Recarga');
        $sheet->setCellValue('F1', 'Monto Acumulado');
        $sheet->setCellValue('G1', 'Comisionable');
        $sheet->setCellValue('H1', 'Acción');
        $sheet->setCellValue('I1', 'Producto Web');

        // Dar formato a los encabezados y ajustar ancho
        foreach (range('A', 'I') as $col) {
            $sheet->getStyle($col . '1')->applyFromArray([
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E8E8E8']
                ]
            ]);
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Hoja de referencia
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle('Referencias');

        // DNIs válidos
        $sheet->setCellValue('A1', 'DNIs Válidos');
        $sheet->setCellValue('A2', 'DNI');
        $sheet->setCellValue('B2', 'Nombre');
        $sheet->setCellValue('C2', 'Zonal');

        $row = 3;
        $users = User::role('pdv')
            ->with('circuit.zonal')
            ->get();

        foreach ($users as $user) {
            $sheet->setCellValue('A' . $row, $user->dni);
            $sheet->setCellValue('B' . $row, $user->name);
            $sheet->setCellValue('C' . $row, $user->circuit?->zonal->short_name);
            $row++;
        }

        // Productos Web válidos
        $row += 2;
        $sheet->setCellValue('A' . $row, 'Productos Web Válidos');
        $row++;
        $products = WebProduct::pluck('name');
        foreach ($products as $product) {
            $sheet->setCellValue('A' . $row, $product);
            $row++;
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
        // Si es solo registros exitosos, validar que el archivo exista en la sesión
        if ($request->input('only_successful')) {
            $previousResults = session('original_data');
            if (!$previousResults || empty($previousResults['rows'])) {
                return redirect()->back()->with('error', 'No hay resultados previos para procesar');
            }
            $rows = collect($previousResults['rows'])
                ->filter(function ($row, $index) use ($previousResults) {
                    return !collect($previousResults['results']['errors'])
                        ->pluck('row')
                        ->contains($index + 2);
                })
                ->values()
                ->all();
        }
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx', 'max:10240'],
        ]);

        try {
            if (!$request->input('only_successful')) {
                $file = $request->file('file');
                $reader = new \PhpOffice\PhpSpreadsheet\Reader\Xlsx();
                $spreadsheet = $reader->load($file->getPathname());
                $worksheet = $spreadsheet->getSheet(1); // Hoja de ventas
                $rows = $worksheet->toArray();

                // Remover encabezados
                array_shift($rows);

                // Guardar datos originales en la sesión
                session(['original_data' => [
                    'rows' => $rows,
                    'results' => null
                ]]);
            }

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
                    // Extraer datos requeridos
                    $dni = str_pad(trim($row[0]), 8, '0', STR_PAD_LEFT);
                    $date = trim($row[1]);
                    $webProductName = trim($row[8]);
                    $commissionableCharge = $row[6];

                    // Validar campos requeridos
                    if (!$dni || !$date || !$webProductName || !isset($commissionableCharge)) {
                        throw new \Exception('Faltan campos requeridos (DNI, Fecha, Producto Web o Comisionable)');
                    }

                    // Validar DNI
                    $user = User::where('dni', $dni)->first();
                    if (!$user) {
                        throw new \Exception('DNI no encontrado en el sistema: ' . $dni . '|' . $dni);
                    }

                    // Validar fecha
                    $dateObj = \DateTime::createFromFormat('Y-m-d', $date);
                    if (!$dateObj) {
                        throw new \Exception('Formato de fecha inválido, debe ser YYYY-MM-DD');
                    }

                    // Validar producto web
                    $webProduct = WebProduct::where('name', $webProductName)->first();
                    if (!$webProduct) {
                        throw new \Exception('Producto web no encontrado');
                    }

                    // Validar comisionable
                    if (!in_array($commissionableCharge, ['0', '1', 0, 1])) {
                        throw new \Exception('El campo comisionable debe ser 0 o 1');
                    }

                    // Validar campos opcionales con formato
                    $rechargeDate = !empty($row[3]) ? \DateTime::createFromFormat('Y-m-d', trim($row[3])) : null;
                    if (!empty($row[3]) && !$rechargeDate) {
                        throw new \Exception('Formato de fecha de recarga inválido, debe ser YYYY-MM-DD');
                    }

                    $rechargeAmount = !empty($row[4]) ? trim($row[4]) : null;
                    if ($rechargeAmount !== null && !is_numeric($rechargeAmount)) {
                        throw new \Exception('El monto de recarga debe ser un número');
                    }

                    $accumulatedAmount = !empty($row[5]) ? trim($row[5]) : null;
                    if ($accumulatedAmount !== null && !is_numeric($accumulatedAmount)) {
                        throw new \Exception('El monto acumulado debe ser un número');
                    }

                    // Crear venta
                    Sale::create([
                        'user_id' => $user->id,
                        'date' => $dateObj->format('Y-m-d'),
                        'cluster_quality' => !empty($row[2]) ? trim($row[2]) : null,
                        'recharge_date' => $rechargeDate ? $rechargeDate->format('Y-m-d') : null,
                        'recharge_amount' => $rechargeAmount,
                        'accumulated_amount' => $accumulatedAmount,
                        'commissionable_charge' => (bool)$commissionableCharge,
                        'action' => !empty($row[7]) ? trim($row[7]) : null,
                        'webproduct_id' => $webProduct->id, // Usar el ID del producto web encontrado
                    ]);

                    $results['success']++;
                } catch (\Exception $e) {
                    $error = [
                        'row' => $rowNumber,
                        'message' => $e->getMessage(),
                    ];
                    $message = $e->getMessage();
                    if (strpos($message, '|') !== false) {
                        $error['dni'] = explode('|', $message)[1];
                    }
                    $results['errors'][] = $error;
                }
            }

            if (empty($results['errors'])) {
                DB::commit();
                session()->forget('original_data');
                return redirect()->back()
                    ->with([
                        'success' => 'Se importaron ' . $results['success'] . ' ventas correctamente',
                        'results' => $results
                    ]);
            } else {
                DB::rollBack();
                // Actualizar los resultados en los datos originales
                if (!$request->input('only_successful')) {
                    session()->put('original_data.results', $results);
                }
                return redirect()->back()
                    ->with([
                        'error' => 'Se encontraron errores en la importación',
                        'results' => $results
                    ]);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with([
                    'error' => 'Error al procesar el archivo: ' . $e->getMessage(),
                    'results' => [
                        'total' => 0,
                        'success' => 0,
                        'errors' => [[
                            'row' => 0,
                            'message' => $e->getMessage()
                        ]]
                    ]
                ]);
        }
    }
}
