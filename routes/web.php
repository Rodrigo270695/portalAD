<?php

use App\Http\Controllers\CircuitController;
use App\Http\Controllers\TackController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ZonalController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('zonals', ZonalController::class);
    Route::resource('circuits', CircuitController::class);
    Route::resource('users', UserController::class);

    // Rutas de Tacks
    Route::get('/circuits/{circuit}/tacks', [TackController::class, 'index'])->name('tacks.index');
    Route::post('/tacks', [TackController::class, 'store'])->name('tacks.store');
    Route::put('/tacks/{tack}', [TackController::class, 'update'])->name('tacks.update');
    Route::delete('/tacks/{tack}', [TackController::class, 'destroy'])->name('tacks.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
