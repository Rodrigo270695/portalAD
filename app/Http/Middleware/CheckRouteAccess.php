<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Auth\Access\AuthorizationException;

class CheckRouteAccess
{
    protected $routePermissions = [
        'zonals.index' => 'admin',
        'circuits.index' => 'admin',
        'users.index' => 'admin',
        'products.index' => 'admin-qa',
        'shares.index' => 'admin-qa',
        'sales.index' => 'admin-qa',
        'campaigns.index' => 'admin-qa',
        'history.sales' => 'pdv-access',
        'payments.index' => 'pdv-access',
        'history-campaign.index' => 'all-access',
        'dashboard' => 'pdv-access',
    ];

    public function handle(Request $request, Closure $next)
    {
        $routeName = $request->route()->getName();

        // Si la ruta no está en el array de permisos, permitir acceso por defecto
        if (!isset($this->routePermissions[$routeName])) {
            return $next($request);
        }

        // Verificar si el usuario tiene la habilidad requerida
        if (!Gate::allows($this->routePermissions[$routeName])) {
            throw new AuthorizationException('No tienes permiso para acceder a esta sección.');
        }

        return $next($request);
    }
}
