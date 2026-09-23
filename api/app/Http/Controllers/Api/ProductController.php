<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Products\StoreProductRequest;
use App\Http\Requests\Products\UpdateProductRequest;
use App\Models\Product;
use App\Models\ProductImage;
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

        return response()->json([
            'status' => 'success',
            'data' => $query->latest()->paginate($request->integer('per_page', 24)),
        ]);
    }

    /**
     * Public: single product by id or slug.
     */
    public function show(Product $product)
    {
        $product->load(self::EAGER_LOAD);

        return response()->json(['status' => 'success', 'data' => $product]);
    }

    /**
     * Admin only (StoreProductRequest::authorize enforces this via ProductPolicy).
     */
    public function store(StoreProductRequest $request)
    {
        $validated = $request->safe()->except(['thumbnail', 'header_image', 'images']);

        return DB::transaction(function () use ($request, $validated) {
            if ($request->hasFile('thumbnail')) {
                $validated['thumbnail_path'] = $this->uploads->store($request->file('thumbnail'), 'products/thumbnails');
            }

            if ($request->hasFile('header_image')) {
                $validated['header_image_path'] = $this->uploads->store($request->file('header_image'), 'products/headers');
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
            'thumbnail', 'header_image', 'remove_thumbnail', 'remove_header_image',
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

            foreach ($product->images as $image) {
                $this->uploads->delete($image->path);
            }

            $product->delete();
        });

        return response()->json(['status' => 'success', 'message' => 'Product deleted.']);
    }
}
