<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contact_inquiries', function (Blueprint $table) {
            // A price request comes from a signed-in customer who signed in with a
            // phone number only, so there may be no email address.
            $table->string('email')->nullable()->change();

            $table->string('type')->default('contact')->after('status'); // contact | price_request
            $table->foreignId('user_id')->nullable()->after('type')->constrained()->nullOnDelete();
            $table->foreignId('product_id')->nullable()->after('user_id')->constrained()->nullOnDelete();
            $table->unsignedInteger('quantity')->nullable()->after('product_id');
        });
    }

    public function down(): void
    {
        Schema::table('contact_inquiries', function (Blueprint $table) {
            $table->dropConstrainedForeignId('product_id');
            $table->dropConstrainedForeignId('user_id');
            $table->dropColumn(['type', 'quantity']);
        });
    }
};
