<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_log_in_with_correct_credentials(): void
    {
        User::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('correct-password'),
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'correct-password',
        ])->assertOk()->assertJsonStructure(['token', 'expires_at', 'user']);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('correct-password'),
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'wrong-password',
        ])->assertUnprocessable();
    }

    public function test_login_is_rate_limited_after_repeated_failures(): void
    {
        User::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('correct-password'),
        ]);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/auth/login', [
                'email' => 'admin@example.com',
                'password' => 'wrong-password',
            ]);
        }

        // The 6th attempt is blocked by the throttle even with the right password.
        $this->postJson('/api/auth/login', [
            'email' => 'admin@example.com',
            'password' => 'correct-password',
        ])->assertUnprocessable();
    }

    public function test_google_callback_rejects_a_forged_credential(): void
    {
        // The old app trusted base64_decode(json_decode($jwt)) with no
        // signature check at all — a hand-crafted payload like this one
        // used to be enough to mint a token for admin@guruganeshgraphics.com.
        // Socialite::userFromToken() verifies against Google instead, so a
        // credential Google itself rejects must fail closed here too.
        Socialite::shouldReceive('driver->stateless->userFromToken')
            ->once()
            ->andThrow(new \Exception('invalid_token'));

        $forgedPayload = base64_encode(json_encode([
            'email' => 'admin@guruganeshgraphics.com',
            'name' => 'Attacker',
            'sub' => 'forged-google-id',
        ]));

        $this->postJson('/api/auth/google/callback', [
            'credential' => "header.$forgedPayload.signature",
        ])->assertUnauthorized();

        $this->assertDatabaseMissing('users', ['email' => 'admin@guruganeshgraphics.com']);
    }

    public function test_google_callback_creates_a_user_from_a_verified_token(): void
    {
        $googleUser = new \Laravel\Socialite\Two\User();
        $googleUser->id = 'real-google-id';
        $googleUser->name = 'Real User';
        $googleUser->email = 'realuser@example.com';
        $googleUser->avatar = 'https://example.com/avatar.jpg';

        Socialite::shouldReceive('driver->stateless->userFromToken')
            ->once()
            ->andReturn($googleUser);

        $this->postJson('/api/auth/google/callback', [
            'credential' => 'a-token-google-would-actually-accept',
        ])->assertOk()->assertJsonPath('user.email', 'realuser@example.com');

        $this->assertDatabaseHas('users', [
            'email' => 'realuser@example.com',
            'google_id' => 'real-google-id',
        ]);
    }
}
