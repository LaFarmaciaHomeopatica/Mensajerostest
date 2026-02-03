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

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [UnifiedController::class, 'index'])->name('dashboard');

    Route::get('/reports/lunch', [LunchController::class, 'report'])->name('reports.lunch');
    Route::resource('messengers', \App\Http\Controllers\MessengerController::class);
    Route::post('/update-location/{messenger}', [UnifiedController::class, 'updateLocation'])->name('messenger.update-location');
    Route::post('/dispatch', [DispatchController::class, 'store'])->name('dispatch.store');
});

