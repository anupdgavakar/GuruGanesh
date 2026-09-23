<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_can_submit_an_order_and_price_is_computed_server_side(): void
    {
        $product = Product::factory()->create(['base_price' => 250.00, 'min_quantity' => 1]);

        // A malicious/buggy client submits a fake price — it must be ignored
        // entirely; only product_id + quantity are ever read.
        $this->postJson('/api/orders', [
            'customer_name' => 'Priya Sharma',
            'customer_email' => 'priya@example.com',
            'customer_phone' => '9876543210',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 3, 'unit_price' => 1, 'line_total' => 1],
            ],
        ])->assertCreated()
            ->assertJsonPath('data.subtotal', '750.00')
            ->assertJsonPath('data.items.0.unit_price', '250.00')
            ->assertJsonPath('data.items.0.line_total', '750.00');

        $this->assertDatabaseHas('orders', ['customer_email' => 'priya@example.com', 'subtotal' => 750.00, 'status' => 'pending_review']);
        $this->assertDatabaseHas('order_items', ['product_id' => $product->id, 'quantity' => 3, 'unit_price' => 250.00, 'line_total' => 750.00]);
    }

    public function test_order_totals_a_multi_item_cart_server_side(): void
    {
        $pens = Product::factory()->create(['base_price' => 10.00, 'min_quantity' => 1]);
        $cards = Product::factory()->create(['base_price' => 5.50, 'min_quantity' => 1]);

        $this->postJson('/api/orders', [
            'customer_name' => 'Rahul',
            'customer_email' => 'rahul@example.com',
            'customer_phone' => '9998887777',
            'items' => [
                ['product_id' => $pens->id, 'quantity' => 2],
                ['product_id' => $cards->id, 'quantity' => 4],
            ],
        ])->assertCreated()
            ->assertJsonPath('data.subtotal', '42.00') // (10*2) + (5.50*4)
            ->assertJsonCount(2, 'data.items');
    }

    public function test_quantity_below_product_minimum_is_rejected(): void
    {
        $product = Product::factory()->create(['base_price' => 100.00, 'min_quantity' => 5]);

        $this->postJson('/api/orders', [
            'customer_name' => 'Amit',
            'customer_email' => 'amit@example.com',
            'customer_phone' => '9123456780',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
        ])->assertUnprocessable();

        $this->assertDatabaseMissing('orders', ['customer_email' => 'amit@example.com']);
    }

    public function test_quantity_above_product_maximum_is_rejected(): void
    {
        $product = Product::factory()->create(['base_price' => 100.00, 'min_quantity' => 1, 'max_quantity' => 10]);

        $this->postJson('/api/orders', [
            'customer_name' => 'Sana',
            'customer_email' => 'sana@example.com',
            'customer_phone' => '9123456781',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 50],
            ],
        ])->assertUnprocessable();

        $this->assertDatabaseMissing('orders', ['customer_email' => 'sana@example.com']);
    }

    public function test_disabled_products_cannot_be_ordered(): void
    {
        $product = Product::factory()->create(['base_price' => 100.00, 'min_quantity' => 1, 'status' => false]);

        $this->postJson('/api/orders', [
            'customer_name' => 'Neha',
            'customer_email' => 'neha@example.com',
            'customer_phone' => '9123456782',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ])->assertUnprocessable();

        $this->assertDatabaseMissing('orders', ['customer_email' => 'neha@example.com']);
    }

    public function test_honeypot_field_silently_rejects_bots(): void
    {
        $product = Product::factory()->create(['base_price' => 100.00, 'min_quantity' => 1]);

        $this->postJson('/api/orders', [
            'customer_name' => 'Bot',
            'customer_email' => 'bot@example.com',
            'customer_phone' => '0000000000',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
            'website' => 'https://spam.example.com',
        ])->assertUnprocessable();

        $this->assertDatabaseMissing('orders', ['customer_email' => 'bot@example.com']);
    }

    public function test_orders_are_not_publicly_readable(): void
    {
        Order::factory()->create();

        $this->getJson('/api/orders')->assertUnauthorized();
    }

    public function test_only_admin_or_staff_can_read_and_manage_orders(): void
    {
        $order = Order::factory()->create();
        $customer = User::factory()->create(['role' => UserRole::Customer]);
        $staff = User::factory()->create(['role' => UserRole::Staff]);

        $this->actingAs($customer, 'sanctum')->getJson('/api/orders')->assertForbidden();

        $this->actingAs($staff, 'sanctum')
            ->getJson('/api/orders')
            ->assertOk()
            ->assertJsonCount(1, 'data.data');

        $this->actingAs($staff, 'sanctum')
            ->patchJson("/api/orders/{$order->id}", ['status' => 'confirmed'])
            ->assertOk()
            ->assertJsonPath('data.status', 'confirmed');

        $this->actingAs($staff, 'sanctum')
            ->deleteJson("/api/orders/{$order->id}")
            ->assertOk();

        $this->assertDatabaseMissing('orders', ['id' => $order->id]);
    }
}
