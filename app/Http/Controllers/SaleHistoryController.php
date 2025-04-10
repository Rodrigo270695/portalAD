<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\User;
use App\Models\WebProduct;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Spatie\Permission\Traits\HasRoles;

class SaleHistoryController extends Controller
{
    use HasRoles;

    public function index(Request $request)
    {
        $startDate = $request->input('startDate') ? Carbon::parse($request->input('startDate')) : now()->startOfMonth();
        $endDate = $request->input('endDate') ? Carbon::parse($request->input('endDate')) : now();

        $user = Auth::user();
        if (!$user || !($user instanceof \App\Models\User)) {
            return redirect()->back();
        }

        $isPdv = $user->hasRole('pdv');
        $isZonificado = $user->hasRole('zonificado');

        $query = Sale::query()
            ->whereBetween('date', [$startDate->startOfDay(), $endDate->endOfDay()]);

        // Si es PDV, solo mostrar sus ventas
        if ($isPdv) {
            $query->where('user_id', $user->id);
        }
        // Si es zonificado, mostrar ventas de sus PDVs
        elseif ($isZonificado) {
            $pdvIds = User::where('zonificado_id', $user->id)->pluck('id')->toArray();
            $query->whereIn('user_id', $pdvIds);
        }

        // Agrupar ventas por fecha y producto
        $salesData = $query->get()
            ->groupBy(function($sale) {
                return Carbon::parse($sale->date)->format('Y-m-d');
            })
            ->map(function($sales) {
                return $sales->groupBy('webproduct_id')
                    ->map(function($productSales) {
                        return $productSales->count(); 
                    });
            });

        // Si es PDV o zonificado, obtener detalle de ventas
        $salesDetails = [];
        if ($isPdv || $isZonificado) {
            $detailsQuery = Sale::query()
                ->whereBetween('date', [$startDate->startOfDay(), $endDate->endOfDay()]);

            if ($isPdv) {
                $detailsQuery->where('user_id', $user->id);
            } elseif ($isZonificado) {
                $detailsQuery->whereIn('user_id', $pdvIds);
            }

            $salesDetails = $detailsQuery
                ->with(['user:id,name,dni', 'webproduct:id,name'])
                ->get()
                ->groupBy(function($sale) {
                    return Carbon::parse($sale->date)->format('Y-m-d');
                })
                ->map(function($sales) {
                    return $sales->groupBy('webproduct_id')
                        ->map(function($productSales) {
                            return $productSales->groupBy('user_id')
                                ->map(function($userSales) {
                                    $user = $userSales->first()->user;
                                    return [
                                        'user_name' => $user->name . ' (' . $user->dni . ')',
                                        'count' => $userSales->count()
                                    ];
                                });
                        });
                });
        }

        $webProducts = WebProduct::orderBy('name')->get(['id', 'name']);

        return Inertia::render('SalesHistory/Index', [
            'salesData' => $salesData,
            'salesDetails' => $salesDetails,
            'webProducts' => $webProducts,
            'startDate' => $startDate->format('Y-m-d'),
            'endDate' => $endDate->format('Y-m-d'),
            'isZonificado' => $isZonificado,
            'isPdv' => $isPdv
        ]);
    }
}
