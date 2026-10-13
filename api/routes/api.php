<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\ContactInquiryController;
use App\Http\Controllers\Api\DesignFileController;
use App\Http\Controllers\Api\HandlingController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OtpAuthController;
use App\Http\Controllers\Api\PriceRequestController;
use App\Http\Controllers\Api\ProductCategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductDeliveryOptionController;
use App\Http\Controllers\Api\ProductDesignModeController;
use App\Http\Controllers\Api\ProductPricingTierController;
use App\Http\Controllers\Api\ProductSubcategoryController;
use App\Http\Controllers\Api\ProductTypeController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\SliderController;
use App\Http\Controllers\Api\SocialAuthController;
use App\Http\Controllers\Api\TeamMemberController;
use App\Http\Controllers\Api\TestimonialController;
use Illuminate\Support\Facades\Route;

// --- Public: health check ---------------------------------------------

Route::get('/ping', fn () => response()->json(['message' => 'API is working']));

// --- Auth ---------------------------------------------------------------
// /auth/login has two rate limiters stacked: this route-level 'throttle:10,1'
// is a coarse per-IP backstop (catches someone cycling through many DIFFERENT
// email addresses from one IP); AuthController::login's own RateLimiter check
// is the finer per-email+IP limiter (5 attempts) that returns a friendly 422
// with a field error instead of a bare 429. The two thresholds are
// deliberately different — if they matched, the coarse one would fire first
// on the 6th request to the SAME email and the nicer 422 would never be seen.

Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('/auth/google/callback', [SocialAuthController::class, 'callback'])->middleware('throttle:5,1');

Route::middleware('auth:sanctum')->group(function () {
    // Role-agnostic — a customer's OTP-issued token authenticates here
    // exactly the same way an admin/staff token does (see OtpAuthController
    // and AuthController::login, which both just call $user->createToken()
    // against the same `users` table).
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
});

// --- Customer registration/login: phone number + OTP, no password -------
// Each has its own route-level throttle on top of OtpAuthController's own
// per-phone RateLimiter check (request only) — same two-tier pattern as
// /auth/login above.

Route::post('/auth/otp/request', [OtpAuthController::class, 'request'])->middleware('throttle:5,1');
Route::post('/auth/otp/verify', [OtpAuthController::class, 'verify'])->middleware('throttle:10,1');
Route::post('/auth/otp/skip', [OtpAuthController::class, 'skip'])->middleware('throttle:10,1');

// --- Catalog: public reads, admin/staff-only writes ----------------------
// Every resource follows the same shape: index/show are public (the
// storefront needs them with no login), store/update/destroy require
// auth:sanctum (logged in) AND a permission (the admin panel is used by
// both roles — see Phase 5's "staff can fully manage the catalog and
// content" goal). The old API left every one of these write routes open to
// anyone on the internet, logged in or not.

// Two groups, each with its own permission (see App\Models\Role): the
// product catalog and its lookup lists, and the website content.

$catalogResources = [
    'products' => [ProductController::class, 'product'],
    'categories' => [ProductCategoryController::class, 'category'],
    'product-subcategories' => [ProductSubcategoryController::class, 'subcategory'],
    'design-modes' => [ProductDesignModeController::class, 'designMode'],
    'delivery-options' => [ProductDeliveryOptionController::class, 'deliveryOption'],
    'product-types' => [ProductTypeController::class, 'productType'],
    'pricing-tiers' => [ProductPricingTierController::class, 'pricingTier'],
    'brands' => [BrandController::class, 'brand'],
];

$contentResources = [
    'media' => [MediaController::class, 'media'],
    'blogs' => [BlogController::class, 'blog'],
    'testimonials' => [TestimonialController::class, 'testimonial'],
    'services' => [ServiceController::class, 'service'],
    'sliders' => [SliderController::class, 'slider'],
];

foreach ([...$catalogResources, ...$contentResources] as $uri => [$controller, $param]) {
    Route::get("/{$uri}", [$controller, 'index']);
    Route::get("/{$uri}/{{$param}}", [$controller, 'show']);
}

foreach (['catalog' => $catalogResources, 'content' => $contentResources] as $permission => $resources) {
    Route::middleware(['auth:sanctum', "permission:{$permission}"])->group(function () use ($resources) {
        foreach ($resources as $uri => [$controller, $param]) {
            Route::post("/{$uri}", [$controller, 'store']);
            Route::post("/{$uri}/{{$param}}", [$controller, 'update']); // multipart updates
            Route::put("/{$uri}/{{$param}}", [$controller, 'update']);
            Route::delete("/{$uri}/{{$param}}", [$controller, 'destroy']);
        }
    });
}

