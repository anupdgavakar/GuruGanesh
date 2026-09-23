<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Slider extends Model
{
    use HasFactory;

    // image_path is fillable — safe, since SliderRequest only ever
    // validates an 'image' file upload, never an 'image_path' string.
    protected $fillable = ['title', 'subtitle', 'image_path', 'link_url', 'sort_order', 'status'];

    protected $appends = ['image_url'];

    protected $casts = ['status' => 'boolean'];

    protected function imageUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->image_path ? Storage::disk('public')->url($this->image_path) : null,
        );
    }
}
