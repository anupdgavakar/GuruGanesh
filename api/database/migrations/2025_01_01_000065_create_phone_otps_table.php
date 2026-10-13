<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('phone_otps', function (Blueprint $table) {
            $table->id();
            $table->string('phone')->index();
            // Hashed, same as a password — a leaked `phone_otps` row (DB
            // backup, query log) shouldn't hand out a live 6-digit code.
            $table->string('code_hash');
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('expires_at');
            // Set the moment a code is used (or superseded by a newer
            // request for the same phone) — see PhoneOtp::issueFor(). A
            // code is only ever valid once.
            $table->timestamp('consumed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('phone_otps');
    }
};
