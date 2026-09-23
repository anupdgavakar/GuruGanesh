<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Exchange a Google ID token for an API token.
     *
     * The old app decoded the incoming JWT itself with base64_decode()/json_decode()
     * and never checked its signature — anyone could hand-craft a token claiming to
     * be any email address (including an existing admin's) and the server trusted
     * it outright. Socialite's userFromToken() verifies the token against Google
     * before we ever read a claim out of it.
     */
    public function callback(Request $request)
    {
        $request->validate([
            'credential' => ['required', 'string'],
        ]);

        try {
            $googleUser = Socialite::driver('google')
                ->stateless()
                ->userFromToken($request->input('credential'));
        } catch (\Throwable $e) {
            Log::warning('Google token verification failed.', ['message' => $e->getMessage()]);

            return response()->json(['error' => 'Invalid or expired Google token.'], 401);
        }

        if (! $googleUser->getEmail()) {
            return response()->json(['error' => 'Google account has no email.'], 422);
        }

        $user = User::updateOrCreate(
            ['google_id' => $googleUser->getId()],
            [
                'name' => $googleUser->getName() ?: $googleUser->getEmail(),
                'email' => $googleUser->getEmail(),
                'avatar' => $googleUser->getAvatar(),
            ]
        );

        $token = $user->createToken(
            name: 'google-login',
            expiresAt: now()->addMinutes(config('sanctum.expiration'))
        );

        return response()->json([
            'status' => 'success',
            'token' => $token->plainTextToken,
            'expires_at' => $token->accessToken->expires_at,
            'user' => $user,
        ]);
    }
}
