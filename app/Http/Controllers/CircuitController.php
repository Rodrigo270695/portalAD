<?php

namespace App\Http\Controllers;

use App\Http\Requests\CircuitRequest;
use App\Models\Circuit;
use App\Models\Zonal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CircuitController extends Controller
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

        // Validar que perPage sea uno de los valores permitidos
        $allowedPerPage = [10, 20, 50, 100];
        $perPage = in_array((int)$perPage, $allowedPerPage) ? (int)$perPage : 10;

        $circuits = Circuit::with('zonal')
            ->search($search)
            ->orderBy('name')
            ->paginate($perPage, ['*'], 'page', $page)
            ->withQueryString();

        $zonals = Zonal::orderBy('name')->get(['id', 'name', 'short_name']);

        return Inertia::render('Zonal/Circuit/Index', [
            'circuits' => $circuits,
            'zonals' => $zonals,
            'filters' => [
                'search' => $search,
                'page' => $page,
                'per_page' => $perPage,
            ],
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
    public function store(CircuitRequest $request)
    {
        $validated = $request->validated();
        Circuit::create($validated);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Circuito creado correctamente']);
        }

        return to_route('circuits.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Circuit $circuit)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Circuit $circuit)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CircuitRequest $request, Circuit $circuit)
    {
        $validated = $request->validated();
        $circuit->update($validated);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Circuito actualizado correctamente']);
        }

        return to_route('circuits.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Circuit $circuit)
    {
        $circuit->delete();
        return to_route('circuits.index');
    }
}
