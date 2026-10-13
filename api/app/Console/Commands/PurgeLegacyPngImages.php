<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Services\ImageUploadService;
use Illuminate\Console\Command;

/**
 * Removes the old, very large .png pictures that came with the first
 * sample data (about 2 MB each) so only the new .jpg photos are left.
 *
 *   php artisan catalog:purge-png-images --dry-run
 *   php artisan catalog:purge-png-images
 *
 * Run catalog:import-images first (it replaces the old pictures wherever a
 * new photo exists). This command then deletes any .png that is still left
 * — the thumbnail, header, banner and every gallery picture — both the
 * file and the database entry. A product with nothing left shows the
 * "Coming Soon" picture until a new photo is added.
 *
 * Deleting is permanent, so it lists what it will do and asks first
 * (use --force to skip the question).
 */
class PurgeLegacyPngImages extends Command
{
    protected $signature = 'catalog:purge-png-images
        {--dry-run : Show what would be removed without deleting anything}
        {--force : Do not ask for confirmation}';

    protected $description = 'Delete leftover old .png product pictures (files and database entries)';

    private const FIELDS = [
        'thumbnail_path' => 'thumbnail',
        'header_image_path' => 'header',
        'banner_image_path' => 'banner',
    ];

    public function handle(ImageUploadService $uploads): int
    {
        $products = Product::with('images')->get()->filter(fn (Product $p) => $this->pngsOf($p) !== []);

        if ($products->isEmpty()) {
            $this->info('No .png product pictures are left. Nothing to do.');

            return self::SUCCESS;
        }

        $emptyAfter = 0;
        $total = 0;

        foreach ($products as $product) {
            $pngs = $this->pngsOf($product);
            $total += count($pngs);

            $left = $this->remainingAfterPurge($product);
            $note = $left === 0 ? '  -> will have NO picture (Coming Soon)' : '';
            $emptyAfter += $left === 0 ? 1 : 0;

            $this->line(sprintf('  #%d %-40s %d old png(s): %s%s', $product->id, $product->name, count($pngs), implode(', ', array_keys($pngs)), $note));
        }

        $this->newLine();
        $this->info("{$products->count()} product(s), {$total} old png picture(s). {$emptyAfter} product(s) would be left with no picture.");

        if ($this->option('dry-run')) {
            $this->line('DRY RUN — nothing was deleted.');

            return self::SUCCESS;
        }

        if (! $this->option('force') && ! $this->confirm('Permanently delete these pictures?')) {
            $this->line('Cancelled — nothing was deleted.');

            return self::SUCCESS;
        }

        foreach ($products as $product) {
            foreach (self::FIELDS as $column => $label) {
                if ($this->isPng($product->{$column})) {
                    $uploads->delete($product->{$column});
                    $product->{$column} = null;
                }
            }
            $product->save();

            foreach ($product->images as $image) {
                if ($this->isPng($image->path)) {
                    $uploads->delete($image->path);
                    $image->delete();
                }
            }
        }

        $this->info("Deleted {$total} old png picture(s).");

        return self::SUCCESS;
    }

    /** @return array<string, string> label => path */
    private function pngsOf(Product $product): array
    {
        $found = [];

        foreach (self::FIELDS as $column => $label) {
            if ($this->isPng($product->{$column})) {
                $found[$label] = $product->{$column};
            }
        }

        foreach ($product->images as $i => $image) {
            if ($this->isPng($image->path)) {
                $found['gallery'.($i + 1)] = $image->path;
            }
        }

        return $found;
    }

    /** How many non-png pictures the product keeps. */
    private function remainingAfterPurge(Product $product): int
    {
        $keep = 0;

        foreach (array_keys(self::FIELDS) as $column) {
            if ($product->{$column} && ! $this->isPng($product->{$column})) {
                $keep++;
            }
        }

        foreach ($product->images as $image) {
            if ($image->path && ! $this->isPng($image->path)) {
                $keep++;
            }
        }

        return $keep;
    }

    private function isPng(?string $path): bool
    {
        return $path !== null && $path !== '' && strtolower(pathinfo($path, PATHINFO_EXTENSION)) === 'png';
    }
}
