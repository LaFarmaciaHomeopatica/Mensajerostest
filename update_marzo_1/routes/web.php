<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\LunchController;
use App\Http\Controllers\UnifiedController;
use App\Http\Controllers\DispatchController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PreoperationalController;
use App\Http\Controllers\ShiftCompletionController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\MessengerController;
use App\Http\Controllers\ExternalFormController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PurgeController;

// Públicas / Login
Route::get('/', [AuthController::class, 'loginView'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.attempt');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Landing para Mensajeros (Sin Auth o con Auth básico si se prefiere, pero actualmente parece libre)
Route::get('/messenger', [LunchController::class, 'index'])->name('landing');
Route::post('/messenger/check-plate', [LunchController::class, 'checkPlate'])->name('messenger.check-plate');
Route::post('/lunch', [LunchController::class, 'store'])->name('lunch.store');
Route::post('/shift-completion', [ShiftCompletionController::class, 'store'])->name('shift-completion.store');

// Preoperacional Frontend Routes (Para mensajeros)
Route::get('/preoperacional/questions', [PreoperationalController::class, 'getQuestions'])->name('preoperational.questions');
Route::post('/preoperacional/store', [PreoperationalController::class, 'store'])->name('preoperational.store');

// Rutas Protegidas por Login
Route::middleware(['auth'])->group(function () {

    // 1. Dashboard y Almuerzo: Admin, Dev, Lider
    Route::middleware(['role:administrador,desarrollador,lider'])->group(function () {
        Route::get('/dashboard', [UnifiedController::class, 'index'])->name('dashboard');
        Route::get('/reports/lunch', [LunchController::class, 'report'])->name('reports.lunch');
        Route::get('/reports/lunch/data', [LunchController::class, 'data'])->name('reports.lunch.data');
        Route::get('/reports/lunch/export', [LunchController::class, 'export'])->name('reports.lunch.export');
    });

    // 2. Preoperacional (Reportes y Stats): Admin, Dev, Regente
    Route::middleware(['role:administrador,desarrollador,regente'])->group(function () {
        Route::get('/reports/preoperational', [PreoperationalController::class, 'report'])->name('reports.preoperational');
        Route::get('/reports/preoperational/data', [PreoperationalController::class, 'data'])->name('reports.preoperational.data');
        Route::get('/reports/preoperational/export', [PreoperationalController::class, 'export'])->name('reports.preoperational.export');
        Route::get('/reports/preoperational/stats', [PreoperationalController::class, 'statsView'])->name('reports.preoperational.stats');
        Route::get('/reports/preoperational/stats/data', [PreoperationalController::class, 'statsData'])->name('reports.preoperational.stats.data');
    });

    // 3. Todo lo demás: Solo Admin y Dev
    Route::middleware(['role:administrador,desarrollador'])->group(function () {
        // Reporte de Salida
        Route::get('/reports/exit', [ShiftCompletionController::class, 'index'])->name('reports.exit');
        Route::get('/reports/exit/data', [ShiftCompletionController::class, 'getExitAnalysis'])->name('reports.exit.data');
        Route::get('/reports/exit/export', [ShiftCompletionController::class, 'export'])->name('reports.exit.export');

        // Configuración de Preguntas Preop
        Route::get('/reports/preoperational/questions', [PreoperationalController::class, 'questionsView'])->name('reports.preoperational.questions');
        Route::post('/reports/preoperational/questions', [PreoperationalController::class, 'storeQuestion'])->name('reports.preoperational.questions.store');
        Route::put('/reports/preoperational/questions/{id}', [PreoperationalController::class, 'updateQuestion'])->name('reports.preoperational.questions.update');
        Route::delete('/reports/preoperational/questions/{id}', [PreoperationalController::class, 'destroyQuestion'])->name('reports.preoperational.questions.destroy');

        // Gestión de Mensajeros
        Route::resource('messengers', MessengerController::class);

        // Horarios
        Route::get('/shifts/template', [ShiftController::class, 'exportTemplate'])->name('shifts.template');
        Route::get('/shifts/export', [ShiftController::class, 'export'])->name('shifts.export');
        Route::post('/shifts/import', [ShiftController::class, 'import'])->name('shifts.import');
        Route::resource('shifts', ShiftController::class)->only(['index', 'store', 'destroy']);

        // Formularios Externos
        Route::resource('external-forms', ExternalFormController::class)->only(['index', 'store', 'destroy']);

        // Utilidades Operativas
        Route::get('/messenger-status', [UnifiedController::class, 'getMessengerStatus'])->name('messenger.status');
        Route::get('/messenger-status-beetrack', [UnifiedController::class, 'getBeetrackAsync'])->name('messenger.status.beetrack');
        Route::post('/update-location/{messenger}', [UnifiedController::class, 'updateLocation'])->name('messenger.update-location');
        Route::post('/dispatch', [DispatchController::class, 'store'])->name('dispatch.store');

        // Grupo restringido para Desarrollador únicamente
        Route::middleware(['role:desarrollador'])->group(function () {
            Route::get('/admin/purge/preview', [PurgeController::class, 'preview'])->name('admin.purge.preview');
            Route::post('/admin/purge/backup', [PurgeController::class, 'backup'])->name('admin.purge.backup');
            Route::post('/admin/purge/verify', [PurgeController::class, 'verifyPassword'])->name('admin.purge.verify');
            Route::post('/admin/purge/execute', [PurgeController::class, 'execute'])->name('admin.purge.execute');

            Route::resource('users', UserController::class)->except(['create', 'edit', 'show']);
        });
    });
});
