<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<\App\Models\Media> */
class MediaFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => fake()->words(3, true),
            'path' => 'media/placeholder.jpg',
            'type' => 'image',
        ];
    }
}
