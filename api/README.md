# GuruGanesh Graphics — API (v2)

Fresh Laravel rebuild of the printing business's backend — Phase 1 of the
redevelopment plan (auth + roles + the Products resource, built as the
template the rest of the catalog follows in Phase 2).

This was scaffolded from the official `laravel/laravel` skeleton, since the
environment that generated it couldn't reach Packagist directly — so
`vendor/` isn't included. Composer will fetch it from Packagist normally
once this runs somewhere with regular internet access, i.e. your machine.

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Fill in `.env`:

- `CORS_ALLOWED_ORIGINS` — your frontend's actual origins (comma-separated, no trailing slash, no path).
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI` — from the Google Cloud Console, for Google login.

Then:

```bash
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

The seeder creates one admin user: `admin@guruganeshgraphics.com` /
`change-me-immediately` — **change that password immediately** after first
login; it exists only so there's an admin account to log in with at all.

## Run the tests

```bash
php artisan test
```

`tests/Feature/ProductSecurityTest.php` and `tests/Feature/AuthTest.php`
specifically assert the things the old API got wrong: unauthenticated
requests can't write, non-admins can't write, and a forged Google credential
is rejected rather than trusted.

## What's here (Phase 1)

- Sanctum bearer-token auth: `POST /api/auth/login`, `POST /api/auth/google/callback`, `GET /api/auth/user`, `POST /api/auth/logout`.
- Role-based access via the `role:admin` middleware (`app/Http/Middleware/EnsureUserHasRole.php`) and `App\Policies\ProductPolicy` — replacing the old `AdminMiddleware`, which called `auth()->Auth::check()` and never actually worked.
- `Products` built end-to-end (migration, model, policy, Form Requests, controller) as the pattern for the rest of the catalog.
- `App\Services\ImageUploadService` — one place for image storage instead of the same upload block copy-pasted per field.

## Not here yet (Phase 2)

Categories beyond the one `ProductCategory` model, subcategories, pricing
tiers, delivery options, design modes, media library, blogs, testimonials,
services, brands, sliders, and the e-commerce-vs-quote decision from the
plan doc's open questions.
