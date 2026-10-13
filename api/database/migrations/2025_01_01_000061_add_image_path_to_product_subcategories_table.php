<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds an optional representative image per subcategory, shown as a small
 * thumbnail in each top-level category's hover dropdown on the storefront
 * header (see web/src/components/layout/category-nav.tsx) — e.g. a photo of
 * a business card next to "Standard Business Cards". Left blank, that
 * dropdown item just shows its name with no thumbnail.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_subcategories', function (Blueprint $table) {
            $table->string('image_path')->nullable()->after('slug');
        });
    }

    public function down(): void
    {
        Schema::table('product_subcategories', function (Blueprint $table) {
            $table->dropColumn('image_path');
        });
    }
};
