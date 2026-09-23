<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone');
            $table->text('shipping_address')->nullable();
            $table->text('notes')->nullable();
            $table->decimal('subtotal', 10, 2);
            // No payment gateway — this is the admin-managed follow-up
            // lifecycle: a staff member confirms the order, moves it through
            // production, then marks it completed (or cancels it), the same
            // way the contact inbox tracks new -> read -> responded.
            $table->string('status')->default('pending_review');
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            // nullOnDelete (not cascade): if a product is later deleted from
            // the catalog, the order history must survive — that's the whole
            // reason product_name/unit_price are snapshotted onto the row
            // below rather than read live off the product at display time.
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_name');
            $table->string('product_slug');
            $table->decimal('unit_price', 10, 2);
            $table->unsignedInteger('quantity');
            $table->decimal('line_total', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
