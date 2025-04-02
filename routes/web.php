<?php

use App\Http\Controllers\CircuitController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\TackController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ZonalController;
use App\Http\Controllers\SellerController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    //Route::get('dashboard', function () {
    //    return Inertia::render('dashboard');
    //})->name('dashboard');

    Route::resource('zonals', ZonalController::class);
    Route::resource('circuits', CircuitController::class);
    Route::resource('users', UserController::class);
    Route::resource('products', ProductController::class);
    Route::resource('sellers', SellerController::class)->except(['index', 'show', 'create', 'edit']);

    // Rutas de Tacks
    Route::get('/circuits/{circuit}/tacks', [TackController::class, 'index'])->name('tacks.index');
    Route::post('/tacks', [TackController::class, 'store'])->name('tacks.store');
    Route::put('/tacks/{tack}', [TackController::class, 'update'])->name('tacks.update');
    Route::delete('/tacks/{tack}', [TackController::class, 'destroy'])->name('tacks.destroy');

    // Rutas de Sellers
    Route::get('/users/{user}/sellers', [SellerController::class, 'index'])->name('sellers.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
