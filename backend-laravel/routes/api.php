<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StartupController;
use App\Http\Controllers\EventController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Startup routes
    Route::apiResource('startups', StartupController::class);
    Route::post('startups/{id}/founders', [StartupController::class, 'addFounder']);
    Route::post('startups/{id}/investments', [StartupController::class, 'addInvestment']);

    // Event routes
    Route::apiResource('events', EventController::class);
    Route::post('events/{id}/register', [EventController::class, 'register']);
    Route::post('events/{id}/unregister', [EventController::class, 'unregister']);
}); 