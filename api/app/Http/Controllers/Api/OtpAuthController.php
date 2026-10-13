<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RequestOtpRequest;
use App\Http\Requests\Auth\SkipOtpRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Models\PhoneOtp;
use App\Models\User;
use App\Services\SmsService;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

/**
 * Passwordless customer registration/login: request a code, verify it,
 * done — one account per phone number (see the unique constraint added in
 * add_phone_otp_fields_to_users_table). Admin/staff still use
 * AuthController's email+password login; this never touches that.
 */
class OtpAuthController extends Controller
{
    public function request(RequestOtpRequest $request, SmsService $sms)
    {
        $phone = $request->validated('phone');

        $throttleKey = 'otp-request|'.$phone;
        if (RateLimiter::tooManyAttempts($throttleKey, 3)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            throw ValidationException::withMessages([
                'phone' => "Please wait {$seconds} seconds before requesting another code.",
            ]);
        }
        RateLimiter::hit($throttleKey, 60);

        $this->assertPhoneIsCustomerEligible($phone);

        [$otp, $code] = PhoneOtp::issueFor($phone);

        $sms->send($phone, "Your Guru Ganesh Graphics verification code is {$code}. It expires in ".PhoneOtp::VALID_FOR_MINUTES.' minutes.');

        $testMode = (bool) config('services.otp.test_mode');

        return response()->json([
            'status' => 'success',
            'message' => $testMode
                ? "SMS delivery isn't connected yet — test mode is on, see the code below."
                : 'We sent a verification code to your phone.',
            'test_mode' => $testMode,
            // Only ever present in test mode — see config/services.php and
            // SmsService's doc comment for how this turns off for real.
            'debug_code' => $testMode ? $code : null,
        ]);
    }

    public function verify(VerifyOtpRequest $request)
    {
        $phone = $request->validated('phone');
        $code = $request->validated('code');

        $otp = PhoneOtp::activeFor($phone);

        if (! $otp || $otp->isExpired()) {
            throw ValidationException::withMessages([
                'code' => 'That code has expired — request a new one.',
            ]);
        }

        if ($otp->hasTooManyAttempts()) {
            throw ValidationException::withMessages([
                'code' => 'Too many incorrect attempts — request a new code.',
            ]);
        }

        if (! $otp->matches($code)) {
            $otp->increment('attempts');

            throw ValidationException::withMessages([
                'code' => 'Incorrect code.',
            ]);
        }

        $otp->update(['consumed_at' => now()]);

        $user = $this->findOrCreateUser($phone, $request->validated('name'), verified: true);

        return $this->tokenResponse($user);
    }

    /**
     * The test-mode-only "register without an OTP" bypass — see the class
     * doc comment on SkipOtpRequest. Hard-blocked with a 404 (not a 403,
     * so it doesn't even confirm the route exists) the moment OTP_TEST_MODE
     * is off, independent of anything the client sends.
     */
    public function skip(SkipOtpRequest $request)
    {
        abort_unless((bool) config('services.otp.test_mode'), 404);

        $phone = $request->validated('phone');
        $this->assertPhoneIsCustomerEligible($phone);

        $user = $this->findOrCreateUser($phone, $request->validated('name'), verified: false);

        return $this->tokenResponse($user);
    }

    /**
     * `phone` is one unique column shared by admin/staff/customer rows
     * (see the migration). Without this check, a customer typing in a
     * phone number that happens to belong to a staff/admin account would
     * silently log in AS that admin — findOrCreateUser's own lookup is
     * scoped to role=customer, but we still need to fail loudly here
     * rather than let create() hit the unique constraint with a confusing
     * 500, or worse, quietly match the wrong row.
     */
    private function assertPhoneIsCustomerEligible(string $phone): void
    {
        $belongsToNonCustomer = User::where('phone', $phone)
            ->where('role', '!=', UserRole::Customer->value)
            ->exists();

        if ($belongsToNonCustomer) {
            throw ValidationException::withMessages([
                'phone' => "This phone number can't be used here — contact us if you think that's a mistake.",
            ]);
        }
    }

    private function findOrCreateUser(string $phone, ?string $name, bool $verified): User
    {
        $user = User::where('phone', $phone)->where('role', UserRole::Customer->value)->first();

        if (! $user) {
            $user = User::create([
                'name' => $name ?: 'Customer',
                'phone' => $phone,
                'email' => User::syntheticEmailForPhone($phone),
                'phone_verified_at' => $verified ? now() : null,
            ]);
        } elseif ($verified && ! $user->phone_verified_at) {
            $user->update(['phone_verified_at' => now()]);
        }

        return $user;
    }

    private function tokenResponse(User $user)
    {
        $token = $user->createToken(
            name: 'customer-token',
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
