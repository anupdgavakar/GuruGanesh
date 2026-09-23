<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Brand extends Model
{
    use HasFactory;

    // logo_path is fillable — safe, since BrandRequest only ever validates a
    // 'logo' file upload, never a 'logo_path' string; the controller is the
    // only place that puts logo_path into the validated array.
    protected $fillable = ['name', 'slug', 'logo_path', 'website_url', 'status'];

    protected $appends = ['logo_url'];

    protected $casts = ['status' => 'boolean'];

    protected function logoUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->logo_path ? Storage::disk('public')->url($this->logo_path) : null,
        );
    }
}
