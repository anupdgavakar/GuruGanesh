<?php

namespace App\Console\Commands;

use App\Models\ProductCategory;
use App\Models\ProductSubcategory;
use App\Services\ImageUploadService;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

/**
 * Puts the finished category and subcategory pictures onto the website.
 *
 *   php artisan catalog:import-cover-images "F:\GuruGanesh\Products" --dry-run
 *   php artisan catalog:import-cover-images "F:\GuruGanesh\Products"
 *
 * The folder given must contain two sub-folders, "category images" and
 * "subcategory images". Which picture belongs to which category or
 * subcategory is written down in database/data/catalog_cover_map.php.
 *
 * By default a category/subcategory that already has a picture is left alone;
 * use --overwrite to replace pictures that are already set.
 */
class ImportCoverImages extends Command
{
    protected $signature = 'catalog:import-cover-images
        {path : Folder that contains "category images" and "subcategory images"}
        {--dry-run : Show what would happen without changing anything}
        {--overwrite : Replace pictures that are already set}';

    protected $description = 'Attach the category and subcategory pictures to the catalogue';

    public function handle(ImageUploadService $uploads): int
    {
        $root = rtrim((string) $this->argument('path'), "\\/");
        $dry = (bool) $this->option('dry-run');
        $overwrite = (bool) $this->option('overwrite');

        $mapFile = database_path('data/catalog_cover_map.php');
        if (! is_file($mapFile)) {
            $this->error("Map file not found: {$mapFile}");

            return self::FAILURE;
        }
        $map = require $mapFile;

        $categoryFiles = $this->indexFolder($root.DIRECTORY_SEPARATOR.'category images');
        $subcategoryFiles = $this->indexFolder($root.DIRECTORY_SEPARATOR.'subcategory images');

        if ($categoryFiles === null && $subcategoryFiles === null) {
            $this->error("Neither \"category images\" nor \"subcategory images\" was found inside: {$root}");

            return self::FAILURE;
        }

        $categories = ProductCategory::all()->keyBy(fn ($c) => $this->norm($c->name));
        $subcategories = ProductSubcategory::with('category')->get()
            ->keyBy(fn ($s) => $this->norm($s->category?->name ?? '').'|'.$this->norm($s->name));

        $problems = [];
        $placed = ['categories' => 0, 'subcategories' => 0];
        $skippedHave = 0;
        $touchedCategoryIds = [];
        $touchedSubIds = [];

        $this->line($dry ? 'DRY RUN — nothing will be changed.' : 'Placing pictures…');
        $this->newLine();

        foreach ($map['categories'] as [$name, $fileKey]) {
            $record = $categories[$this->norm($name)] ?? null;

            if (! $record) {
                $problems[] = "Category not in the database: {$name}";

                continue;
            }

            $touchedCategoryIds[] = $record->id;
            $file = $categoryFiles[$fileKey] ?? null;

            if (! $file) {
                $problems[] = "Picture file not found for category \"{$name}\" (looked for: {$fileKey})";

                continue;
            }

            if ($record->image_path && ! $overwrite) {
                $skippedHave++;
                $this->line("  skip   {$name} — already has a picture");

                continue;
            }

            $this->line("  place  {$name}  <-  ".basename($file));

            if (! $dry) {
                $uploads->delete($record->image_path);
                $record->image_path = $uploads->storeFromPath($file, 'categories');
                $record->save();
            }
            $placed['categories']++;
        }

        $this->newLine();

        foreach ($map['subcategories'] as [$categoryName, $name, $fileKey]) {
            $record = $subcategories[$this->norm($categoryName).'|'.$this->norm($name)] ?? null;

            if (! $record) {
                $problems[] = "Subcategory not in the database: {$categoryName} / {$name}";

                continue;
            }

            $touchedSubIds[] = $record->id;
            $file = $subcategoryFiles[$fileKey] ?? null;

            if (! $file) {
                $problems[] = "Picture file not found for \"{$categoryName} / {$name}\" (looked for: {$fileKey})";

                continue;
            }

            if ($record->image_path && ! $overwrite) {
                $skippedHave++;
                $this->line("  skip   {$categoryName} / {$name} — already has a picture");

                continue;
            }

            $this->line("  place  {$categoryName} / {$name}  <-  ".basename($file));

            if (! $dry) {
                $uploads->delete($record->image_path);
                $record->image_path = $uploads->storeFromPath($file, 'subcategories');
                $record->save();
            }
            $placed['subcategories']++;
        }

        $this->newLine();
        $verb = $dry ? 'would be placed' : 'placed';
        $this->info("{$placed['categories']} category picture(s) and {$placed['subcategories']} subcategory picture(s) {$verb}."
            .($skippedHave ? " {$skippedHave} skipped (already had one — use --overwrite to replace)." : ''));

        // Whatever is still without a picture after this run.
        $stillCategories = ProductCategory::all()->filter(
            fn ($c) => ! $c->image_path && ! ($dry && in_array($c->id, $touchedCategoryIds, true) && $this->wouldPlace($c, $map['categories'], $categoryFiles))
        );
        $stillSubs = ProductSubcategory::with('category')->get()->filter(
            fn ($s) => ! $s->image_path && ! ($dry && in_array($s->id, $touchedSubIds, true) && $this->wouldPlaceSub($s, $map['subcategories'], $subcategoryFiles))
        );

        if ($stillCategories->isNotEmpty() || $stillSubs->isNotEmpty()) {
            $this->newLine();
            $this->warn('Still without a picture:');
            foreach ($stillCategories as $c) {
                $this->line("  category     {$c->name}");
            }
            foreach ($stillSubs as $s) {
                $this->line("  subcategory  {$s->category?->name} / {$s->name}");
            }
        }

        if ($problems) {
            $this->newLine();
            $this->warn('Could not be matched:');
            foreach ($problems as $p) {
                $this->line("  - {$p}");
            }
        }

        // Keep a copy of the report for reference.
        $report = storage_path('logs/catalog-cover-images.txt');
        file_put_contents($report, implode(PHP_EOL, array_merge(
            ["placed: {$placed['categories']} categories, {$placed['subcategories']} subcategories".($dry ? ' (dry run)' : '')],
            $problems
        )).PHP_EOL);

        return self::SUCCESS;
    }

