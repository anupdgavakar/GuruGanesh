<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Service extends Model
{
    use HasFactory;

    // icon_path / image_path are fillable — safe, since ServiceRequest only
    // ever validates 'icon' and 'image' file uploads, never these strings.
    protected $fillable = [
        'name', 'slug', 'short_description', 'content', 'icon_path', 'image_path',
        'status', 'meta_title', 'meta_description',
    ];

    protected $appends = ['icon_url', 'image_url'];

    protected $casts = ['status' => 'boolean'];

    protected function iconUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->icon_path ? Storage::disk('public')->url($this->icon_path) : null,
        );
    }

    protected function imageUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->image_path ? Storage::disk('public')->url($this->image_path) : null,
        );
    }
}
