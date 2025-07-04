<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WeatherController extends Controller
{
    public function weather(Request $request)
    {
        $request->validate(['city' => 'required|string']);
        $city = $request->input('city');
        // Mock data for demo
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

class AIController extends Controller
{
    public function summary(Request $request)
    {
        $data = $request->validate([
            'city' => 'required|string',
            'country' => 'required|string',
            'temp' => 'required|numeric',
            'humidity' => 'required|numeric',
            'condition' => 'required|string',
            'windSpeed' => 'required|numeric',
            'datetime' => 'required|string',
        ]);

        $prompt = <<<PROMPT
You are a helpful and friendly AI assistant that provides smart weather summaries.

Weather data:
- City: {$data['city']}
- Country: {$data['country']}
- Temperature: {$data['temp']}°C
- Humidity: {$data['humidity']}%
- Condition: {$data['condition']}
- Wind speed: {$data['windSpeed']} km/h
- Date: {$data['datetime']}

Generate:
1. A short weather summary with emoji
2. Clothing suggestion
3. Health tip
4. Outdoor advice
Keep it under 100 words, user-friendly and positive.
PROMPT;

        $openaiBase = config('services.openai.base', 'http://localhost:11434/v1');
        $model = 'mistral';

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post("$openaiBase/chat/completions", [
                'model' => $model,
                'messages' => [
                    ['role' => 'system', 'content' => 'You are a helpful and friendly AI assistant that provides smart weather summaries.'],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'max_tokens' => 200,
            ]);

            $result = $response->json();
            if (isset($result['error'])) {
                Log::error('Ollama API error', ['error' => $result['error']]);
                return response()->json(['summary' => 'AI error: ' . $result['error']['message']], 500);
            }
            $summary = $result['choices'][0]['message']['content'] ?? 'No summary available.';
            return response()->json(['summary' => $summary]);
        } catch (\Exception $e) {
            Log::error('Ollama service exception', ['exception' => $e]);
            return response()->json(['summary' => 'Weather AI service unavailable'], 500);
        }
    }
}