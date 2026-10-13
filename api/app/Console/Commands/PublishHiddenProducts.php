<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;

/**
 * Switches on the products that were added by the photo import and are still
 * hidden: switched off, no price yet (₹0), but with pictures. The storefront
 * shows "Get a quote" for products that have no price, so they can go live
 * now and get their real prices later in the admin panel.
 *
 *   php artisan catalog:publish-hidden --dry-run
 *   php artisan catalog:publish-hidden
 *   php artisan catalog:publish-hidden --category=election-and-political-campaign-materials
 *
 * Products that are switched off but already have a price are left alone —
 * those were hidden on purpose.
 */
class PublishHiddenProducts extends Command
{
    protected $signature = 'catalog:publish-hidden
        {--dry-run : Show what would be switched on without changing anything}
        {--category= : Only this category (its slug), e.g. election-and-political-campaign-materials}';

    protected $description = 'Switch on hidden, price-less products that have photos (shown as "Get a quote")';

    public function handle(): int
    {
        $query = Product::query()
            ->with('category', 'subcategory')
            ->withCount('images')
            ->where('status', false)
            ->where(fn ($q) => $q->whereNull('base_price')->orWhere('base_price', '<=', 0));

        if ($slug = $this->option('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $slug));
        }

        $candidates = $query->get()->filter(
            fn (Product $p) => $p->thumbnail_path || $p->header_image_path || $p->images_count > 0
        );

        if ($candidates->isEmpty()) {
            $this->info('Nothing to switch on — no hidden, price-less products with photos were found.');

            return self::SUCCESS;
        }

        $byCategory = $candidates->groupBy(fn (Product $p) => $p->category?->name ?? '(no category)');

        foreach ($byCategory as $name => $products) {
            $this->line(sprintf('  %-45s %d product(s)', $name, $products->count()));
        }

        $this->newLine();

        if ($this->option('dry-run')) {
            $this->info("DRY RUN — {$candidates->count()} product(s) would be switched on. Nothing was changed.");

            return self::SUCCESS;
        }

        foreach ($candidates as $product) {
            $product->status = true;
            $product->save();
        }

        $this->info("Switched on {$candidates->count()} product(s). They show \"Get a quote\" until you set a price in Admin > Products.");

        return self::SUCCESS;
    }
}
