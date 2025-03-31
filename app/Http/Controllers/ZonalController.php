<?php

namespace App\Http\Controllers;

use App\Http\Requests\ZonalRequest;
use App\Models\Zonal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ZonalController extends Controller
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

        $zonals = Zonal::search($search)
            ->orderBy('name')
            ->paginate($perPage, ['*'], 'page', $page)
            ->withQueryString();

        return Inertia::render('Zonal/Zonal/Index', [
            'zonals' => $zonals,
            'filters' => [
                'search' => $search,
                'page' => $page,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ZonalRequest $request)
    {
        $validated = $request->validated();
        Zonal::create($validated);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Zonal creado correctamente']);
        }

        return to_route('zonals.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ZonalRequest $request, Zonal $zonal)
    {
        $validated = $request->validated();
        $zonal->update($validated);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Zonal actualizado correctamente']);
        }

        return to_route('zonals.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Zonal $zonal)
    {
        $zonal->delete();

        return redirect()->route('zonals.index')
            ->with('success', 'Zonal eliminado correctamente');
    }
}
