<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<\App\Models\Testimonial> */
class TestimonialFactory extends Factory
{
    public function definition(): array
    {
        return [
            'customer_name' => fake()->name(),
            'customer_company' => fake()->company(),
            'rating' => fake()->numberBetween(4, 5),
            'message' => fake()->paragraph(),
            'status' => true,
        ];
    }
}
