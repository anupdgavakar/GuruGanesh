<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'customer_name' => fake()->name(),
            'customer_email' => fake()->unique()->safeEmail(),
            'customer_phone' => fake()->numerify('##########'),
            'shipping_address' => fake()->optional()->address(),
            'notes' => fake()->optional()->sentence(),
            'subtotal' => fake()->randomFloat(2, 100, 5000),
            'status' => 'pending_review',
        ];
    }
}
