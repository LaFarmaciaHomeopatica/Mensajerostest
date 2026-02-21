<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\LunchController;

use App\Http\Controllers\UnifiedController;
use App\Http\Controllers\DispatchController;

use App\Http\Controllers\AuthController;

Route::get('/', [AuthController::class, 'loginView'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.attempt');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::get('/messenger', [LunchController::class, 'index'])->name('landing');
Route::post('/messenger/check-plate', [LunchController::class, 'checkPlate'])->name('messenger.check-plate');
Route::post('/lunch', [LunchController::class, 'store'])->name('lunch.store');
Route::post('/shift-completion', [\App\Http\Controllers\ShiftCompletionController::class, 'store'])->name('shift-completion.store');

Route::middleware(['auth', 'role:administrador'])->group(function () {
    // Rutas de Dashboard y Operación
    Route::get('/dashboard', [UnifiedController::class, 'index'])->name('dashboard');
    Route::get('/reports/lunch', [LunchController::class, 'report'])->name('reports.lunch');
    Route::get('/reports/lunch/data', [LunchController::class, 'data'])->name('reports.lunch.data');
    Route::get('/reports/lunch/export', [LunchController::class, 'export'])->name('reports.lunch.export');

    // Reporte de Salida
    Route::get('/reports/exit', [\App\Http\Controllers\ShiftCompletionController::class, 'index'])->name('reports.exit');
    Route::get('/reports/exit/data', [\App\Http\Controllers\ShiftCompletionController::class, 'getExitAnalysis'])->name('reports.exit.data');
    Route::get('/reports/exit/export', [\App\Http\Controllers\ShiftCompletionController::class, 'export'])->name('reports.exit.export');

    Route::get('/messenger-status', [UnifiedController::class, 'getMessengerStatus'])->name('messenger.status');
    Route::get('/messenger-status-beetrack', [UnifiedController::class, 'getBeetrackAsync'])->name('messenger.status.beetrack');

    // Depuración de BD
    Route::get('/admin/purge/preview', [\App\Http\Controllers\PurgeController::class, 'preview'])->name('admin.purge.preview');
    Route::post('/admin/purge/backup', [\App\Http\Controllers\PurgeController::class, 'backup'])->name('admin.purge.backup');
    Route::post('/admin/purge/verify', [\App\Http\Controllers\PurgeController::class, 'verifyPassword'])->name('admin.purge.verify');
    Route::post('/admin/purge/execute', [\App\Http\Controllers\PurgeController::class, 'execute'])->name('admin.purge.execute');
    Route::get('/shifts/template', [\App\Http\Controllers\ShiftController::class, 'exportTemplate'])->name('shifts.template');
    Route::get('/shifts/export', [\App\Http\Controllers\ShiftController::class, 'export'])->name('shifts.export');
    Route::post('/shifts/import', [\App\Http\Controllers\ShiftController::class, 'import'])->name('shifts.import');
    Route::resource('shifts', \App\Http\Controllers\ShiftController::class)->only(['index', 'store', 'destroy']);
    // Rutas de Admin
    Route::resource('messengers', \App\Http\Controllers\MessengerController::class);
    Route::post('/update-location/{messenger}', [UnifiedController::class, 'updateLocation'])->name('messenger.update-location');
    Route::post('/dispatch', [DispatchController::class, 'store'])->name('dispatch.store');
    Route::resource('users', \App\Http\Controllers\UserController::class)->except(['create', 'edit', 'show']);
});
