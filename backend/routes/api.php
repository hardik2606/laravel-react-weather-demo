<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Weather\WeatherController;
use App\Http\Controllers\Api\AI\AIController;
use Illuminate\Support\Facades\Route;

// Auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Weather routes
    Route::get('/weather', [WeatherController::class, 'weather']);
    
    // AI routes
    Route::post('/ai-summary', [AIController::class, 'summary']);
});