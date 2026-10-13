<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductSubcategory;
use App\Services\ImageUploadService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Removes the parts of the catalogue that have no product photos at all —
 * the categories and subcategories the owner has decided to leave out for
 * now — so only the sections that really have images stay on the website.
 *
 * "Has images" = the product has a thumbnail, a header image, or at least
 * one gallery image.
 *
 *  - A SUBCATEGORY is removed when none of its products has images
 *    (unless the subcategory itself already has a cover image).
 *  - A CATEGORY is removed when none of its products has images
 *    (unless it still keeps a subcategory that is being kept).
 *  - The image-less PRODUCTS inside a removed subcategory/category are
 *    removed with it. Image-less products inside a subcategory that IS kept
 *    are left alone and only counted, so a half-photographed subcategory
 *    isn't hollowed out by accident.
 *
 * Order history is safe: order items keep their name/price and just lose the
 * link to the deleted product.
 *
 * Without --force this only PREVIEWS; nothing is deleted.
 */
class PruneEmptyCatalog extends Command
{
    protected $signature = 'catalog:prune-empty
        {--force : Actually delete (without this the command only shows a preview)}';

    protected $description = 'Remove categories, subcategories and products that have no product photos (preview first, then --force)';

    public function handle(ImageUploadService $uploads): int
    {
        $products = Product::withCount('images')->get();

        $hasImages = fn (Product $p) => $p->thumbnail_path || $p->header_image_path || $p->images_count > 0;

        $subcategories = ProductSubcategory::with('category')->get();
        $categories = ProductCategory::all();

        $keepSub = [];
        $dropSub = [];

        foreach ($subcategories as $sub) {
            $inSub = $products->where('subcategory_id', $sub->id);
            $anyImages = $inSub->contains($hasImages);

            if ($anyImages || $sub->image_path) {
                $keepSub[$sub->id] = $sub;
            } else {
                $dropSub[$sub->id] = $sub;
            }
        }

        $keepCat = [];
        $dropCat = [];

        foreach ($categories as $category) {
            $anyKeptSub = collect($keepSub)->contains(fn ($s) => $s->category_id === $category->id);
            $anyImageProduct = $products->where('category_id', $category->id)->contains($hasImages);

            if ($anyKeptSub || $anyImageProduct) {
                $keepCat[$category->id] = $category;
            } else {
                $dropCat[$category->id] = $category;
            }
        }

        // Image-less products that go away with a removed subcategory or category.
        $dropProducts = $products->filter(function (Product $p) use ($dropSub, $dropCat, $hasImages) {
            if ($hasImages($p)) {
                return false;
            }

            return isset($dropCat[$p->category_id]) || ($p->subcategory_id && isset($dropSub[$p->subcategory_id]));
        });

        $leftBehind = $products->filter(
            fn (Product $p) => ! $hasImages($p)
                && ! $dropProducts->contains('id', $p->id)
        );

        $lines = [];
        $lines[] = 'CATEGORIES to remove ('.count($dropCat).'):';
        foreach ($dropCat as $c) {
            $lines[] = "  - {$c->name}";
        }

        $lines[] = '';
        $lines[] = 'SUBCATEGORIES to remove ('.count($dropSub).'):';
        foreach ($dropSub as $s) {
            $n = $products->where('subcategory_id', $s->id)->count();
            $lines[] = "  - {$s->category?->name} / {$s->name}  ({$n} product(s))";
        }

        $lines[] = '';
        $lines[] = "PRODUCTS to remove with them: {$dropProducts->count()}";

        $lines[] = '';
        $lines[] = 'KEPT: '.count($keepCat).' categories, '.count($keepSub).' subcategories, '
            .($products->count() - $dropProducts->count()).' products.';

        if ($leftBehind->isNotEmpty()) {
            $lines[] = "NOTE: {$leftBehind->count()} product(s) without photos sit inside subcategories that are being kept — they are NOT touched.";
        }

        foreach ($lines as $line) {
            $this->line($line);
        }

        // The log file also lists every product that has no photos, grouped by
        // category / subcategory, so the whole picture can be reviewed first.
        $detail = $lines;
        $detail[] = '';
        $detail[] = 'ALL PRODUCTS WITHOUT PHOTOS ('.$products->reject($hasImages)->count().' of '.$products->count().'):';
        $subNames = $subcategories->keyBy('id');
        $catNames = $categories->keyBy('id');

        $products->reject($hasImages)
            ->sortBy(fn (Product $p) => ($catNames[$p->category_id]->name ?? '').'|'.($subNames[$p->subcategory_id]->name ?? '').'|'.$p->name)
            ->each(function (Product $p) use (&$detail, $catNames, $subNames, $dropProducts) {
                $fate = $dropProducts->contains('id', $p->id) ? 'REMOVE' : 'keep  ';
                $detail[] = sprintf(
                    '  [%s] %s / %s / %s',
                    $fate,
                    $catNames[$p->category_id]->name ?? '?',
                    $subNames[$p->subcategory_id]->name ?? '(no subcategory)',
                    $p->name
                );
            });

        $logPath = storage_path('logs/catalog-prune-preview.txt');
        file_put_contents($logPath, implode(PHP_EOL, $detail).PHP_EOL);
        $this->line("Full list saved to: {$logPath}");

        if (! $this->option('force')) {
            $this->newLine();
            $this->warn('Preview only — nothing was deleted. Re-run with --force to delete.');

            return self::SUCCESS;
        }

        if (! $this->confirm('Permanently delete the items above from the database?', false)) {
            $this->line('Cancelled — nothing deleted.');

            return self::SUCCESS;
        }

        DB::transaction(function () use ($dropProducts, $dropSub, $dropCat, $uploads) {
            foreach ($dropProducts as $product) {
                $product->delete();
            }

            foreach ($dropSub as $sub) {
                $uploads->delete($sub->image_path);
                $sub->delete();
            }

            foreach ($dropCat as $category) {
                $category->delete();
            }
        });

        $this->info(sprintf(
            'Deleted %d products, %d subcategories and %d categories.',
            $dropProducts->count(),
            count($dropSub),
            count($dropCat)
        ));

        return self::SUCCESS;
    }
}
