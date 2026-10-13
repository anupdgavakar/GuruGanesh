<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductImage;
use App\Models\ProductSubcategory;
use App\Services\ImageUploadService;
use Illuminate\Console\Command;

/**
 * Bulk-imports product photos from a Category/Subcategory/Product folder
 * tree on disk, so ~700 products don't have to be uploaded one at a time
 * through the admin panel.
 *
 *   <root>/<Category>/<Subcategory>/<Product>/<photos>
 *
 * Folder names are matched to the database by a "normalised" name — lower
 * case, "&" read as "and", everything that isn't a letter or digit turned
 * into "-", and any leading "12. " number dropped. So "1. Visiting Cards",
 * "Visiting Cards" and "visiting-cards" are all the same category, and
 * "Men's T-Shirts" matches the folder "men-s-t-shirts".
 *
 * Photos inside a product folder can be labelled by role, by file name:
 *   t   -> thumbnail      h   -> header/main image
 *   g1, g2, ... -> gallery (in order)      b -> homepage banner
 * With --auto-roles, a folder whose photos are NOT labelled that way gets
 * roles guessed from the file names instead (a file with "banner" in its
 * name becomes the banner; the rest become thumbnail, header and gallery).
 *
 * A subcategory can also have one square "cover" photo, saved directly in
 * its folder as cover.png / cover.jpg (shown in the storefront menu).
 *
 * Safe to re-run. Explicitly labelled photos (t/h/g/b) always replace what
 * is stored. Auto-assigned photos only fill products that have NO thumbnail
 * yet, unless --overwrite is given — so hand-picked images are never
 * replaced by a guess.
 *
 * Folders with no matching product are reported, and skipped, unless
 * --create-missing is given: then the missing category / subcategory /
 * product is created (a product is created HIDDEN, price 0, so a
 * half-finished product never appears on the site — set its price in the
 * admin panel and switch it on).
 */
class ImportCatalogImages extends Command
{
    protected $signature = 'catalog:import-images
        {path : Root folder containing Category/Subcategory/Product image subfolders}
        {--dry-run : Show what would be matched and updated, without writing anything}
        {--auto-roles : Guess thumbnail/header/gallery/banner from file names when photos are not labelled t/h/g1/b}
        {--overwrite : In --auto-roles mode, also replace images of products that already have a thumbnail}
        {--create-missing : Create categories/subcategories/products (products hidden, price 0) for folders with no match}
        {--only= : Only this category folder, e.g. --only=visiting-cards (every other category is left untouched)}';

    protected $description = 'Bulk-import product photos from a Category/Subcategory/Product folder tree';

    private const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

    private const ROLE_PATTERNS = [
        'thumbnail' => '/^t(humbnail)?$/i',
        'header' => '/^h(eader)?$/i',
        'banner' => '/^b(anner)?$/i',
    ];

    private const GALLERY_PATTERN = '/^g(?:allery)?-?(\d+)$/i';

    private const COVER_PATTERN = '/^cover$/i';

    /** @var array<string, ProductCategory> */
    private array $categories = [];

    /** @var array<int, array<string, ProductSubcategory>> */
    private array $subcategories = [];

    /** @var array<int, array<string, Product>> */
    private array $products = [];

    /** @var array<string, string> normalised path => proper name */
    private array $taxonomy = [];

    /** @var array<string, array<string, true>> */
    private array $created = ['category' => [], 'subcategory' => [], 'product' => []];

