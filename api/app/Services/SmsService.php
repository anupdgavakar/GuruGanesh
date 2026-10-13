<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

/**
 * One place that "sends an SMS" — nothing else in the app should reach for
 * an HTTP client to talk to a gateway directly. No provider is subscribed
 * to yet, so this just logs the message (and OtpAuthController separately
 * echoes the code back in the API response while OTP_TEST_MODE is on — see
 * config/services.php) so the whole registration flow can be tested today.
 *
 * To go live once a gateway (MSG91, Twilio, AWS SNS, ...) is subscribed to:
 * replace the body of send() with that provider's API call, add its
 * credentials to .env, and set OTP_TEST_MODE=false. Nothing else in the
 * app needs to change — every caller only ever depends on this class.
 */
class SmsService
{
    public function send(string $phone, string $message): void
    {
        Log::info("[SmsService] No SMS gateway configured yet — would send to {$phone}: {$message}");
    }
}
