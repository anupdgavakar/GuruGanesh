<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Support\HtmlSanitizer;
use Illuminate\Support\Facades\Storage;

class Blog extends Model
{
    use HasFactory;

    // thumbnail_path is fillable — safe, since BlogRequest only ever
    // validates a 'thumbnail' file upload, never a 'thumbnail_path' string.
    protected $fillable = [
        'author_id', 'title', 'slug', 'excerpt', 'content', 'thumbnail_path',
        'status', 'meta_title', 'meta_description', 'published_at',
    ];

    protected $appends = ['thumbnail_url'];

    protected $casts = [
        'status' => 'boolean',
        'published_at' => 'datetime',
    ];

    // Public blog URLs use the slug (/api/blogs/{slug}) for SEO-friendly links.
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    // Posts saved as plain text (before the styled editor) are turned into
    // headings, paragraphs and lists when read, so the website and the admin
    // editor both show them properly. Posts already in HTML are untouched.
    protected function content(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value) => HtmlSanitizer::isPlainText($value) ? HtmlSanitizer::clean($value) : $value,
        );
    }

    protected function thumbnailUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->thumbnail_path ? Storage::disk('public')->url($this->thumbnail_path) : null,
        );
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