    public function handle(ImageUploadService $uploads): int
    {
        $root = rtrim((string) $this->argument('path'), '/\\');
        $dryRun = (bool) $this->option('dry-run');
        $auto = (bool) $this->option('auto-roles');
        $overwrite = (bool) $this->option('overwrite');
        $create = (bool) $this->option('create-missing');
        $only = $this->option('only') ? $this->norm((string) $this->option('only')) : null;

        if (! is_dir($root)) {
            $this->error("Not a directory: {$root}");

            return self::FAILURE;
        }

        $this->loadLookups();

        $matched = 0;
        $coversMatched = 0;
        $leftAlone = 0;
        $skipped = [];

        foreach ($this->subdirectories($root) as $categoryDir) {
            if ($only !== null && $this->norm($categoryDir) !== $only) {
                continue;
            }

            $categoryPath = $root.DIRECTORY_SEPARATOR.$categoryDir;
            $catKey = $this->norm($categoryDir);
            $category = null;
            $catVirtual = false;
            $catResolved = false;

            foreach ($this->subdirectories($categoryPath) as $subDir) {
                $subPath = $categoryPath.DIRECTORY_SEPARATOR.$subDir;
                $subLabel = "{$categoryDir} / {$subDir}";

                // Only touch the database for folders that actually hold photos, so
                // --create-missing never adds empty categories or subcategories
                // for the parts of the folder tree that have no pictures yet.
                if (! $this->hasPhotos($subPath)) {
                    continue;
                }

                if (! $catResolved) {
                    [$category, $catVirtual] = $this->resolveCategory($categoryDir, $create, $dryRun);
                    $catResolved = true;
                }

                [$subcategory, $subVirtual] = $this->resolveSubcategory($category, $catVirtual, $catKey, $subDir, $create, $dryRun);

                // A subcategory's own cover photo sits directly in this folder.
                $coverFile = $this->findCover($subPath);

                if ($coverFile) {
                    if (! $subcategory && ! $subVirtual) {
                        $skipped[] = "{$subLabel} (cover) \u{2014} no matching subcategory in the database";
                    } elseif ($subVirtual || $dryRun) {
                        $this->line("[dry-run] {$subLabel} (cover) -> subcategory ".($subcategory ? "#{$subcategory->id} ({$subcategory->slug})" : '(would be created)').": cover={$coverFile}");
                        $coversMatched++;
                    } else {
                        $uploads->delete($subcategory->image_path);
                        $subcategory->image_path = $uploads->storeFromPath($subPath.DIRECTORY_SEPARATOR.$coverFile, 'subcategories');
                        $subcategory->save();
                        $coversMatched++;
                        $this->line("Updated {$subLabel} (cover) -> subcategory #{$subcategory->id} ({$subcategory->slug})");
                    }
                }

                foreach ($this->subdirectories($subPath) as $productDir) {
                    $productPath = $subPath.DIRECTORY_SEPARATOR.$productDir;
                    $label = "{$categoryDir} / {$subDir} / {$productDir}";

                    $files = $this->imageFiles($productPath);

                    if ($files === []) {
                        continue; // an empty folder is just a product that has no photos yet
                    }

                    if (! $subcategory && ! $subVirtual) {
                        $skipped[] = "{$label} \u{2014} no matching category/subcategory in the database";

                        continue;
                    }

                    [$product, $prodVirtual] = $this->resolveProduct($subcategory, $subVirtual, $catKey, $this->norm($subDir), $productDir, $create, $dryRun);

                    if (! $product && ! $prodVirtual) {
                        $skipped[] = "{$label} \u{2014} no matching product in that subcategory";

                        continue;
                    }

                    [$roles, $unclassified] = $this->classify($files);
                    $explicit = $roles['gallery'] !== [] || isset($roles['thumbnail']) || isset($roles['header']) || isset($roles['banner']);
                    $mode = 'labelled';

                    if (! $explicit) {
                        if (! $auto) {
                            $skipped[] = "{$label} \u{2014} photos aren't labelled t/h/g1/b (re-run with --auto-roles to guess from file names)";

                            continue;
                        }

                        $mode = 'auto';
                        $roles = $this->autoRoles($files);
                        $unclassified = [];

                        if ($product && ! $overwrite && $product->thumbnail_path) {
                            $leftAlone++;

                            continue;
                        }
                    } elseif ($unclassified) {
                        $skipped[] = "{$label} \u{2014} some photos aren't labelled and were ignored: ".implode(', ', $unclassified);
                    }

                    $target = $product ? "product #{$product->id} ({$product->slug})" : 'product (would be created, hidden)';

                    if ($dryRun || $prodVirtual) {
                        $summary = collect($roles)->except('gallery')->map(fn ($f, $role) => "{$role}={$f}")
                            ->merge(collect($roles['gallery'])->map(fn ($f, $i) => 'gallery'.($i + 1)."={$f}"))
                            ->implode(', ');
                        $this->line("[dry-run] {$label} -> {$target} [{$mode}]: {$summary}");
                        $matched++;

                        continue;
                    }

                    $this->applyRoles($product, $productPath, $roles, $uploads);
                    $matched++;
                    $this->line("Updated {$label} -> {$target} [{$mode}]");
                }
            }
        }

        $this->newLine();
        $suffix = $dryRun ? ' (dry run — nothing written).' : ' and updated.';
        $this->info("{$matched} product folder(s) matched{$suffix}");
        $this->info("{$coversMatched} subcategory cover(s) matched{$suffix}");

        if ($leftAlone > 0) {
            $this->line("{$leftAlone} product(s) already have images and were left alone (use --overwrite to replace them).");
        }

        if ($create) {
            $this->line(sprintf(
                '%s %d categories, %d subcategories, %d products (products are hidden, price 0 — set price + switch on in admin).',
                $dryRun ? 'Would create' : 'Created',
                count($this->created['category']),
                count($this->created['subcategory']),
                count($this->created['product'])
            ));
        }

        if ($skipped) {
            $this->newLine();
            $this->warn(count($skipped).' item(s) need a look:');

            foreach (array_slice($skipped, 0, 40) as $line) {
                $this->line("  - {$line}");
            }

            $logPath = storage_path('logs/catalog-import-skipped.txt');
            file_put_contents($logPath, implode(PHP_EOL, $skipped).PHP_EOL);

            if (count($skipped) > 40) {
                $this->line('  ... and '.(count($skipped) - 40).' more.');
            }

            $this->line("Full list saved to: {$logPath}");
        }

        return self::SUCCESS;
    }

