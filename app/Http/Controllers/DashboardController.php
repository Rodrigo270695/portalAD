<?php

namespace App\Http\Controllers;

use App\Models\Share;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

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

        if ($user->hasRole('pdv')) {
            // Si es PDV, obtener su cuota directamente
            $totalShare = Share::where('user_id', $user->id)
                ->where('year', $currentYear)
                ->where('month', $currentMonth)
                ->value('amount') ?? 0;
        } elseif ($user->hasRole('zonificado')) {
            // Si es zonificado, sumar las cuotas de todos sus PDVs y contar PDVs
            $pdvCount = User::where('zonificado_id', $user->id)->count();
            $totalShare = Share::whereHas('user', function($query) use ($user) {
                $query->where('zonificado_id', $user->id);
            })
            ->where('year', $currentYear)
            ->where('month', $currentMonth)
            ->sum('amount');
        }
        // Para QA y admin, el valor será 0 por defecto

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
                'isZonificado' => $user->hasRole('zonificado')
            ]
        ]);
    }
}
