<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        //
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        // Configurar el campo DNI como identificador de usuario para autenticación
        Auth::extend('dni-guard', function ($app, $name, array $config) {
            return new \Illuminate\Auth\SessionGuard(
                $name,
                Auth::createUserProvider($config['provider']),
                $app['session.store']
            );
        });

        // Define la habilidad 'admin' para usuarios con rol de administrador
        Gate::define('admin', function ($user) {
            return $user->hasRole('admin');
        });

        // Define la habilidad 'admin-qa' para usuarios con rol de admin o qa
        Gate::define('admin-qa', function ($user) {
            return $user->hasRole(['admin', 'qa']);
        });

        // Define la habilidad 'pdv-access' para usuarios con rol de pdv o zonificado
        Gate::define('pdv-access', function ($user) {
            return $user->hasRole(['pdv', 'zonificado']);
        });

        // Define la habilidad 'all-access' para permitir acceso a todos los roles autenticados
        Gate::define('all-access', function ($user) {
            return true; // Permite acceso a cualquier usuario autenticado
        });
    }
}
