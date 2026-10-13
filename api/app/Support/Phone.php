<?php

namespace App\Support;

class Phone
{
    /**
     * Normalizes a customer-entered phone number to one consistent storage
     * form — strips spaces, dashes and parentheses, keeps a leading "+" if
     * the customer typed one. Used everywhere a phone is looked up or
     * stored (OTP request/verify/skip) so "98765 43210" and
     * "+91-98765-43210" don't end up creating two different accounts.
     */
    public static function normalize(?string $raw): string
    {
        if (! $raw) {
            return '';
        }

        $trimmed = trim($raw);
        $hasPlus = str_starts_with($trimmed, '+');
        $digits = preg_replace('/\D/', '', $trimmed) ?? '';

        return $hasPlus ? '+'.$digits : $digits;
    }
}
