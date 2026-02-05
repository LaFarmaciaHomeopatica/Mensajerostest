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
Route::post('/preoperational', [\App\Http\Controllers\PreoperationalController::class, 'store'])->name('preoperational.store');
Route::get('/cleaning', [\App\Http\Controllers\CleaningReportController::class, 'create'])->name('cleaning.create');
Route::post('/cleaning', [\App\Http\Controllers\CleaningReportController::class, 'store'])->name('cleaning.store');

Route::middleware(['auth'])->group(function () {
    // Rutas exclusivas de Líder
    Route::middleware(['role:lider'])->group(function () {
        Route::get('/dashboard', [UnifiedController::class, 'index'])->name('dashboard');
        Route::get('/reports/lunch', [LunchController::class, 'report'])->name('reports.lunch');
        Route::get('/reports/lunch/export', [LunchController::class, 'export'])->name('reports.lunch.export');
        Route::resource('messengers', \App\Http\Controllers\MessengerController::class);
        Route::post('/update-location/{messenger}', [UnifiedController::class, 'updateLocation'])->name('messenger.update-location');
        Route::post('/dispatch', [DispatchController::class, 'store'])->name('dispatch.store');
        Route::get('/messenger-status', [UnifiedController::class, 'getMessengerStatus'])->name('messenger.status');
        Route::get('/shifts/template', [\App\Http\Controllers\ShiftController::class, 'exportTemplate'])->name('shifts.template');
        Route::get('/shifts/export', [\App\Http\Controllers\ShiftController::class, 'export'])->name('shifts.export');
        Route::post('/shifts/import', [\App\Http\Controllers\ShiftController::class, 'import'])->name('shifts.import');
        Route::resource('shifts', \App\Http\Controllers\ShiftController::class)->only(['index', 'store', 'destroy']);
        Route::resource('users', \App\Http\Controllers\UserController::class)->except(['create', 'edit', 'show']);
    });

    // Rutas compartidas (Líder y Regente)
    Route::middleware(['role:lider,regente'])->group(function () {
        Route::get('/reports/preoperational', [\App\Http\Controllers\PreoperationalController::class, 'index'])->name('reports.preoperational');
        Route::get('/reports/preoperational/export', [\App\Http\Controllers\PreoperationalController::class, 'export'])->name('reports.preoperational.export');
        Route::get('/reports/cleaning', [\App\Http\Controllers\CleaningReportController::class, 'index'])->name('reports.cleaning');
        Route::get('/reports/cleaning/export', [\App\Http\Controllers\CleaningReportController::class, 'export'])->name('reports.cleaning.export');
        Route::resource('preoperational-questions', \App\Http\Controllers\PreoperationalQuestionController::class);
    });
});
