<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

class PhoneOtp extends Model
{
    use HasFactory;

    protected $fillable = ['phone', 'code_hash', 'attempts', 'expires_at', 'consumed_at'];

    protected function casts(): array
    {
        return [
            'attempts' => 'integer',
            'expires_at' => 'datetime',
            'consumed_at' => 'datetime',
        ];
    }

    public const MAX_ATTEMPTS = 5;
    public const VALID_FOR_MINUTES = 10;

    /**
     * Creates a fresh 6-digit code for this phone, invalidating any
     * previous still-usable one first so only the latest code a customer
     * requested is ever accepted. Returns [PhoneOtp $record, string
     * $plainCode] — the plain code exists only in memory here and in
     * whatever SmsService::send() does with it; it's never stored
     * unhashed.
     */
    public static function issueFor(string $phone): array
    {
        static::query()
            ->where('phone', $phone)
            ->whereNull('consumed_at')
            ->update(['consumed_at' => now()]);

        $code = (string) random_int(100000, 999999);

        $otp = static::create([
            'phone' => $phone,
            'code_hash' => Hash::make($code),
            'expires_at' => now()->addMinutes(self::VALID_FOR_MINUTES),
        ]);

        return [$otp, $code];
    }

    /** The latest still-usable (unconsumed, not yet expired) code for a phone, if any. */
    public static function activeFor(string $phone): ?self
    {
        return static::query()
            ->where('phone', $phone)
            ->whereNull('consumed_at')
            ->latest('id')
            ->first();
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function hasTooManyAttempts(): bool
    {
        return $this->attempts >= self::MAX_ATTEMPTS;
    }

    public function matches(string $code): bool
    {
        return Hash::check($code, $this->code_hash);
    }
}
