<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaleRequest;
use App\Models\Sale;
use App\Models\User;
use App\Models\WebProduct;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use App\Exports\SalesExport;
use Maatwebsite\Excel\Facades\Excel;

class SaleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Obtener parámetros de la solicitud
        $page = $request->input('page', 1);
        $perPage = $request->input('per_page', 10);
        $startDate = $request->input('startDate', now()->format('Y-m-d'));
        $endDate = $request->input('endDate', now()->format('Y-m-d'));
        $pdv = $request->input('pdv');
        $zonificado = $request->input('zonificado');
        $product = $request->input('product');
        $webproduct = $request->input('webproduct');
        $commissionable = $request->input('commissionable');
        $query = Sale::with([
            'user.circuit.zonal',
            'user.zonificador.circuit.zonal',
            'webproduct.product'
        ]);

        if ($startDate && $endDate) {
            $query->whereBetween('date', [$startDate, $endDate]);
        } else {
            $today = now()->setTimezone('America/Lima')->format('Y-m-d');
            $query->whereDate('date', $today);
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
                'startDate' => $startDate,
                'endDate' => $endDate,
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
    /**
     * Export sales to Excel.
     */
    public function export(Request $request)
    {
        try {
            $startDate = $request->input('startDate', now()->format('Y-m-d'));
            $endDate = $request->input('endDate', now()->format('Y-m-d'));
            $pdv = $request->input('pdv');
            $zonificado = $request->input('zonificado');
            $product = $request->input('product');
            $webproduct = $request->input('webproduct');
            $commissionable = $request->input('commissionable');

            $fileName = 'ventas_' . $startDate . '_a_' . $endDate . '.xlsx';

            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();

            // Set headers
            $headers = [
                'ID',
                'Fecha',
                'Teléfono',
                'PDV',
                'DNI PDV',
                'Zonificador',
                'Zonal',
                'Producto',
                'Web Producto',
                'Calidad de Cluster',
                'Fecha de Recarga',
                'Monto de Recarga',
                'Monto Acumulado',
                'Comisionable',
                'Acción',
            ];

            foreach ($headers as $key => $header) {
                $sheet->setCellValue(chr(65 + $key) . '1', $header);
            }

            // Get data
            $query = Sale::query()
                ->with(['user.zonificador.circuit.zonal', 'webproduct.product']);

            // Aplicar filtros
            if ($startDate && $endDate) {
                $query->whereBetween('date', [$startDate, $endDate]);
            }

            // Filtro por PDV
            if ($pdv) {
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
            if ($commissionable && $commissionable !== 'all') {
                $query->where('commissionable_charge', $commissionable === 'true');
            }

            // Filtro por Zonificado y Zonal
            if ($zonificado) {
                $query->whereHas('user.zonificador', function($q) use ($zonificado) {
                    $q->where('name', 'like', "%{$zonificado}%")
                        ->orWhereHas('circuit.zonal', function($q) use ($zonificado) {
                            $q->where('name', 'like', "%{$zonificado}%")
                                ->orWhere('short_name', 'like', "%{$zonificado}%");
                        });
                });
            }

            // Filtro por producto
            if ($product && $product !== 'all') {
                $query->whereHas('webproduct', function($q) use ($product) {
                    $q->where('product_id', $product);
                });
            }

            // Filtro por web producto
            if ($webproduct && $webproduct !== 'all') {
                $query->where('webproduct_id', $webproduct);
            }

            $sales = $query->get();

            // Fill data
            $row = 2;
            foreach ($sales as $sale) {
                $sheet->setCellValue('A' . $row, $sale->id);
                // Formatear la fecha
                $dateValue = \PhpOffice\PhpSpreadsheet\Shared\Date::PHPToExcel($sale->date);
                $sheet->setCellValue('B' . $row, $dateValue);
                $sheet->getStyle('B' . $row)->getNumberFormat()->setFormatCode('yyyy-mm-dd');
                $sheet->setCellValue('C' . $row, $sale->telefono);
                $sheet->setCellValue('D' . $row, $sale->user->name);
                $sheet->setCellValue('E' . $row, $sale->user->dni);
                $sheet->setCellValue('F' . $row, $sale->user->zonificador ? $sale->user->zonificador->name : '');
                $sheet->setCellValue('G' . $row, $sale->user->zonificador ? $sale->user->zonificador->circuit->zonal->name : '');
                $sheet->setCellValue('H' . $row, $sale->webproduct->product ? $sale->webproduct->product->name : '');
                $sheet->setCellValue('I' . $row, $sale->webproduct->name);
                $sheet->setCellValue('J' . $row, $sale->cluster_quality);
                $sheet->setCellValue('K' . $row, $sale->recharge_date);
                $sheet->setCellValue('L' . $row, $sale->recharge_amount);
                $sheet->setCellValue('M' . $row, $sale->accumulated_amount);
                $sheet->setCellValue('N' . $row, $sale->commissionable_charge ? 'Sí' : 'No');
                $sheet->setCellValue('O' . $row, $sale->action);
                $row++;
            }

            // Auto size columns
            foreach (range('A', 'O') as $column) {
                $sheet->getColumnDimension($column)->setAutoSize(true);
            }

            // Create writer
            $writer = new Xlsx($spreadsheet);

            $tempFile = tempnam(sys_get_temp_dir(), 'excel');
            $writer->save($tempFile);

            return response()->file($tempFile, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'attachment; filename="' . $fileName . '"'
            ])->deleteFileAfterSend();

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function downloadTemplate()
    {
        $spreadsheet = new Spreadsheet();

        // Hoja de instrucciones
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Instrucciones');
        $sheet->setCellValue('A1', 'Instrucciones para la carga masiva de ventas');
        $sheet->setCellValue('A3', '1. No modifiques los encabezados de las columnas');
        $sheet->setCellValue('A4', '2. El DNI PDV, la fecha, teléfono, comisionable y producto web son campos OBLIGATORIOS');
        $sheet->setCellValue('A5', '3. El DNI debe existir en el sistema');
        $sheet->setCellValue('A6', '4. La fecha debe estar en formato YYYY-MM-DD');
        $sheet->setCellValue('A7', '5. El campo comisionable debe ser 1 (Sí) o 0 (No)');
        $sheet->setCellValue('A8', '6. Los montos deben ser números');

        // Hoja de datos
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle('Ventas');
        $sheet->setCellValue('A1', 'DNI PDV');
        $sheet->setCellValue('B1', 'Fecha');
        $sheet->setCellValue('C1', 'Teléfono');
        $sheet->setCellValue('D1', 'Calidad de Cluster');
        $sheet->setCellValue('E1', 'Fecha Recarga');
        $sheet->setCellValue('F1', 'Monto Recarga');
        $sheet->setCellValue('G1', 'Monto Acumulado');
        $sheet->setCellValue('H1', 'Comisionable');
        $sheet->setCellValue('I1', 'Acción');
        $sheet->setCellValue('J1', 'Producto Web');

        // Dar formato a los encabezados y ajustar ancho
        foreach (range('A', 'J') as $col) {
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
            $sheet->setCellValue('C' . $row, $user->circuit?->zonal->name);
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
                'total' => count($rows),
                'success' => 0,
                'errors' => [],
            ];

            DB::beginTransaction();

            // Array para rastrear teléfonos por mes/año
            $phoneTracker = [];
            
            // Preparar el array para inserción masiva
            $salesData = [];
            $chunkSize = 100; // Procesar en lotes de 100 registros

            foreach ($rows as $index => $row) {
                $rowNumber = $index + 2;

                try {
                    // Extraer datos requeridos
                    $dni = str_pad(trim($row[0]), 8, '0', STR_PAD_LEFT);
                    $date = trim($row[1]);
                    $phone = trim($row[2]);
                    $webProductName = trim($row[9]);
                    $commissionableCharge = $row[7];

                    // Validar campos requeridos
                    if (!$dni || !$date || !$phone || !$webProductName || !isset($commissionableCharge)) {
                        throw new \Exception('Faltan campos requeridos (DNI, Fecha, Teléfono, Producto Web o Comisionable)');
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

                    // Validar teléfono
                    if (!preg_match('/^9\d{8}$/', $phone)) {
                        throw new \Exception('El teléfono debe tener 9 dígitos, ser solo números y empezar con 9');
                    }

                    // Validar teléfono duplicado en el mismo mes/año
                    $monthYear = $dateObj->format('Y-m');
                    
                    // Verificar en la base de datos
                    $existingPhone = Sale::where('telefono', $phone)
                        ->whereRaw("DATE_FORMAT(date, '%Y-%m') = ?", [$monthYear])
                        ->exists();

                    // Verificar en los datos que se están procesando
                    $phoneInCurrentBatch = isset($phoneTracker[$monthYear]) && 
                        in_array($phone, $phoneTracker[$monthYear]);

                    if ($existingPhone || $phoneInCurrentBatch) {
                        throw new \Exception("El teléfono {$phone} ya existe en el mes de " . 
                            $dateObj->format('F Y'));
                    }

                    // Agregar teléfono al tracker
                    if (!isset($phoneTracker[$monthYear])) {
                        $phoneTracker[$monthYear] = [];
                    }
                    $phoneTracker[$monthYear][] = $phone;

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
                    $rechargeDate = !empty($row[4]) ? \DateTime::createFromFormat('Y-m-d', trim($row[4])) : null;
                    if (!empty($row[4]) && !$rechargeDate) {
                        throw new \Exception('Formato de fecha de recarga inválido, debe ser YYYY-MM-DD');
                    }

                    $rechargeAmount = !empty($row[5]) ? trim($row[5]) : null;
                    if ($rechargeAmount !== null && !is_numeric($rechargeAmount)) {
                        throw new \Exception('El monto de recarga debe ser un número');
                    }

                    $accumulatedAmount = !empty($row[6]) ? trim($row[6]) : null;
                    if ($accumulatedAmount !== null && !is_numeric($accumulatedAmount)) {
                        throw new \Exception('El monto acumulado debe ser un número');
                    }

                    // Preparar datos para inserción masiva
                    $salesData[] = [
                        'user_id' => $user->id,
                        'date' => $dateObj->format('Y-m-d'),
                        'telefono' => $phone,
                        'cluster_quality' => !empty($row[3]) ? trim($row[3]) : null,
                        'recharge_date' => $rechargeDate ? $rechargeDate->format('Y-m-d') : null,
                        'recharge_amount' => $rechargeAmount,
                        'accumulated_amount' => $accumulatedAmount,
                        'commissionable_charge' => (bool)$commissionableCharge,
                        'action' => !empty($row[8]) ? trim($row[8]) : null,
                        'webproduct_id' => $webProduct->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];

                    $results['success']++;

                    // Insertar en lotes cuando alcanzamos el tamaño del chunk
                    if (count($salesData) >= $chunkSize) {
                        Sale::insert($salesData);
                        $salesData = []; // Limpiar el array después de la inserción
                    }

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

            // Insertar los registros restantes
            if (!empty($salesData)) {
                Sale::insert($salesData);
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

    /**
     * Actualización masiva de ventas usando el teléfono y fecha como identificadores
     */
    public function bulkUpdate(Request $request)
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
                'total' => count($rows),
                'success' => 0,
                'not_found' => 0,
                'errors' => [],
            ];

            DB::beginTransaction();

            // Procesar en lotes para mejor rendimiento
            $chunkSize = 100;
            $updates = [];

            foreach ($rows as $index => $row) {
                $rowNumber = $index + 2;

                try {
                    // Extraer datos requeridos para la búsqueda
                    $phone = trim($row[2]);
                    $date = trim($row[1]);

                    // Validaciones básicas
                    if (!$phone || !$date) {
                        throw new \Exception('Faltan campos requeridos (Teléfono o Fecha)');
                    }

                    // Validar teléfono
                    if (!preg_match('/^9\d{8}$/', $phone)) {
                        throw new \Exception('El teléfono debe tener 9 dígitos, ser solo números y empezar con 9');
                    }

                    // Validar y formatear fecha
                    $dateObj = \DateTime::createFromFormat('Y-m-d', $date);
                    if (!$dateObj) {
                        throw new \Exception('Formato de fecha inválido, debe ser YYYY-MM-DD');
                    }

                    // Buscar la venta existente
                    $monthYear = $dateObj->format('Y-m');
                    $sale = Sale::where('telefono', $phone)
                        ->whereRaw("DATE_FORMAT(date, '%Y-%m') = ?", [$monthYear])
                        ->first();

                    if (!$sale) {
                        $results['not_found']++;
                        throw new \Exception("No se encontró venta para el teléfono {$phone} en el mes de " . 
                            $dateObj->format('F Y'));
                    }

                    // Preparar datos para actualización
                    $updateData = [];

                    // Actualizar DNI y usuario si se proporciona
                    if (!empty($row[0])) {
                        $dni = str_pad(trim($row[0]), 8, '0', STR_PAD_LEFT);
                        $user = User::where('dni', $dni)->first();
                        if (!$user) {
                            throw new \Exception('DNI no encontrado en el sistema: ' . $dni);
                        }
                        $updateData['user_id'] = $user->id;
                    }

                    // Actualizar cluster_quality si se proporciona
                    if (!empty($row[3])) {
                        $updateData['cluster_quality'] = trim($row[3]);
                    }

                    // Actualizar fecha de recarga si se proporciona
                    if (!empty($row[4])) {
                        $rechargeDate = \DateTime::createFromFormat('Y-m-d', trim($row[4]));
                        if (!$rechargeDate) {
                            throw new \Exception('Formato de fecha de recarga inválido, debe ser YYYY-MM-DD');
                        }
                        $updateData['recharge_date'] = $rechargeDate->format('Y-m-d');
                    }

                    // Actualizar monto de recarga si se proporciona
                    if (!empty($row[5])) {
                        $rechargeAmount = trim($row[5]);
                        if (!is_numeric($rechargeAmount)) {
                            throw new \Exception('El monto de recarga debe ser un número');
                        }
                        $updateData['recharge_amount'] = $rechargeAmount;
                    }

                    // Actualizar monto acumulado si se proporciona
                    if (!empty($row[6])) {
                        $accumulatedAmount = trim($row[6]);
                        if (!is_numeric($accumulatedAmount)) {
                            throw new \Exception('El monto acumulado debe ser un número');
                        }
                        $updateData['accumulated_amount'] = $accumulatedAmount;
                    }

                    // Actualizar comisionable si se proporciona
                    if (isset($row[7])) {
                        $commissionableCharge = $row[7];
                        if (!in_array($commissionableCharge, ['0', '1', 0, 1])) {
                            throw new \Exception('El campo comisionable debe ser 0 o 1');
                        }
                        $updateData['commissionable_charge'] = (bool)$commissionableCharge;
                    }

                    // Actualizar acción si se proporciona
                    if (!empty($row[8])) {
                        $updateData['action'] = trim($row[8]);
                    }

                    // Actualizar producto web si se proporciona
                    if (!empty($row[9])) {
                        $webProductName = trim($row[9]);
                        $webProduct = WebProduct::where('name', $webProductName)->first();
                        if (!$webProduct) {
                            throw new \Exception('Producto web no encontrado');
                        }
                        $updateData['webproduct_id'] = $webProduct->id;
                    }

                    if (!empty($updateData)) {
                        $updateData['updated_at'] = now();
                        $updates[] = [
                            'id' => $sale->id,
                            'data' => $updateData
                        ];

                        // Procesar actualizaciones en lotes
                        if (count($updates) >= $chunkSize) {
                            $this->processBatchUpdates($updates);
                            $updates = [];
                        }

                        $results['success']++;
                    }

                } catch (\Exception $e) {
                    $results['errors'][] = [
                        'row' => $rowNumber,
                        'message' => $e->getMessage()
                    ];
                }
            }

            // Procesar las actualizaciones restantes
            if (!empty($updates)) {
                $this->processBatchUpdates($updates);
            }

            if (empty($results['errors'])) {
                DB::commit();
                return redirect()->back()
                    ->with([
                        'success' => "Se actualizaron {$results['success']} ventas correctamente" . 
                            ($results['not_found'] > 0 ? " ({$results['not_found']} no encontradas)" : ""),
                        'results' => $results
                    ]);
            } else {
                DB::rollBack();
                return redirect()->back()
                    ->with([
                        'error' => 'Se encontraron errores en la actualización',
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
                        'not_found' => 0,
                        'errors' => [[
                            'row' => 0,
                            'message' => $e->getMessage()
                        ]]
                    ]
                ]);
        }
    }

    /**
     * Procesa las actualizaciones en lotes
     */
    private function processBatchUpdates($updates)
    {
        foreach ($updates as $update) {
            Sale::where('id', $update['id'])->update($update['data']);
        }
    }
}
