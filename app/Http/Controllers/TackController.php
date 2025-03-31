<?php

namespace App\Http\Controllers;

use App\Http\Requests\TackRequest;
use App\Models\Circuit;
use App\Models\Tack;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TackController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Circuit $circuit)
    {
        $query = Tack::where('circuit_id', $circuit->id);

        if (request()->has('search')) {
            $search = request('search');
            $query->where('name', 'like', "%{$search}%");
        }

        $tacks = $query->paginate(request('per_page', 10))
            ->withQueryString();

        return Inertia::render('Zonal/Circuit/Tack/Index', [
            'tacks' => $tacks,
            'circuit' => $circuit,
            'filters' => request()->only(['search', 'page', 'per_page']),
            'auth' => [
                'user' => Auth::user(),
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
    public function store(TackRequest $request)
    {
        try {
            Tack::create($request->validated());
            return redirect()->back()->with('success', 'Ruta creada correctamente');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'No se pudo crear la ruta');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Tack $tack)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Tack $tack)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(TackRequest $request, Tack $tack)
    {
        try {
            $tack->update($request->validated());
            return redirect()->back()->with('success', 'Ruta actualizada correctamente');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'No se pudo actualizar la ruta');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tack $tack)
    {
        try {
            $tack->delete();
            return redirect()->back()->with('success', 'Ruta eliminada correctamente');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'No se pudo eliminar la ruta');
        }
    }
}