    /**
     * Every picture in a folder, keyed by its letters and digits only (with
     * the 14-digit number stamp removed), so names match however Windows or
     * PHP happens to show the "…" cut-off character.
     *
     * @return array<string, string>|null  key => full path, or null if the folder is missing
     */
    private function indexFolder(string $dir): ?array
    {
        if (! is_dir($dir)) {
            $this->warn("Folder not found: {$dir}");

            return null;
        }

        $out = [];

        foreach (scandir($dir) ?: [] as $name) {
            if ($name === '.' || $name === '..') {
                continue;
            }

            $path = $dir.DIRECTORY_SEPARATOR.$name;

            if (! is_file($path) || ! preg_match('/\.(jpe?g|png|webp)$/i', $name)) {
                continue;
            }

            $base = preg_replace('/\.[^.]+$/', '', $name);
            $base = preg_replace('/\d{14}/', '', (string) $base);
            $key = strtolower(preg_replace('/[^a-z0-9]+/i', '', (string) $base));

            $out[$key] = $path;
        }

        return $out;
    }

    private function norm(string $value): string
    {
        return Str::slug(str_replace('&', 'and', $value));
    }

    /** @param  array<int, array{0:string,1:string}>  $entries */
    private function wouldPlace(ProductCategory $c, array $entries, ?array $files): bool
    {
        foreach ($entries as [$name, $key]) {
            if ($this->norm($name) === $this->norm($c->name) && isset($files[$key])) {
                return true;
            }
        }

        return false;
    }

    /** @param  array<int, array{0:string,1:string,2:string}>  $entries */
    private function wouldPlaceSub(ProductSubcategory $s, array $entries, ?array $files): bool
    {
        foreach ($entries as [$cat, $name, $key]) {
            if ($this->norm($cat) === $this->norm($s->category?->name ?? '')
                && $this->norm($name) === $this->norm($s->name)
                && isset($files[$key])) {
                return true;
            }
        }

        return false;
    }
}
