<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A tiny key-value store for site-wide settings that need to be editable
 * from the admin panel without a code deploy — starting with
 * "design_submission_email" (Setting::designSubmissionEmail()), the address
 * the storefront tells customers to email their design files to. Deliberately
 * generic (key/value, not a dedicated column per setting) so more settings
 * can be added later without another migration.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
