<?php

namespace App\Http\Controllers\Api\AI;

use App\Http\Controllers\Controller;
use App\Enums\AIModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $data = $request->validate([
            'city' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            'temp' => 'required|numeric|between:-50,60',
            'humidity' => 'required|numeric|between:0,100',
            'condition' => 'required|string|max:255',
            'windSpeed' => 'required|numeric|min:0',
            'datetime' => 'required|string',
        ]);

        $prompt = $this->buildWeatherPrompt($data);

        try {
            $summary = $this->callAIService($prompt);
            return response()->json(['summary' => $summary]);
        } catch (\Exception $e) {
            Log::error('AI service error', [
                'exception' => $e->getMessage(),
                'data' => $data
            ]);
            return response()->json([
                'summary' => 'Weather AI service temporarily unavailable. Please try again later.'
            ], 500);
        }
    }

    private function buildWeatherPrompt(array $data): string
    {
        return <<<PROMPT
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
    }

    private function callAIService(string $prompt): string
    {
        $openaiBase = config('services.openai.base', 'http://localhost:11434/v1');
        $model = config('services.openai.model', \App\Enums\AIModel::TINY_LLAMA->value);

        $response = Http::timeout(30)->withHeaders([
            'Content-Type' => 'application/json',
        ])->post("$openaiBase/chat/completions", [
            'model' => $model,
            'messages' => [
                ['role' => 'system', 'content' => 'You are a helpful and friendly AI assistant that provides smart weather summaries.'],
                ['role' => 'user', 'content' => $prompt],
            ],
            'max_tokens' => 200,
            'temperature' => 0.7,
        ]);

        if (!$response->successful()) {
            throw new \Exception('AI service request failed: ' . $response->status());
        }

        $result = $response->json();

        if (isset($result['error'])) {
            throw new \Exception('AI service error: ' . ($result['error']['message'] ?? 'Unknown error'));
        }

        return $result['choices'][0]['message']['content'] ?? 'No summary available.';
    }
} 