<?php

namespace App\Http\Controllers\Api\Weather;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WeatherController extends Controller
{
    public function weather(Request $request): JsonResponse
    {
        $request->validate([
            'city' => 'required|string|max:255'
        ]);

        $city = $request->input('city');
        
        // Mock data for demo purposes
        $weatherData = [
            'city' => $city,
            'country' => 'DemoLand',
            'temp' => rand(15, 35),
            'humidity' => rand(40, 90),
            'condition' => 'clear sky',
            'windSpeed' => rand(5, 20),
            'datetime' => now()->toDateTimeString(),
        ];

        return response()->json($weatherData);
    }
} 