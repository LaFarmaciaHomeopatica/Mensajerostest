<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\LunchController;

use App\Http\Controllers\UnifiedController;
use App\Http\Controllers\DispatchController;

use App\Http\Controllers\AuthController;

Route::get('/', [AuthController::class, 'loginView'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.attempt');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::get('/fix-auth', function () {
    $u = App\Models\User::updateOrCreate(
        ['email' => 'despachoslfh@lafarmacia.com'],
        ['name' => 'Despachos LFH', 'password' => 'asd123']
    );
    return "User: {$u->email} | CREATED/UPDATED with password 'asd123'. Hash starts with: " . substr($u->password, 0, 10);
});

Route::get('/messenger', [LunchController::class, 'index'])->name('landing');
Route::post('/lunch', [LunchController::class, 'store'])->name('lunch.store');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [UnifiedController::class, 'index'])->name('dashboard');
    Route::post('/update-location/{messenger}', [UnifiedController::class, 'updateLocation'])->name('messenger.update-location');
    Route::post('/dispatch', [DispatchController::class, 'store'])->name('dispatch.store');
});

