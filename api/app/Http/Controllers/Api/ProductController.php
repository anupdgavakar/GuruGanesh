<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Products\StoreProductRequest;
use App\Http\Requests\Products\UpdateProductRequest;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Setting;
use App\Services\ImageUploadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function __construct(private readonly ImageUploadService $uploads)
    {
    }

    /**
     * Public: list products, optionally filtered by category/subcategory/slug.
     */
    private const EAGER_LOAD = [
        'category', 'subcategory', 'designMode', 'deliveryOption', 'productType', 'pricingTier', 'images',
    ];

    public function index(Request $request)
    {
        $query = Product::query()->with(self::EAGER_LOAD);

        // Disabled products are hidden from the public storefront by default.
        // The admin panel needs to see (and re-enable) them too, so a
        // logged-in admin/staff member can opt in with ?include_inactive=1 —
        // an anonymous request can never see them just by passing the flag.
        $canSeeInactive = $request->user('sanctum')?->canManageCatalog() ?? false;

        if (! $canSeeInactive || ! $request->boolean('include_inactive')) {
            $query->where('status', true);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        if ($request->filled('subcategory_id')) {
            $query->where('subcategory_id', $request->integer('subcategory_id'));
        }

        if ($request->filled('slug')) {
            $query->where('slug', $request->string('slug'));
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        // Powers the storefront header's search bar (see web/src/app/search) —
        // a simple LIKE match on name/description, no full-text index needed
        // at this catalog's size.
        if ($request->filled('search')) {
            $term = $request->string('search')->toString();

            $query->where(function ($inner) use ($term) {
                $inner->where('name', 'like', "%{$term}%")
                    ->orWhere('description', 'like', "%{$term}%");
            });
        }

        $page = $query->latest()->paginate($request->integer('per_page', 24));

        $this->hidePricesForPublic($request, $page->getCollection());

        return response()->json([
            'status' => 'success',
            'data' => $page,
        ]);
    }

    /**
     * The website must never reveal a price the owner has chosen to keep
     * private — either for one product (price_on_request) or for the whole
     * shop (the "hide prices" setting). Hiding it in the page is not enough,
     * since anyone can read the API response, so the price is blanked here,
     * for everyone except signed-in admin/staff (who need the real value to
     * edit it). The storefront treats a price of 0 as "Ask for price".
     *
     * @param  iterable<Product>  $products
     */
    private function hidePricesForPublic(Request $request, iterable $products): void
    {
        if ($request->user('sanctum')?->canManageCatalog()) {
            return;
        }

        $hideAll = Setting::hidePrices();

        foreach ($products as $product) {
            if ($hideAll || $product->price_on_request) {
                $product->base_price = 0;
            }
        }
    }

    /**
     * Public: single product by id or slug.
     */
    public function show(Request $request, Product $product)
    {
        $product->load(self::EAGER_LOAD);

        $this->hidePricesForPublic($request, [$product]);

        return response()->json(['status' => 'success', 'data' => $product]);
    }

    /**
     * Admin only (StoreProductRequest::authorize enforces this via ProductPolicy).
     */
    public function store(StoreProductRequest $request)
    {
        $validated = $request->safe()->except(['thumbnail', 'header_image', 'banner_image', 'images']);

        return DB::transaction(function () use ($request, $validated) {
            if ($request->hasFile('thumbnail')) {
                $validated['thumbnail_path'] = $this->uploads->store($request->file('thumbnail'), 'products/thumbnails');
            }

            if ($request->hasFile('header_image')) {
                $validated['header_image_path'] = $this->uploads->store($request->file('header_image'), 'products/headers');
            }

            if ($request->hasFile('banner_image')) {
                $validated['banner_image_path'] = $this->uploads->store($request->file('banner_image'), 'products/banners');
            }

            $product = Product::create($validated);

            foreach ($request->file('images', []) as $index => $image) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'path' => $this->uploads->store($image, 'products/gallery'),
                    'sort_order' => $index,
                ]);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Product created.',
                'data' => $product->load(['category', 'images']),
            ], 201);
        });
    }

    /**
     * Admin only (UpdateProductRequest::authorize enforces this via ProductPolicy).
     */
    public function update(UpdateProductRequest $request, Product $product)
    {
        $validated = $request->safe()->except([
            'thumbnail', 'header_image', 'banner_image',
            'remove_thumbnail', 'remove_header_image', 'remove_banner_image',
            'images', 'remove_image_ids',
        ]);

        return DB::transaction(function () use ($request, $product, $validated) {
            if ($request->boolean('remove_thumbnail')) {
                $this->uploads->delete($product->thumbnail_path);
                $validated['thumbnail_path'] = null;
            } elseif ($request->hasFile('thumbnail')) {
                $this->uploads->delete($product->thumbnail_path);
                $validated['thumbnail_path'] = $this->uploads->store($request->file('thumbnail'), 'products/thumbnails');
            }

            if ($request->boolean('remove_header_image')) {
                $this->uploads->delete($product->header_image_path);
                $validated['header_image_path'] = null;
            } elseif ($request->hasFile('header_image')) {
                $this->uploads->delete($product->header_image_path);
                $validated['header_image_path'] = $this->uploads->store($request->file('header_image'), 'products/headers');
            }

            if ($request->boolean('remove_banner_image')) {
                $this->uploads->delete($product->banner_image_path);
                $validated['banner_image_path'] = null;
            } elseif ($request->hasFile('banner_image')) {
                $this->uploads->delete($product->banner_image_path);
                $validated['banner_image_path'] = $this->uploads->store($request->file('banner_image'), 'products/banners');
            }

            $product->update($validated);

            if ($request->filled('remove_image_ids')) {
                $images = $product->images()->whereIn('id', $request->input('remove_image_ids'))->get();

                foreach ($images as $image) {
                    $this->uploads->delete($image->path);
                    $image->delete();
                }
            }

            $nextSortOrder = ($product->images()->max('sort_order') ?? -1) + 1;

            foreach ($request->file('images', []) as $index => $image) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'path' => $this->uploads->store($image, 'products/gallery'),
                    'sort_order' => $nextSortOrder + $index,
                ]);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Product updated.',
                'data' => $product->fresh(['category', 'images']),
            ]);
        });
    }

    /**
     * Admin only, authorized explicitly (destroy has no Form Request to hang authorize() on).
     */
    public function destroy(Request $request, Product $product)
    {
        if (! $request->user()->can('delete', $product)) {
            abort(403);
        }

        DB::transaction(function () use ($product) {
            $this->uploads->delete($product->thumbnail_path);
            $this->uploads->delete($product->header_image_path);
            $this->uploads->delete($product->banner_image_path);

            foreach ($product->images as $image) {
                $this->uploads->delete($image->path);
            }

            $product->delete();
        });

        return response()->json(['status' => 'success', 'message' => 'Product deleted.']);
    }
}
