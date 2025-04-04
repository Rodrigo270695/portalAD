<?php

namespace App\Http\Controllers;

use App\Http\Requests\ShareRequest;
use App\Models\Share;
use App\Models\User;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Spatie\Permission\Traits\HasRoles;

class ShareController extends Controller
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
        $year = $request->input('year', now()->year);
        $query = Share::with(['user.circuit.zonal', 'user.zonificador.circuit.zonal']);

        // Filtro por año y mes
        $year = $request->year ?? date('Y');
        $month = $request->month ?? date('m');
        $query->where('year', $year)
            ->where('month', $month);

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

        // Obtener el total de montos para los filtros actuales
        $total = $query->sum('amount');

        // Paginar los resultados
        $shares = $query->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->paginate($request->per_page ?? 10)
            ->withQueryString();

        $users = User::role('pdv')->orderBy('name')->get(['id', 'name', 'dni']);

        // Obtener años únicos para el filtro
        $years = Share::distinct()->orderBy('year', 'desc')->pluck('year');

        return Inertia::render('Share/Index', [
            'shares' => $shares,
            'users' => $users,
            'filters' => [
                'search' => $search,
                'page' => $page,
                'per_page' => $perPage,
                'year' => $year,
                'month' => $month,
                'pdv' => $pdv,
                'zonificado' => $zonificado,
            ],
            'years' => $years,
            'total' => $total,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ShareRequest $request)
    {
        $validated = $request->validated();
        Share::create($validated);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Cuota creada correctamente']);
        }

        return to_route('shares.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Share $share)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Share $share)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ShareRequest $request, Share $share)
    {
        $validated = $request->validated();
        $share->update($validated);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Participación actualizada correctamente']);
        }

        return to_route('shares.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Share $share)
    {
        $share->delete();

        return redirect()->back();
    }

    /**
     * Delete multiple shares at once.
     */
    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['required', 'exists:shares,id'],
        ]);

        Share::whereIn('id', $request->ids)->delete();

        return redirect()->back();
    }

    /**
     * Show the bulk upload form.
     */
    public function bulk()
    {
        return Inertia::render('Share/Bulk', [
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
        $sheet->setCellValue('A1', 'Instrucciones para la carga masiva de cuotas');
        $sheet->setCellValue('A3', '1. No modifiques los encabezados de las columnas');
        $sheet->setCellValue('A4', '2. El DNI debe existir en el sistema');
        $sheet->setCellValue('A5', '3. El año debe ser entre 2000 y el próximo año');
        $sheet->setCellValue('A6', '4. El mes debe ser entre 1 y 12');
        $sheet->setCellValue('A7', '5. El monto debe ser un número entero positivo');
        $sheet->setCellValue('A8', '6. No puede haber dos cuotas para el mismo PDV en el mismo mes y año');

        // Hoja de datos
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle('Cuotas');
        $sheet->setCellValue('A1', 'DNI');
        $sheet->setCellValue('B1', 'Año');
        $sheet->setCellValue('C1', 'Mes');
        $sheet->setCellValue('D1', 'Monto');

        // Hoja de referencia
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle('DNIs Válidos');
        $sheet->setCellValue('A1', 'DNI');
        $sheet->setCellValue('B1', 'Nombre');
        $sheet->setCellValue('C1', 'Zonal');

        $row = 2;
        $users = User::role('pdv')
            ->with('circuit.zonal')
            ->get();

        foreach ($users as $user) {
            $sheet->setCellValue('A' . $row, $user->dni);
            $sheet->setCellValue('B' . $row, $user->name);
            $sheet->setCellValue('C' . $row, $user->circuit?->zonal->short_name);
            $row++;
        }

        $writer = new Xlsx($spreadsheet);
        $filename = 'plantilla_cuotas.xlsx';

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
            $worksheet = $spreadsheet->getSheet(1); // Hoja de cuotas
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
                    $year = $row[1];
                    $month = $row[2];
                    $amount = $row[3];

                    // Validar datos básicos
                    if (!$dni || !$year || !$month || !$amount) {
                        throw new \Exception('Faltan datos requeridos');
                    }

                    // Buscar usuario por DNI
                    $user = User::where('dni', $dni)->first();
                    if (!$user) {
                        throw new \Exception('DNI no encontrado en el sistema');
                    }

                    // Validar año
                    if ($year < 2000 || $year > (new DateTime())->format('Y')) {
                        throw new \Exception('Año no válido');
                    }

                    // Validar mes
                    if ($month < 1 || $month > 12) {
                        throw new \Exception('Mes no válido');
                    }

                    // Validar monto
                    if ($amount < 0) {
                        throw new \Exception('Monto no válido');
                    }

                    // Validar duplicados
                    $exists = Share::where('user_id', $user->id)
                        ->where('year', $year)
                        ->where('month', $month)
                        ->exists();

                    if ($exists) {
                        throw new \Exception('Ya existe una cuota para este PDV en el mes y año indicados');
                    }

                    // Crear cuota
                    Share::create([
                        'user_id' => $user->id,
                        'year' => $year,
                        'month' => $month,
                        'amount' => $amount,
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
                return redirect()->back()
                    ->with([
                        'success' => 'Se importaron ' . $results['success'] . ' cuotas correctamente',
                        'results' => $results
                    ]);
            } else {
                DB::rollBack();
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
