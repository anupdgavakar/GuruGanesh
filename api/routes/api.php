<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\ContactInquiryController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductCategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductDeliveryOptionController;
use App\Http\Controllers\Api\ProductDesignModeController;
use App\Http\Controllers\Api\ProductPricingTierController;
use App\Http\Controllers\Api\ProductSubcategoryController;
use App\Http\Controllers\Api\ProductTypeController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\SliderController;
use App\Http\Controllers\Api\SocialAuthController;
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
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
});

// --- Catalog: public reads, admin/staff-only writes ----------------------
// Every resource follows the same shape: index/show are public (the
// storefront needs them with no login), store/update/destroy require
// auth:sanctum (logged in) AND role:admin,staff (the admin panel is used by
// both roles — see Phase 5's "staff can fully manage the catalog and
// content" goal). The old API left every one of these write routes open to
// anyone on the internet, logged in or not.

$catalogResources = [
    'products' => [ProductController::class, 'product'],
    'categories' => [ProductCategoryController::class, 'category'],
    'product-subcategories' => [ProductSubcategoryController::class, 'subcategory'],
    'design-modes' => [ProductDesignModeController::class, 'designMode'],
    'delivery-options' => [ProductDeliveryOptionController::class, 'deliveryOption'],
    'product-types' => [ProductTypeController::class, 'productType'],
    'pricing-tiers' => [ProductPricingTierController::class, 'pricingTier'],
    'brands' => [BrandController::class, 'brand'],
    'media' => [MediaController::class, 'media'],
    'blogs' => [BlogController::class, 'blog'],
    'testimonials' => [TestimonialController::class, 'testimonial'],
    'services' => [ServiceController::class, 'service'],
    'sliders' => [SliderController::class, 'slider'],
];

foreach ($catalogResources as $uri => [$controller, $param]) {
    Route::get("/{$uri}", [$controller, 'index']);
    Route::get("/{$uri}/{{$param}}", [$controller, 'show']);
}

Route::middleware(['auth:sanctum', 'role:admin,staff'])->group(function () use ($catalogResources) {
    foreach ($catalogResources as $uri => [$controller, $param]) {
        Route::post("/{$uri}", [$controller, 'store']);
        Route::post("/{$uri}/{{$param}}", [$controller, 'update']); // multipart updates
        Route::put("/{$uri}/{{$param}}", [$controller, 'update']);
        Route::delete("/{$uri}/{{$param}}", [$controller, 'destroy']);
    }
});

// --- Contact inquiries ----------------------------------------------------
// Unlike the catalog resources, inquiries hold customer PII — there's no
// public index/show, only a rate-limited public submission endpoint. The
// inbox (list/view/update-status/delete) is admin/staff-only, same as the
// catalog above.

Route::post('/inquiries', [ContactInquiryController::class, 'store'])->middleware('throttle:10,1');

Route::middleware(['auth:sanctum', 'role:admin,staff'])->group(function () {
    Route::get('/inquiries', [ContactInquiryController::class, 'index']);
    Route::get('/inquiries/{inquiry}', [ContactInquiryController::class, 'show']);
    Route::patch('/inquiries/{inquiry}', [ContactInquiryController::class, 'updateStatus']);
    Route::delete('/inquiries/{inquiry}', [ContactInquiryController::class, 'destroy']);
});

// --- Orders (cart / checkout) ---------------------------------------------
// Same public-write / admin-managed shape as inquiries above. There is no
// payment gateway: checkout only ever creates an order request for staff to
// follow up on and collect payment offline — see OrderController::store.

Route::post('/orders', [OrderController::class, 'store'])->middleware('throttle:10,1');

Route::middleware(['auth:sanctum', 'role:admin,staff'])->group(function () {
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::patch('/orders/{order}', [OrderController::class, 'updateStatus']);
    Route::delete('/orders/{order}', [OrderController::class, 'destroy']);
});
