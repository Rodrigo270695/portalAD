<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
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

        $products = Product::search($search)
            ->orderBy('name')
            ->paginate($perPage, ['*'], 'page', $page)
            ->withQueryString();

        return Inertia::render('Product/Index', [
            'products' => $products,
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
    public function store(ProductRequest $request)
    {
        $validated = $request->validated();
        Product::create($validated);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Producto creado correctamente']);
        }

        return to_route('products.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProductRequest $request, Product $product)
    {
        $validated = $request->validated();
        $product->update($validated);

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Producto actualizado correctamente']);
        }

        return to_route('products.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->route('products.index')
            ->with('success', 'Producto eliminado correctamente');
    }
}
