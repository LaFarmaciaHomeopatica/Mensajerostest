<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\LunchController;

use App\Http\Controllers\UnifiedController;
use App\Http\Controllers\DispatchController;

Route::get('/', [LunchController::class, 'index'])->name('landing');
Route::post('/lunch', [LunchController::class, 'store'])->name('lunch.store');
Route::get('/dashboard', [UnifiedController::class, 'index'])->name('dashboard');
Route::post('/update-location/{messenger}', [UnifiedController::class, 'updateLocation'])->name('messenger.update-location');
Route::post('/dispatch', [DispatchController::class, 'store'])->name('dispatch.store');