// --- Contact inquiries ----------------------------------------------------
// Unlike the catalog resources, inquiries hold customer PII — there's no
// public index/show, only a rate-limited public submission endpoint. The
// inbox (list/view/update-status/delete) is admin/staff-only, same as the
// catalog above.

Route::post('/inquiries', [ContactInquiryController::class, 'store'])->middleware('throttle:10,1');

Route::middleware(['auth:sanctum', 'permission:inquiries'])->group(function () {
    Route::get('/inquiries', [ContactInquiryController::class, 'index']);
    Route::get('/inquiries/{inquiry}', [ContactInquiryController::class, 'show']);
    Route::patch('/inquiries/{inquiry}', [ContactInquiryController::class, 'updateStatus']);
    Route::post('/inquiries/{inquiry}/notes', [HandlingController::class, 'noteInquiry']);
});

Route::middleware(['auth:sanctum', 'permission:assign'])->group(function () {
    Route::patch('/inquiries/{inquiry}/assign', [HandlingController::class, 'assignInquiry']);
    Route::patch('/orders/{order}/assign', [HandlingController::class, 'assignOrder']);
});

Route::middleware(['auth:sanctum', 'permission:delete_records'])->group(function () {
    Route::delete('/inquiries/{inquiry}', [ContactInquiryController::class, 'destroy']);
    Route::delete('/orders/{order}', [OrderController::class, 'destroy']);
});

// --- Price requests --------------------------------------------------------
// Prices can be hidden on the website ("Ask for price"). A customer has to be
// signed in (phone + OTP) to ask, so every request is tied to an account.

Route::post('/price-requests', [PriceRequestController::class, 'store'])
    ->middleware(['auth:sanctum', 'role:customer', 'throttle:10,1']);

// --- Orders (cart / checkout) ---------------------------------------------
// Admin-managed shape as inquiries above (no payment gateway: checkout only
// ever creates an order request for staff to follow up on and collect
// payment offline — see OrderController::store). Placing an order now
// requires a logged-in customer (phone/OTP — see OtpAuthController), so
// every order can be tied back to an account; role:customer keeps an
// admin/staff bearer token from being usable here too.

Route::post('/orders', [OrderController::class, 'store'])
    ->middleware(['auth:sanctum', 'role:customer', 'throttle:10,1']);

Route::middleware(['auth:sanctum', 'permission:orders'])->group(function () {
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::patch('/orders/{order}', [OrderController::class, 'updateStatus']);
    Route::post('/orders/{order}/notes', [HandlingController::class, 'noteOrder']);
});

Route::get('/order-items/{item}/design-file', [DesignFileController::class, 'download'])
    ->middleware(['auth:sanctum', 'permission:design_files']);

// --- Team -----------------------------------------------------------------
// The people who work in the admin panel. /team is the short list used by the
// "handled by" dropdown; /users is the admin-only screen that creates them.

Route::get('/team', [HandlingController::class, 'team'])
    ->middleware(['auth:sanctum', 'permission:orders,inquiries']);

Route::middleware(['auth:sanctum', 'permission:users'])->group(function () {
    Route::get('/users', [TeamMemberController::class, 'index']);
    Route::post('/users', [TeamMemberController::class, 'store']);
    Route::get('/users/{user}', [TeamMemberController::class, 'show']);
    Route::patch('/users/{user}', [TeamMemberController::class, 'update']);
    Route::delete('/users/{user}', [TeamMemberController::class, 'destroy']);

    Route::get('/roles', [RoleController::class, 'index']);
    Route::post('/roles', [RoleController::class, 'store']);
    Route::get('/roles/{role}', [RoleController::class, 'show']);
    Route::patch('/roles/{role}', [RoleController::class, 'update']);
    Route::delete('/roles/{role}', [RoleController::class, 'destroy']);
});

// --- Site settings ----------------------------------------------------
// Public read (the storefront needs design_submission_email to build its
// "email us your design" instructions with no login); admin/staff write.

Route::get('/settings', [SettingController::class, 'index']);

Route::middleware(['auth:sanctum', 'permission:settings'])->group(function () {
    Route::patch('/settings', [SettingController::class, 'update']);
});

// --- Design file uploads -------------------------------------------------
// Public, rate-limited: a customer uploads their artwork at cart time,
// before any order exists yet — see DesignFileController::store.

Route::post('/design-files', [DesignFileController::class, 'store'])->middleware('throttle:20,1');
