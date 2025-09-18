<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CarController;
use App\Http\Controllers\API\ReservationController;
use App\Http\Controllers\API\PaymentController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\API\StatsController;

// ---------- Auth publique ----------
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::put('/profile', [AuthController::class, 'updateProfile']);

// ---------- CARS (lecture) PUBLIC ----------
Route::get('/cars', [CarController::class, 'index']);
Route::get('/cars/{car}', [CarController::class, 'show'])->whereNumber('car');

// ---------- Le reste protégé ----------
Route::middleware('auth:sanctum')->group(function () {

    // Profil
    Route::get('/me',     [AuthController::class, 'me']);
    Route::put('/profile',  [AuthController::class, 'updateProfile']);
    Route::post('/logout',[AuthController::class, 'logout']);

    // Cars (écriture uniquement)
    Route::apiResource('cars', CarController::class)->except(['index','show']);

    // Reservations
    Route::apiResource('reservations', ReservationController::class);

    // Mes réservations
    Route::get('/my-reservations', [ReservationController::class, 'index'])
        ->name('reservations.me');

    // Détails / actions réservation
    Route::get('/reservations/{reservation}', [ReservationController::class, 'show'])
        ->whereNumber('reservation');
    Route::post('/reservations/{id}/mark-paid', [ReservationController::class, 'markPaid'])
        ->whereNumber('id');

    // Paiements
    Route::post('/payments',    [PaymentController::class, 'store'])->name('payments.store');
    Route::post('/pay/confirm', [PaymentController::class, 'confirm'])->name('payments.confirm');
    Route::post('/payments/cash/confirm', [PaymentController::class, 'confirmCash'])
        ->name('payments.cash.confirm');

    // Factures
    Route::get('/invoices/{reservation}/pdf', [InvoiceController::class, 'downloadInvoice'])
        ->whereNumber('reservation');
    Route::get('/reservations/{reservation}/proforma', [InvoiceController::class, 'downloadProforma'])
        ->whereNumber('reservation');

    // --- Admin Users (via AuthController) ---
    Route::get('/users',            [AuthController::class, 'indexUsers']);
    Route::post('/users',           [AuthController::class, 'storeUser']);
    Route::get('/users/{user}',     [AuthController::class, 'showUser'])->whereNumber('user');
    Route::put('/users/{user}',     [AuthController::class, 'updateUser'])->whereNumber('user');
    Route::delete('/users/{user}',  [AuthController::class, 'destroyUser'])->whereNumber('user');

    // --- Stats pour le Dashboard Admin ---
    Route::get('/stats/global', [StatsController::class, 'globalStats']);
    Route::get('/stats/monthly', [StatsController::class, 'monthlyData']);
});
