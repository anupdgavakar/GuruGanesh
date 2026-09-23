<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    use HasFactory;

    protected $table = 'media';

    // 'path' is fillable — safe, since StoreMediaRequest/UpdateMediaRequest
    // only ever validate a 'file' upload, never a 'path' string; the
    // controller is the only place that puts 'path' into the validated
    // array, after it has stored the file itself via ImageUploadService.
    protected $fillable = ['title', 'type', 'path'];

    protected $appends = ['url'];

    protected function url(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->path ? Storage::disk('public')->url($this->path) : null,
        );
    }
}
