<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Four small lookup tables a product can reference: design mode (e.g.
 * "Upload your own design" vs "Use a template"), delivery option, product
 * type, and pricing tier. All share the same simple shape, so they're
 * migrated together.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_design_modes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('product_delivery_options', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->unsignedInteger('estimated_days')->nullable();
            $table->timestamps();
        });

        Schema::create('product_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('product_pricing_tiers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price_multiplier', 5, 2)->default(1.00);
            $table->timestamps();
        });

        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('design_mode_id')->nullable()->after('subcategory_id')
                ->constrained('product_design_modes')->nullOnDelete();
            $table->foreignId('delivery_option_id')->nullable()->after('design_mode_id')
                ->constrained('product_delivery_options')->nullOnDelete();
            $table->foreignId('product_type_id')->nullable()->after('delivery_option_id')
                ->constrained('product_types')->nullOnDelete();
            $table->foreignId('pricing_tier_id')->nullable()->after('product_type_id')
                ->constrained('product_pricing_tiers')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropConstrainedForeignId('design_mode_id');
            $table->dropConstrainedForeignId('delivery_option_id');
            $table->dropConstrainedForeignId('product_type_id');
            $table->dropConstrainedForeignId('pricing_tier_id');
        });

        Schema::dropIfExists('product_pricing_tiers');
        Schema::dropIfExists('product_types');
        Schema::dropIfExists('product_delivery_options');
        Schema::dropIfExists('product_design_modes');
    }
};
