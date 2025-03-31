<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Auth;

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
    }
}
