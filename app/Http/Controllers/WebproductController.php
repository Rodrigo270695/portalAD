<?php

namespace App\Http\Controllers;

use App\Http\Requests\WebproductRequest;
use App\Models\Product;
use App\Models\WebProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WebproductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Product $product)
    {
        $query = WebProduct::where('product_id', $product->id);

        if (request()->has('search')) {
            $search = request('search');
            $query->where('name', 'like', "%{$search}%");
        }

        $webproducts = $query->paginate(request('per_page', 10))
            ->withQueryString();

        return Inertia::render('Product/Webproduct/Index', [
            'webproducts' => $webproducts,
            'product' => $product,
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
    public function store(WebproductRequest $request)
    {
        try {
            WebProduct::create($request->validated());
            return redirect()->back()->with('success', 'Producto web creado correctamente');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'No se pudo crear el producto web');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(WebProduct $webproduct)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(WebProduct $webproduct)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(WebproductRequest $request, WebProduct $webproduct)
    {
        try {
            $webproduct->update($request->validated());
            return redirect()->back()->with('success', 'Producto web actualizado correctamente');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'No se pudo actualizar el producto web');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(WebProduct $webproduct)
    {
        try {
            $webproduct->delete();
            return redirect()->back()->with('success', 'Producto web eliminado correctamente');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'No se pudo eliminar el producto web');
        }
    }
}
