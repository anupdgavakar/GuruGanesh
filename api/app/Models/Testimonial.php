<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Testimonial extends Model
{
    use HasFactory;

    // avatar_path is fillable — safe, since TestimonialRequest only ever
    // validates an 'avatar' file upload, never an 'avatar_path' string.
    protected $fillable = ['customer_name', 'customer_company', 'avatar_path', 'rating', 'message', 'status'];

    protected $appends = ['avatar_url'];

    protected $casts = ['status' => 'boolean', 'rating' => 'integer'];

    protected function avatarUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->avatar_path ? Storage::disk('public')->url($this->avatar_path) : null,
        );
    }
}
