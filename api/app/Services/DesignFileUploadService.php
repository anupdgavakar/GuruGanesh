<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Stores a customer's uploaded design file (artwork for a print job) on the
 * private 'design_files' disk — see config/filesystems.php for why that's a
 * separate disk from ImageUploadService's 'public' one, and how it's meant
 * to move to S3 later without a code change.
 */
class DesignFileUploadService
{
    private const DISK = 'design_files';

    public function store(UploadedFile $file, string $directory = 'design-files'): string
    {
        $filename = sprintf(
            '%d_%s.%s',
            now()->timestamp,
            Str::random(20),
            $file->getClientOriginalExtension()
        );

        return $file->storeAs($directory, $filename, self::DISK);
    }

    public function delete(?string $path): void
    {
        if ($path && Storage::disk(self::DISK)->exists($path)) {
            Storage::disk(self::DISK)->delete($path);
        }
    }

    public function exists(string $path): bool
    {
        return Storage::disk(self::DISK)->exists($path);
    }

    /**
     * Streams the file back with the customer's original filename, rather
     * than the randomized one it's stored under — that's the name staff
     * see when they hit "download design file" in the admin panel.
     */
    public function download(string $path, string $downloadName)
    {
        return Storage::disk(self::DISK)->download($path, $downloadName);
    }
}
