<?php

use App\Http\Controllers\CircuitController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\SaleHistoryController;
use App\Http\Controllers\ShareController;
use App\Http\Controllers\TackController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WebproductController;
use App\Http\Controllers\ZonalController;
use App\Http\Controllers\SellerController;
use App\Http\Controllers\ErrorController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\HistoryCampaignController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\ActivityAnalyticsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::get('/offline', function () {
    return Inertia::render('offline');
})->name('offline');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    //Route::get('dashboard', function () {
    //    return Inertia::render('dashboard');
    //})->name('dashboard');

    // Rutas de error
    Route::get('/error/access-denied', [ErrorController::class, 'accessDenied'])->name('error.access-denied');
    Route::get('/error/forbidden', [ErrorController::class, 'forbidden'])->name('error.forbidden');

    // Rutas administrativas (solo admin)
    Route::middleware('can:admin')->group(function () {
        Route::resource('zonals', ZonalController::class);
        Route::resource('circuits', CircuitController::class);
        Route::resource('users', UserController::class);

        Route::post('users/bulk/create', [UserController::class, 'bulkCreate'])->name('users.bulk.create');
        Route::delete('shares/bulk-delete', [ShareController::class, 'bulkDestroy'])->name('shares.bulk-destroy');
        Route::get('shares/bulk', [ShareController::class, 'bulk'])->name('shares.bulk');
        Route::get('shares/bulk/template', [ShareController::class, 'downloadTemplate'])->name('shares.bulk.template');
        Route::post('shares/bulk/upload', [ShareController::class, 'upload'])->name('shares.bulk.upload');
        Route::delete('sales/bulk-delete', [SaleController::class, 'bulkDestroy'])->name('sales.bulk-destroy');
        Route::get('sales/bulk', [SaleController::class, 'bulk'])->name('sales.bulk');
        Route::get('sales/bulk/template', [SaleController::class, 'downloadTemplate'])->name('sales.bulk.template');
        Route::post('sales/bulk/upload', [SaleController::class, 'upload'])->name('sales.bulk.upload');
        Route::post('sales/bulk/update', [SaleController::class, 'bulkUpdate'])->name('sales.bulk.update');
        Route::get('sales/template', [SaleController::class, 'downloadTemplate'])->name('sales.template');
        Route::get('sales/bulk', [SaleController::class, 'bulk'])->name('sales.bulk');
        Route::post('sales/upload', [SaleController::class, 'upload'])->name('sales.upload');
        Route::get('/products/{product}/webproducts', [WebproductController::class, 'index'])->name('webproducts.index');
        Route::get('/circuits/{circuit}/tacks', [TackController::class, 'index'])->name('tacks.index');
        // Rutas para actividad
        Route::get('/activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');
        Route::get('/activity-analytics', [ActivityAnalyticsController::class, 'index'])->name('activity-analytics.index');
        Route::get('/activity-logs/user/{userId}', [ActivityLogController::class, 'userActivity'])->name('activity-logs.user');
        Route::get('/activity-logs/export', [ActivityLogController::class, 'export'])->name('activity-logs.export');
    });

    // Rutas para admin y qa
    Route::middleware('can:admin-qa')->group(function () {
        Route::resource('products', ProductController::class);
        Route::resource('shares', ShareController::class);
        Route::get('sales/export', [SaleController::class, 'export'])->name('sales.export');
        Route::resource('sales', SaleController::class);
        Route::resource('campaigns', CampaignController::class);
        Route::resource('notifications', NotificationController::class);
        Route::delete('shares/bulk-delete', [ShareController::class, 'bulkDestroy'])->name('shares.bulk-destroy');
        Route::get('shares/bulk', [ShareController::class, 'bulk'])->name('shares.bulk');
        Route::get('shares/bulk/template', [ShareController::class, 'downloadTemplate'])->name('shares.bulk.template');
        Route::post('shares/bulk/upload', [ShareController::class, 'upload'])->name('shares.bulk.upload');
        Route::delete('sales/bulk-delete', [SaleController::class, 'bulkDestroy'])->name('sales.bulk-destroy');
        Route::get('sales/bulk', [SaleController::class, 'bulk'])->name('sales.bulk');
        Route::get('sales/bulk/template', [SaleController::class, 'downloadTemplate'])->name('sales.bulk.template');
        Route::post('sales/bulk/upload', [SaleController::class, 'upload'])->name('sales.bulk.upload');
        Route::post('sales/bulk/update', [SaleController::class, 'bulkUpdate'])->name('sales.bulk.update');
        Route::get('sales/template', [SaleController::class, 'downloadTemplate'])->name('sales.template');
        Route::get('sales/bulk', [SaleController::class, 'bulk'])->name('sales.bulk');
        Route::post('sales/upload', [SaleController::class, 'upload'])->name('sales.upload');
        Route::get('/products/{product}/webproducts', [WebproductController::class, 'index'])->name('webproducts.index');
        Route::get('/circuits/{circuit}/tacks', [TackController::class, 'index'])->name('tacks.index');
    });

    // Rutas accesibles para todos los roles autenticados
    Route::get('/history-sales', [SaleHistoryController::class, 'index'])->name('history.sales');
    Route::post('/tacks', [TackController::class, 'store'])->name('tacks.store');
    Route::put('/tacks/{tack}', [TackController::class, 'update'])->name('tacks.update');
    Route::delete('/tacks/{tack}', [TackController::class, 'destroy'])->name('tacks.destroy');
    Route::get('/users/{user}/sellers', [SellerController::class, 'index'])->name('sellers.index');
    Route::resource('sellers', SellerController::class)->except(['index', 'show', 'create', 'edit']);
    Route::post('/webproducts', [WebproductController::class, 'store'])->name('webproducts.store');
    Route::put('/webproducts/{webproduct}', [WebproductController::class, 'update'])->name('webproducts.update');
    Route::delete('/webproducts/{webproduct}', [WebproductController::class, 'destroy'])->name('webproducts.destroy');
    Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
    Route::get('history-campaign', [HistoryCampaignController::class, 'index'])->name('history-campaign.index');


});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
