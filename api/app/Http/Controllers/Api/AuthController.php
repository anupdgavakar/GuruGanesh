<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Issue a Sanctum token for staff/admin login.
     *
     * Rate limited per email+IP to stop the brute-force / credential-stuffing
     * exposure the old LoginController had no protection against.
     */
    public function login(LoginRequest $request)
    {
        $throttleKey = strtolower($request->input('email')).'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            throw ValidationException::withMessages([
                'email' => "Too many login attempts. Try again in {$seconds} seconds.",
            ]);
        }

        $user = \App\Models\User::where('email', $request->input('email'))->first();

        if (! $user || ! $user->password || ! \Illuminate\Support\Facades\Hash::check($request->input('password'), $user->password)) {
            RateLimiter::hit($throttleKey, 60);

            throw ValidationException::withMessages([
                'email' => 'Invalid credentials.',
            ]);
        }

        // A team member an admin has switched off can't sign in (checked after
        // the password so the message doesn't reveal which emails exist).
        if ($user->is_active === false) {
            throw ValidationException::withMessages([
                'email' => 'This account has been switched off. Please ask an admin.',
            ]);
        }

        RateLimiter::clear($throttleKey);

        $token = $user->createToken(
            name: 'api-token',
            expiresAt: now()->addMinutes(config('sanctum.expiration'))
        );

        return response()->json([
            'status' => 'success',
            'token' => $token->plainTextToken,
            'expires_at' => $token->accessToken->expires_at,
            'user' => $user,
        ]);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['status' => 'success', 'message' => 'Logged out.']);
    }
}
