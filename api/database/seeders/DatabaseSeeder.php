<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Brand;
use App\Models\ProductDeliveryOption;
use App\Models\ProductDesignMode;
use App\Models\ProductPricingTier;
use App\Models\ProductType;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@guruganeshgraphics.com',
            'password' => Hash::make('123456789'),
            'role' => UserRole::Admin,
        ]);

        ProductDesignMode::factory()->createMany([
            ['name' => 'Upload Your Own Design', 'slug' => 'upload-your-own'],
            ['name' => 'Use a Template', 'slug' => 'use-a-template'],
            ['name' => 'Request Custom Design', 'slug' => 'request-custom-design'],
        ]);

        ProductDeliveryOption::factory()->createMany([
            ['name' => 'Standard Delivery', 'slug' => 'standard-delivery', 'estimated_days' => 5],
            ['name' => 'Express Delivery', 'slug' => 'express-delivery', 'estimated_days' => 2],
        ]);

        ProductType::factory()->createMany([
            ['name' => 'Digital Print', 'slug' => 'digital-print'],
            ['name' => 'Offset Print', 'slug' => 'offset-print'],
        ]);

        ProductPricingTier::factory()->createMany([
            ['name' => 'Standard', 'slug' => 'standard', 'price_multiplier' => 1.00],
            ['name' => 'Premium', 'slug' => 'premium', 'price_multiplier' => 1.35],
        ]);

        // Categories, subcategories and products — the full storefront
        // catalog the mega menu, homepage tiles and /products index are
        // built around. Kept in its own seeder since it's the bulk of the
        // data; must run after the lookup tables above, since it assigns
        // products to their ids.
        //
        // Phase 1 of 2 (see database/seeders/CatalogPhaseOneSeeder.php for
        // which categories and why) — the owner's full 26-category catalog
        // is being rolled out in two batches. CatalogPhaseTwoSeeder (the
        // remaining categories: apparel, gifting, wedding/event, and
        // vertical-specific printing) is a follow-up, not yet written.
        $this->call(CatalogPhaseOneSeeder::class);

        Brand::factory()->count(3)->create();
        Testimonial::factory()->count(5)->create();
    }
}
