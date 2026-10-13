<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds the homepage-banner fields a "homepage featured" product can carry:
 * the big promotional card on the homepage (see web/src/components/sections
 * /featured-products.tsx) shows these instead of the product's own name/
 * price when they're filled in, so admin can write custom marketing copy
 * per featured product — e.g. "Make Every Connection Count" rather than the
 * plain product name.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('banner_headline')->nullable()->after('is_featured');
            $table->string('banner_subtext', 500)->nullable()->after('banner_headline');
            $table->string('banner_image_path')->nullable()->after('banner_subtext');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['banner_headline', 'banner_subtext', 'banner_image_path']);
        });
    }
};