    // ------------------------------------------------------------------
    // Lookups
    // ------------------------------------------------------------------

    private function loadLookups(): void
    {
        foreach (ProductCategory::all() as $category) {
            $this->categories[$this->norm($category->name)] = $category;
        }

        foreach (ProductSubcategory::all() as $subcategory) {
            $this->subcategories[$subcategory->category_id][$this->norm($subcategory->name)] = $subcategory;
        }

        foreach (Product::all() as $product) {
            $this->products[(int) $product->subcategory_id][$this->norm($product->name)] = $product;
        }

        $file = database_path('data/catalog_folder_taxonomy.php');

        if (is_file($file)) {
            foreach (require $file as [$cat, $sub, $prod]) {
                $this->taxonomy[$this->norm($cat)] = $cat;
                $this->taxonomy[$this->norm($cat).'|'.$this->norm($sub)] = $sub;
                $this->taxonomy[$this->norm($cat).'|'.$this->norm($sub).'|'.$this->norm($prod)] = $prod;
            }
        }
    }

    /** @return array{0: ?ProductCategory, 1: bool} model (if it exists), would-be-created (dry run) */
    private function resolveCategory(string $dir, bool $create, bool $dryRun): array
    {
        $key = $this->norm($dir);

        if (isset($this->categories[$key])) {
            return [$this->categories[$key], false];
        }

        if (! $create) {
            return [null, false];
        }

        $this->created['category'][$key] = true;

        if ($dryRun) {
            return [null, true];
        }

        $name = $this->taxonomy[$key] ?? $this->prettify($dir);

        return [$this->categories[$key] = ProductCategory::create([
            'name' => $name,
            'slug' => $this->uniqueSlug($name, ProductCategory::class),
            'meta_title' => "{$name} | GuruGanesh Graphics",
        ]), false];
    }

    /** @return array{0: ?ProductSubcategory, 1: bool} */
    private function resolveSubcategory(?ProductCategory $category, bool $catVirtual, string $catKey, string $dir, bool $create, bool $dryRun): array
    {
        $key = $this->norm($dir);

        if ($catVirtual) {
            $this->created['subcategory'][$catKey.'|'.$key] = true;

            return [null, true];
        }

        if (! $category) {
            return [null, false];
        }

        if (isset($this->subcategories[$category->id][$key])) {
            return [$this->subcategories[$category->id][$key], false];
        }

        if (! $create) {
            return [null, false];
        }

        $this->created['subcategory'][$catKey.'|'.$key] = true;

        if ($dryRun) {
            return [null, true];
        }

        $name = $this->taxonomy[$this->norm($category->name).'|'.$key] ?? $this->prettify($dir);

        return [$this->subcategories[$category->id][$key] = ProductSubcategory::create([
            'category_id' => $category->id,
            'name' => $name,
            'slug' => $this->uniqueSlug($name, ProductSubcategory::class),
        ]), false];
    }

