<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Customers now register/log in with just a phone number + OTP (see
 * PhoneOtp / OtpAuthController) — no password. `phone` becomes the unique
 * identity for that flow (nullable so admin/staff rows without one are
 * unaffected — SQLite/MySQL both allow any number of NULLs in a unique
 * index), and `phone_verified_at` records whether a real OTP was ever
 * confirmed for it (null when an account was created via the test-mode
 * "skip OTP" bypass — see OtpAuthController::skip).
 *
 * `email` deliberately stays required/unique as-is: phone-only customers
 * get a deterministic placeholder value (User::syntheticEmailForPhone)
 * rather than loosening a column admin/staff login already depends on.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('phone_verified_at')->nullable()->after('phone');
            $table->unique('phone');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['phone']);
            $table->dropColumn('phone_verified_at');
        });
    }
};
