<?php

namespace App\Http\Controllers;

use App\Models\Share;
use App\Models\User;
use App\Models\Sale;
use App\Models\Product;
use App\Models\WebProduct;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Display the dashboard view.
     */
    public function index()
    {
        $user = Auth::user();
        $userData = User::with(['zonificador' => function($query) {
            $query->select('id', 'name', 'dni', 'cel');
        }, 'circuit'])->find($user->id);

        // Obtener el mes y año actual
        $currentYear = now()->year;
        $currentMonth = now()->month;

        // Calcular la cuota total según el rol del usuario
        $totalShare = 0;
        $pdvCount = 0;
        $totalPrepagoSales = 0;
        $totalRecharges = 0;

        // Obtener todos los productos web
        $webProducts = WebProduct::with('product')->get();
        $webProductIds = $webProducts->pluck('id')->toArray();

        // Preparar datos de ventas diarias
        $dailySalesData = [];

        if ($user->hasRole('pdv')) {
            // Si es PDV, obtener su cuota y ventas prepago directamente
            $totalShare = Share::where('user_id', $user->id)
                ->where('year', $currentYear)
                ->where('month', $currentMonth)
                ->value('amount') ?? 0;
            
            // Consulta base para ventas prepago del PDV
            $salesQuery = Sale::where('user_id', $user->id)
                ->whereMonth('date', $currentMonth)
                ->whereYear('date', $currentYear)
                ->whereHas('webproduct', function($query) use ($webProductIds) {
                    $query->whereIn('id', $webProductIds)
                        ->whereHas('product', function($query) {
                            $query->where('name', 'like', '%PREPAGO%');
                        });
                });

            // Contar total de ventas prepago
            $totalPrepagoSales = (clone $salesQuery)->count();
            
            // Contar recargas comisionables
            $totalRecharges = (clone $salesQuery)
                ->where('commissionable_charge', true)
                ->count();

            // Obtener ventas diarias del PDV (todas las ventas web)
            $dailySales = Sale::where('user_id', $user->id)
                ->whereMonth('date', $currentMonth)
                ->whereYear('date', $currentYear)
                ->whereHas('webproduct', function($query) use ($webProductIds) {
                    $query->whereIn('id', $webProductIds);
                })
                ->select('date', 'webproduct_id', DB::raw('count(*) as total'))
                ->groupBy('date', 'webproduct_id')
                ->orderBy('date', 'desc')
                ->get();

            $dailySalesData[] = [
                'pdv_id' => $user->id,
                'pdv_name' => $user->name,
                'sales' => $this->formatDailySales($dailySales, $webProducts)
            ];

        } elseif ($user->hasRole('zonificado')) {
            // Si es zonificado, obtener todos sus PDVs
            $pdvIds = User::where('zonificado_id', $user->id)->pluck('id');
            $pdvCount = $pdvIds->count();

            // Sumar las cuotas de todos sus PDVs
            $totalShare = Share::whereIn('user_id', $pdvIds)
                ->where('year', $currentYear)
                ->where('month', $currentMonth)
                ->sum('amount');

            // Consulta base para ventas prepago de todos los PDVs
            $salesQuery = Sale::whereIn('user_id', $pdvIds)
                ->whereMonth('date', $currentMonth)
                ->whereYear('date', $currentYear)
                ->whereHas('webproduct', function($query) use ($webProductIds) {
                    $query->whereIn('id', $webProductIds);
                });

            // Contar total de ventas prepago
            $totalPrepagoSales = (clone $salesQuery)->count();
            
            // Contar recargas comisionables
            $totalRecharges = (clone $salesQuery)
                ->where('commissionable_charge', true)
                ->count();

            // Obtener todos los PDVs del zonificado
            $pdvs = User::where('zonificado_id', $user->id)->get();

            foreach ($pdvs as $pdv) {
                // Obtener solo las ventas del PDV actual para productos web
                $pdvSales = Sale::select('date', 'webproduct_id', DB::raw('COUNT(*) as total'))
                    ->where('user_id', $pdv->id)
                    ->whereMonth('date', $currentMonth)
                    ->whereYear('date', $currentYear)
                    ->whereHas('webproduct', function($query) use ($webProductIds) {
                        $query->whereIn('id', $webProductIds);
                    })
                    ->groupBy('date', 'webproduct_id', 'user_id')
                    ->having('total', '>', 0)
                    ->orderBy('date', 'desc')
                    ->get();
                
                // Si no hay ventas, continuar con el siguiente PDV
                if ($pdvSales->isEmpty()) {
                    continue;
                }

                $dailySalesData[] = [
                    'pdv_id' => $pdv->id,
                    'pdv_name' => $pdv->name,
                    'sales' => $this->formatDailySales($pdvSales, $webProducts)
                ];
            }
        }

        // Calcular ratio (porcentaje de recargas sobre ventas totales)
        $ratio = $totalPrepagoSales > 0 ? ($totalRecharges / $totalPrepagoSales) * 100 : 0;

        // Calcular métricas para el semáforo
        $remainingForQuota = max(0, $totalShare - $totalPrepagoSales);
        $quotaProgress = $totalShare > 0 ? ($totalPrepagoSales / $totalShare) * 100 : 0;
        
        // Determinar color del semáforo para la cuota
        $quotaStatus = 'red';
        if ($quotaProgress >= 100) {
            $quotaStatus = 'green';
        } elseif ($quotaProgress >= 90) {
            $quotaStatus = 'yellow';
        }

        // Calcular métricas para el ratio
        $targetRatio = 50;
        $ratioStatus = 'red';
        $rechargesNeededForRatio = 0;

        if ($ratio >= 50) {
            $ratioStatus = 'green';
        } elseif ($ratio >= 40) {
            $ratioStatus = 'yellow';
            $rechargesNeededForRatio = ceil(($targetRatio * $totalPrepagoSales / 100) - $totalRecharges);
        } else {
            $rechargesNeededForRatio = ceil(($targetRatio * $totalPrepagoSales / 100) - $totalRecharges);
        }

        return Inertia::render('dashboard', [
            'userData' => [
                'name' => $userData->name,
                'dni' => $userData->dni,
                'vendorName' => $userData->zonificador?->name ?? 'No asignado',
                'vendorDNI' => $userData->zonificador?->dni ?? 'No asignado',
                'vendorPhone' => $userData->zonificador?->cel ?? 'No asignado',
                'channel' => 'PDV',
                'group' => $userData->circuit?->name ?? 'No asignado',
                'updateDate' => $userData->updated_at->format('d-m-Y'),
                'pdvLevel' => $userData->action ?? 'PDV REGULAR',
                'totalShare' => $totalShare,
                'pdvCount' => $pdvCount,
                'isZonificado' => $user->hasRole('zonificado'),
                'salesData' => [
                    'totalSales' => $totalPrepagoSales,
                    'totalRecharges' => $totalRecharges,
                    'ratio' => $ratio,
                    'quotaMetrics' => [
                        'remaining' => $remainingForQuota,
                        'progress' => $quotaProgress,
                        'status' => $quotaStatus
                    ],
                    'ratioMetrics' => [
                        'rechargesNeeded' => $rechargesNeededForRatio,
                        'status' => $ratioStatus
                    ],
                    'webProducts' => $webProducts->map(fn($wp) => [
                        'id' => $wp->id,
                        'name' => $wp->name,
                        'product_name' => $wp->product->name
                    ]),
                    'dailySales' => $dailySalesData
                ]
            ]
        ]);
    }

    /**
     * Formatea las ventas diarias para un conjunto de datos
     */
    private function formatDailySales($sales, $webProducts)
    {
        $formattedSales = [];
        $totals = array_fill_keys($webProducts->pluck('id')->toArray(), 0);
        $dates = [];

        // Agrupar ventas por fecha
        foreach ($sales as $sale) {
            $date = Carbon::parse($sale->date)->format('Y-m-d');
            if (!isset($dates[$date])) {
                $dates[$date] = [];
            }
            $dates[$date][] = $sale;
        }

        // Procesar cada fecha que tenga ventas
        foreach ($dates as $date => $dailySales) {
            $formattedSales[$date] = array_fill_keys($webProducts->pluck('id')->toArray(), 0);
            foreach ($dailySales as $sale) {
                $formattedSales[$date][$sale->webproduct_id] = $sale->total;
                $totals[$sale->webproduct_id] += $sale->total;
            }
        }

        return [
            'byDate' => $formattedSales,
            'totals' => $totals
        ];
    }
}
