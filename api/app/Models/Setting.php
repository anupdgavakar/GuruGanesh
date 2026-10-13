<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = ['key', 'value'];

    // The fallback used until an admin ever saves a value — keeps the
    // storefront and checkout working with a sane default on a fresh
    // install, without needing a seeded row.
    public const DESIGN_SUBMISSION_EMAIL_DEFAULT = 'guruganeshgraphics@gmail.com';

    public static function get(string $key, ?string $default = null): ?string
    {
        return static::query()->where('key', $key)->value('value') ?? $default;
    }

    public static function set(string $key, ?string $value): void
    {
        static::query()->updateOrCreate(['key' => $key], ['value' => $value]);
    }

    /** When true, the website shows no prices at all — every product is "Ask for price". */
    public static function hidePrices(): bool
    {
        return static::get('hide_prices', '0') === '1';
    }

    public static function designSubmissionEmail(): string
    {
        return static::get('design_submission_email', self::DESIGN_SUBMISSION_EMAIL_DEFAULT);
    }
}
