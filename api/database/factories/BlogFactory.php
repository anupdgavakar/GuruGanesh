<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<\App\Models\Blog> */
class BlogFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->unique()->sentence();

        return [
            'title' => $title,
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(1, 999999),
            'excerpt' => fake()->sentence(),
            'content' => fake()->paragraphs(3, true),
            'status' => true,
            'published_at' => now(),
        ];
    }
}
