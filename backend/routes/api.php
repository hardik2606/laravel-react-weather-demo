<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\WeatherController;
use App\Http\Controllers\Api\AIController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Dashboard route
    Route::get('/dashboard', function (Request $request) {
        return response()->json([
            'message' => 'Welcome to your dashboard!',
            'user' => $request->user()->only(['id', 'name', 'email']),
            'timestamp' => now()->toDateTimeString(),
        ]);
    });

    Route::post('/weather', [WeatherController::class, 'weather']);
    Route::post('/api/ai-summary', [AIController::class, 'summary']);
    Route::post('/ai-summary', [AIController::class, 'summary']); // for both /api/ai-summary and /ai-summary
});