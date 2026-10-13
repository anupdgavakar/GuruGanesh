<?php

namespace App\Services;

use Illuminate\Http\File;
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
    public function __construct(private readonly ImageOptimizer $optimizer = new ImageOptimizer())
    {
    }

    public function store(UploadedFile $file, string $directory): string
    {
        $extension = $file->getClientOriginalExtension();
        $optimised = $this->optimizer->optimize($file->getRealPath());

        try {
            $filename = $this->filename($optimised['extension'] ?? $extension);

            if ($optimised) {
                Storage::disk('public')->putFileAs($directory, new File($optimised['path']), $filename);

                return trim($directory, '/').'/'.$filename;
            }

            return $file->storeAs($directory, $filename, 'public');
        } finally {
            if ($optimised) {
                @unlink($optimised['path']);
            }
        }
    }

    /**
     * Same as store(), but for a file that's already sitting on disk rather
     * than an HTTP upload — used by the catalog:import-images command,
     * which reads product photos straight from a local folder tree instead
     * of a web request. Same filename convention, same destination disk.
     */
    public function storeFromPath(string $absolutePath, string $directory): string
    {
        $extension = pathinfo($absolutePath, PATHINFO_EXTENSION) ?: 'jpg';
        $optimised = $this->optimizer->optimize($absolutePath);

        try {
            $filename = $this->filename($optimised['extension'] ?? $extension);

            Storage::disk('public')->putFileAs($directory, new File($optimised['path'] ?? $absolutePath), $filename);

            return trim($directory, '/').'/'.$filename;
        } finally {
            if ($optimised) {
                @unlink($optimised['path']);
            }
        }
    }

    private function filename(string $extension): string
    {
        return sprintf('%d_%s.%s', now()->timestamp, Str::random(12), strtolower($extension));
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
