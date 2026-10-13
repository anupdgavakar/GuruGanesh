<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * How a customer is getting us the artwork for this line item — none of
 * these are required (a design can always follow up later by email/phone,
 * same as today), so all three columns are nullable:
 *  - design_delivery_method: 'link' | 'email' | 'upload' | null
 *  - design_reference: a pasted share link (method=link), or the private
 *    storage path from POST /design-files (method=upload); unused for
 *    'email' (the customer is sending it separately) and null otherwise
 *  - design_original_filename: the customer's real filename, for
 *    method=upload only — storage keeps a randomized name, this is what
 *    staff see in the admin panel
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->string('design_delivery_method')->nullable()->after('line_total');
            $table->text('design_reference')->nullable()->after('design_delivery_method');
            $table->string('design_original_filename')->nullable()->after('design_reference');
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['design_delivery_method', 'design_reference', 'design_original_filename']);
        });
    }
};
