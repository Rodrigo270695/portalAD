<?php

use App\Http\Controllers\CircuitController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\ShareController;
use App\Http\Controllers\TackController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WebproductController;
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

    // Rutas de Webproducts
    Route::get('/products/{product}/webproducts', [WebproductController::class, 'index'])->name('webproducts.index');
    Route::post('/webproducts', [WebproductController::class, 'store'])->name('webproducts.store');
    Route::put('/webproducts/{webproduct}', [WebproductController::class, 'update'])->name('webproducts.update');
    Route::delete('/webproducts/{webproduct}', [WebproductController::class, 'destroy'])->name('webproducts.destroy');

    // Rutas de Shares (Cuotas)
    Route::delete('shares/bulk-delete', [ShareController::class, 'bulkDestroy'])->name('shares.bulk-destroy');
    Route::get('shares/bulk', [ShareController::class, 'bulk'])->name('shares.bulk');
    Route::get('shares/bulk/template', [ShareController::class, 'downloadTemplate'])->name('shares.bulk.template');
    Route::post('shares/bulk/upload', [ShareController::class, 'upload'])->name('shares.bulk.upload');
    Route::resource('shares', ShareController::class);

    // Rutas de Sales (Ventas)
    Route::delete('sales/bulk-delete', [SaleController::class, 'bulkDestroy'])->name('sales.bulk-destroy');
    Route::get('sales/bulk', [SaleController::class, 'bulk'])->name('sales.bulk');
    Route::get('sales/bulk/template', [SaleController::class, 'downloadTemplate'])->name('sales.bulk.template');
    Route::post('sales/bulk/upload', [SaleController::class, 'upload'])->name('sales.bulk.upload');
    Route::get('sales/template', [SaleController::class, 'downloadTemplate'])->name('sales.template');
    Route::get('sales/bulk', [SaleController::class, 'bulk'])->name('sales.bulk');
    Route::post('sales/upload', [SaleController::class, 'upload'])->name('sales.upload');
    Route::resource('sales', SaleController::class);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