    /** @return array{0: ?Product, 1: bool} */
    private function resolveProduct(?ProductSubcategory $subcategory, bool $subVirtual, string $catKey, string $subKey, string $dir, bool $create, bool $dryRun): array
    {
        $key = $this->norm($dir);

        if ($subVirtual) {
            $this->created['product'][$catKey.'|'.$subKey.'|'.$key] = true;

            return [null, true];
        }

        if (! $subcategory) {
            return [null, false];
        }

        if (isset($this->products[$subcategory->id][$key])) {
            return [$this->products[$subcategory->id][$key], false];
        }

        if (! $create) {
            return [null, false];
        }

        $this->created['product'][$catKey.'|'.$subKey.'|'.$key] = true;

        if ($dryRun) {
            return [null, true];
        }

        $name = $this->taxonomy[$catKey.'|'.$subKey.'|'.$key] ?? $this->prettify($dir);

        return [$this->products[$subcategory->id][$key] = Product::create([
            'category_id' => $subcategory->category_id,
            'subcategory_id' => $subcategory->id,
            'name' => $name,
            'slug' => $this->uniqueSlug($name, Product::class, $subcategory->slug),
            'base_price' => 0,
            'min_quantity' => 1,
            'status' => false, // hidden until the owner sets a price and switches it on
            'is_featured' => false,
            'meta_title' => "{$name} | GuruGanesh Graphics",
        ]), false];
    }

    // ------------------------------------------------------------------
    // Names
    // ------------------------------------------------------------------

    /** "1. Visiting Cards" / "Visiting Cards" / "visiting-cards" -> "visiting-cards". */
    private function norm(string $name): string
    {
        $name = preg_replace('/^\s*\d+\s*[.\-)]\s*/', '', $name) ?? $name;
        $name = strtolower(str_replace('&', ' and ', $name));

        return trim(preg_replace('/[^a-z0-9]+/', '-', $name) ?? '', '-');
    }

    /** Last-resort display name for a folder that isn't in the taxonomy file. */
    private function prettify(string $dir): string
    {
        $dir = preg_replace('/^\s*\d+\s*[.\-)]\s*/', '', $dir) ?? $dir;

        return ucwords(trim(str_replace(['-', '_'], ' ', $dir)));
    }

    /** @param class-string<\Illuminate\Database\Eloquent\Model> $model */
    private function uniqueSlug(string $name, string $model, ?string $hint = null): string
    {
        $base = $this->norm($name);
        $candidates = array_filter([$base, $hint ? "{$base}-{$hint}" : null]);

        foreach ($candidates as $slug) {
            if (! $model::where('slug', $slug)->exists()) {
                return $slug;
            }
        }

        $i = 2;
        $root = end($candidates);

        while ($model::where('slug', "{$root}-{$i}")->exists()) {
            $i++;
        }

        return "{$root}-{$i}";
    }

    // ------------------------------------------------------------------
    // Files
    // ------------------------------------------------------------------

    /** @return string[] */
    private function subdirectories(string $path): array
    {
        $entries = scandir($path) ?: [];

        return array_values(array_filter(
            $entries,
            fn (string $entry) => $entry !== '.' && $entry !== '..'
                && ! str_starts_with($entry, '_') // _Review, _to-review, _Duplicates are work-in-progress folders
                && is_dir($path.DIRECTORY_SEPARATOR.$entry)
        ));
    }

    /** @return string[] image files directly inside the folder, in name order */
    private function imageFiles(string $path): array
    {
        $files = array_values(array_filter(
            scandir($path) ?: [],
            fn (string $f) => is_file($path.DIRECTORY_SEPARATOR.$f)
                && in_array(strtolower(pathinfo($f, PATHINFO_EXTENSION)), self::IMAGE_EXTENSIONS, true)
        ));

        natcasesort($files);

        return array_values($files);
    }

    /** True if the subcategory folder has a cover photo or any product folder with photos. */
    private function hasPhotos(string $subPath): bool
    {
        if ($this->findCover($subPath) !== null) {
            return true;
        }

        foreach ($this->subdirectories($subPath) as $productDir) {
            if ($this->imageFiles($subPath.DIRECTORY_SEPARATOR.$productDir) !== []) {
                return true;
            }
        }

        return false;
    }

