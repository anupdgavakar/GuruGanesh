<?php

use Laravel\Sanctum\Sanctum;

return [

    /*
    |--------------------------------------------------------------------------
    | Stateful Domains
    |--------------------------------------------------------------------------
    |
    | Only relevant if a first-party SPA authenticates via cookies rather than
    | bearer tokens. The admin panel and public site both use bearer tokens,
    | so this is unused today but kept correct in case that changes.
    |
    */

    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s%s',
        'localhost,localhost:3000,localhost:5173,127.0.0.1,127.0.0.1:8000,::1',
        Sanctum::currentApplicationUrlWithPort()
    ))),

    /*
    |--------------------------------------------------------------------------
    | Sanctum Guards
    |--------------------------------------------------------------------------
    */

    'guard' => ['web'],

    /*
    |--------------------------------------------------------------------------
    | Expiration Minutes
    |--------------------------------------------------------------------------
    |
    | Tokens expire after 12 hours by default. Set null to never expire (not
    | recommended for tokens stored in a browser).
    |
    */

    // Cast explicitly: env() returns .env values as strings (e.g. "720"),
    // and Carbon's addMinutes()/addUnit() now strictly require int|float —
    // an uncast string here throws a TypeError the first time a token is
    // actually issued (createToken() in AuthController/SocialAuthController).
    'expiration' => (int) env('SANCTUM_TOKEN_EXPIRATION', 60 * 12),

    /*
    |--------------------------------------------------------------------------
    | Token Prefix
    |--------------------------------------------------------------------------
    */

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    /*
    |--------------------------------------------------------------------------
    | Sanctum Middleware
    |--------------------------------------------------------------------------
    */

    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies' => Illuminate\Cookie\Middleware\EncryptCookies::class,
        'validate_csrf_token' => Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
    ],

];
