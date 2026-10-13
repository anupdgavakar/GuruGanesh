<?php

namespace App\Console\Commands;

use App\Services\ImageOptimizer;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Shrinks the pictures already on the site, the same way new uploads are
 * shrunk (see App\Services\ImageOptimizer): big photos are scaled to at most
 * 2400 px on the long side and re-saved at high quality; a solid PNG photo
 * becomes a JPEG; small or already-light pictures are left alone.
 *
 *   php artisan catalog:optimize-images --dry-run
 *   php artisan catalog:optimize-images
 *
 * For each picture that gets smaller, the new file is written first, the
 * database is pointed at it, and only then is the old file deleted — so a
 * failure part-way never leaves a broken link. Nothing is touched in
 * --dry-run mode.
 */
class OptimizeStoredImages extends Command
{
    protected $signature = 'catalog:optimize-images
        {--dry-run : Show what would change without writing anything}
        {--min-kb=300 : Ignore pictures lighter than this many KB}';

    protected $description = 'Shrink large pictures already stored on the site (same quality rules as new uploads)';

    /** table => columns that hold a path on the public disk */
    private const TARGETS = [
        'products' => ['thumbnail_path', 'header_image_path', 'banner_image_path'],
        'product_images' => ['path'],
        'product_categories' => ['image_path'],
        'product_subcategories' => ['image_path'],
        'sliders' => ['image_path'],
        'blogs' => ['thumbnail_path'],
        'services' => ['image_path'],
        'brands' => ['logo_path'],
        'testimonials' => ['avatar_path'],
    ];

    public function handle(ImageOptimizer $optimizer): int
    {
        $disk = Storage::disk('public');
        $dry = (bool) $this->option('dry-run');
        $minBytes = max(0, (int) $this->option('min-kb')) * 1024;

        if (! extension_loaded('gd')) {
            $this->error('The PHP "gd" extension is not enabled, so pictures cannot be resized. Enable extension=gd in php.ini and run again.');

            return self::FAILURE;
        }

        $checked = $changed = $savedBytes = $failed = 0;
        $cache = []; // old path => new path, so a file used twice is only converted once

        foreach (self::TARGETS as $table => $columns) {
            $rows = DB::table($table)->select(array_merge(['id'], $columns))->get();

            foreach ($rows as $row) {
                foreach ($columns as $column) {
                    $path = $row->{$column};
                    if (! $path || ! $disk->exists($path)) {
                        continue;
                    }

                    $size = $disk->size($path);
                    if ($size < $minBytes) {
                        continue;
                    }
                    $checked++;

                    if (isset($cache[$path])) {
                        if (! $dry) {
                            DB::table($table)->where('id', $row->id)->update([$column => $cache[$path]]);
                        }
                        continue;
                    }

                    $result = $optimizer->optimize($disk->path($path));
                    if (! $result) {
                        continue;
                    }

                    $newSize = filesize($result['path']);
                    $this->line(sprintf('  %-22s #%-5d %-18s %6.0f KB -> %6.0f KB  (%s)', $table, $row->id, $column, $size / 1024, $newSize / 1024, basename($path)));

                    if ($dry) {
                        @unlink($result['path']);
                        $changed++;
                        $savedBytes += $size - $newSize;
                        continue;
                    }

                    try {
                        $directory = trim(dirname($path), '/.');
                        $newPath = ($directory !== '' ? $directory.'/' : '').sprintf('%d_%s.%s', now()->timestamp, Str::random(12), $result['extension']);

                        $disk->putFileAs($directory, new \Illuminate\Http\File($result['path']), basename($newPath));
                        DB::table($table)->where('id', $row->id)->update([$column => $newPath]);
                        $cache[$path] = $newPath;

                        // Any other row still pointing at the old file is moved over too.
                        foreach (self::TARGETS as $t => $cols) {
                            foreach ($cols as $c) {
                                DB::table($t)->where($c, $path)->update([$c => $newPath]);
                            }
                        }

                        $disk->delete($path);
                        $changed++;
                        $savedBytes += $size - $newSize;
                    } catch (\Throwable $e) {
                        $failed++;
                        $this->warn("  could not update {$path}: {$e->getMessage()}");
                    } finally {
                        @unlink($result['path']);
                    }
                }
            }
        }

        $this->newLine();
        $this->info(sprintf(
            '%s%d picture(s) looked at, %d %s, %.1f MB %s%s.',
            $dry ? 'DRY RUN — nothing was changed. ' : '',
            $checked,
            $changed,
            $dry ? 'would be shrunk' : 'shrunk',
            $savedBytes / 1048576,
            $dry ? 'would be saved' : 'saved',
            $failed ? ", {$failed} failed" : ''
        ));

        return $failed ? self::FAILURE : self::SUCCESS;
    }
}
