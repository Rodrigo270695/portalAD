<?php

namespace App\Http\Controllers;

use App\Models\Seller;
use App\Models\User;
use App\Http\Controllers\Controller;
use App\Http\Requests\SellerRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SellerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, User $user)
    {
        $search = $request->input('search', '');
        $perPage = $request->input('per_page', 10);

        $sellers = Seller::query()
            ->where('pdv_id', $user->id)
            ->when($search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('dni', 'like', "%{$search}%")
                        ->orWhere('cel', 'like', "%{$search}%");
                });
            })
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('User/Seller/Index', [
            'sellers' => $sellers,
            'pdv' => $user,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SellerRequest $request)
    {
        $seller = Seller::create($request->validated());

        return redirect()->back()->with('success', 'Vendedor creado correctamente.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SellerRequest $request, Seller $seller)
    {
        $seller->update($request->validated());

        return redirect()->back()->with('success', 'Vendedor actualizado correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Seller $seller)
    {
        $seller->delete();

        return redirect()->back()->with('success', 'Vendedor eliminado correctamente.');
    }
}
