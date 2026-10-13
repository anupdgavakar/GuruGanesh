<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Lets the admin choose which categories appear as tabs in the storefront's
 * header menu bar, and in what order. The full "All categories" mega menu
 * still lists every category — this only controls the short quick-link row,
 * which used to scroll sideways once the catalogue grew past a handful of
 * categories.
 *
 * Existing categories: the first six (by id) are switched on so the bar is
 * not empty after this migration runs; the admin can change that afterwards.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_categories', function (Blueprint $table) {
            $table->boolean('show_in_menu')->default(false)->after('slug');
            $table->unsignedInteger('menu_order')->default(0)->after('show_in_menu');
        });

        $order = 1;

        foreach (DB::table('product_categories')->orderBy('id')->limit(6)->pluck('id') as $id) {
            DB::table('product_categories')->where('id', $id)->update([
                'show_in_menu' => true,
                'menu_order' => $order++,
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('product_categories', function (Blueprint $table) {
            $table->dropColumn(['show_in_menu', 'menu_order']);
        });
    }
};
