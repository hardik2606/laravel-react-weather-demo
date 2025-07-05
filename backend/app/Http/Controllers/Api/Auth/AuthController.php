<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        Log::info($request->all());   
        try {
            $user = User::create([
                'name' => $request->validated('name'),
                'email' => $request->validated('email'),
                'password' => Hash::make($request->validated('password')),
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'User registered successfully',
                'user' => new UserResource($user),
                'access_token' => $token,
                'token_type' => 'Bearer',
            ], 201);
        } catch (\Exception $e) {
            Log::error('Registration failed', ['exception' => $e]);
            return response()->json([
                'message' => 'Registration failed. Please try again.',
            ], 500);
        }
    }

    public function login(LoginRequest $request): JsonResponse
    {
        Log::info($request->all());   
        $email = $request->input('email');
        $password = $request->input('password');
        Log::info('Login request received', ['email' => $email]);   

        $user = User::where('email', $email)->first();

        if (!$user) {
            Log::warning('Login failed: email not found', ['email' => $email]);
            return response()->json([
                'message' => 'Email not found. Please check your email address.',
                'error_type' => 'email_not_found'
            ], 401);
        }

        if (!Hash::check($password, $user->password)) {
            Log::warning('Login failed: incorrect password', ['email' => $email]);
            return response()->json([
                'message' => 'Incorrect password. Please try again.',
                'error_type' => 'password_incorrect'
            ], 401);
        }

        Auth::login($user);
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => new UserResource($user),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout successful'
        ]);
    }

    public function user(Request $request): UserResource
    {
        return new UserResource($request->user());
    }
}
