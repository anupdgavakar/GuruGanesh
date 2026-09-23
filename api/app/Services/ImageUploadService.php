<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * One place for "store an uploaded image, return its path". The old
 * ProductController repeated this exact block three times (thumbnail,
 * header image, gallery images) with public_path()/move()/mkdir() calls
 * straight in the controller. Also switches storage to the `public` disk
 * (Storage::disk) instead of writing into public/uploads/... directly,
 * so files are managed the same way Laravel expects (storage:link) rather
 * than bypassing the framework's file abstraction.
 */
class ImageUploadService
{
    public function store(UploadedFile $file, string $directory): string
    {
        $filename = sprintf(
            '%d_%s.%s',
            now()->timestamp,
            Str::random(12),
            $file->getClientOriginalExtension()
        );

        return $file->storeAs($directory, $filename, 'public');
    }

    public function delete(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    public function url(?string $path): ?string
    {
        return $path ? Storage::disk('public')->url($path) : null;
    }
}
