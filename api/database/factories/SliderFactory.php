<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<\App\Models\Slider> */
class SliderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'subtitle' => fake()->sentence(),
            'image_path' => 'sliders/placeholder.jpg',
            'sort_order' => fake()->numberBetween(0, 10),
            'status' => true,
        ];
    }
}