    private function findCover(string $subPath): ?string
    {
        foreach ($this->imageFiles($subPath) as $file) {
            if (preg_match(self::COVER_PATTERN, pathinfo($file, PATHINFO_FILENAME))) {
                return $file;
            }
        }

        return null;
    }

    /**
     * @param string[] $files
     * @return array{0: array{thumbnail?: string, header?: string, banner?: string, gallery: array<int, string>}, 1: string[]}
     */
    private function classify(array $files): array
    {
        $roles = ['gallery' => []];
        $unmatched = [];

        foreach ($files as $file) {
            $name = pathinfo($file, PATHINFO_FILENAME);
            $matchedRole = false;

            foreach (self::ROLE_PATTERNS as $role => $pattern) {
                if (preg_match($pattern, $name)) {
                    $roles[$role] = $file;
                    $matchedRole = true;

                    break;
                }
            }

            if ($matchedRole) {
                continue;
            }

            if (preg_match(self::GALLERY_PATTERN, $name, $m)) {
                $roles['gallery'][(int) $m[1] - 1] = $file;

                continue;
            }

            $unmatched[] = $file;
        }

        ksort($roles['gallery']);

        return [$roles, $unmatched];
    }

    /**
     * Guess roles for unlabelled photos from their file names (the photos
     * come with descriptive names like "Kraft_paper_bags_display_...jpg").
     *
     * @param string[] $files
     * @return array{thumbnail?: string, header?: string, banner?: string, gallery: array<int, string>}
     */
    private function autoRoles(array $files): array
    {
        $roles = ['gallery' => []];

        $banner = null;
        $rest = [];

        foreach ($files as $file) {
            if ($banner === null && preg_match('/banner|advertis/i', $file)) {
                $banner = $file;
            } else {
                $rest[] = $file;
            }
        }

        $pick = function (string $pattern, array &$pool) {
            foreach ($pool as $i => $file) {
                if (preg_match($pattern, $file)) {
                    unset($pool[$i]);

                    return $file;
                }
            }

            return null;
        };

        if ($banner) {
            $roles['banner'] = $banner;
        }

        if ($rest === []) {
            // Only a banner-style shot exists — better than a blank product page.
            if ($banner) {
                $roles['thumbnail'] = $banner;
                $roles['header'] = $banner;
            }

            return $roles;
        }

        $thumb = $pick('/close|macro|detail|stack/i', $rest) ?? array_shift($rest);
        $rest = array_values($rest);
        $header = $pick('/presentation|display|catalog|product|desk/i', $rest) ?? array_shift($rest) ?? $thumb;
        $rest = array_values($rest);

        $roles['thumbnail'] = $thumb;
        $roles['header'] = $header;
        $roles['gallery'] = array_slice($rest, 0, 4);

        return $roles;
    }

    /** @param array{thumbnail?: string, header?: string, banner?: string, gallery: array<int, string>} $roles */
    private function applyRoles(Product $product, string $productPath, array $roles, ImageUploadService $uploads): void
    {
        if (isset($roles['thumbnail'])) {
            $uploads->delete($product->thumbnail_path);
            $product->thumbnail_path = $uploads->storeFromPath($productPath.DIRECTORY_SEPARATOR.$roles['thumbnail'], 'products/thumbnails');
        }

        if (isset($roles['header'])) {
            $uploads->delete($product->header_image_path);
            $product->header_image_path = $uploads->storeFromPath($productPath.DIRECTORY_SEPARATOR.$roles['header'], 'products/headers');
        }

        if (isset($roles['banner'])) {
            $uploads->delete($product->banner_image_path);
            $product->banner_image_path = $uploads->storeFromPath($productPath.DIRECTORY_SEPARATOR.$roles['banner'], 'products/banners');
        }

        $product->save();

        if (! empty($roles['gallery'])) {
            // Replace rather than append, so re-running this command after
            // fixing a photo doesn't pile up duplicate gallery rows.
            foreach ($product->images as $existing) {
                $uploads->delete($existing->path);
                $existing->delete();
            }

            $sortOrder = 0;
            foreach ($roles['gallery'] as $file) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'path' => $uploads->storeFromPath($productPath.DIRECTORY_SEPARATOR.$file, 'products/gallery'),
                    'sort_order' => $sortOrder++,
                ]);
            }
        }
    }
}
