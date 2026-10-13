<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'subcategory_id',
        'design_mode_id',
        'delivery_option_id',
        'product_type_id',
        'pricing_tier_id',
        'name',
        'slug',
        'description',
        'base_price',
        'price_on_request',
        'min_quantity',
        'max_quantity',
        'status',
        'is_featured',
        'banner_headline',
        'banner_subtext',
        'meta_title',
        'meta_description',
        // thumbnail_path / header_image_path / banner_image_path ARE
        // fillable, but that's safe: StoreProductRequest/UpdateProductRequest
        // only ever validate 'thumbnail' / 'header_image' / 'banner_image' as
        // uploaded files, never these *_path columns as request input — the
        // controller is the only place that ever puts a *_path key into the
        // validated array, after it has stored the file itself via
        // ImageUploadService. A client can't set an arbitrary path through
        // the API.
        'thumbnail_path',
        'header_image_path',
        'banner_image_path',
    ];

    protected $appends = ['thumbnail_url', 'header_image_url', 'banner_image_url'];

    protected $casts = [
        'status' => 'boolean',
        'is_featured' => 'boolean',
        'price_on_request' => 'boolean',
        'base_price' => 'decimal:2',
    ];

    // Public product URLs use the slug (/api/products/{slug}), not the
    // numeric id — the storefront needs SEO-friendly, stable URLs.
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    protected function thumbnailUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->thumbnail_path ? Storage::disk('public')->url($this->thumbnail_path) : null,
        );
    }

    protected function headerImageUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->header_image_path ? Storage::disk('public')->url($this->header_image_path) : null,
        );
    }

    protected function bannerImageUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->banner_image_path ? Storage::disk('public')->url($this->banner_image_path) : null,
        );
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function subcategory(): BelongsTo
    {
        return $this->belongsTo(ProductSubcategory::class, 'subcategory_id');
    }

    public function designMode(): BelongsTo
    {
        return $this->belongsTo(ProductDesignMode::class, 'design_mode_id');
    }

    public function deliveryOption(): BelongsTo
    {
        return $this->belongsTo(ProductDeliveryOption::class, 'delivery_option_id');
    }

    public function productType(): BelongsTo
    {
        return $this->belongsTo(ProductType::class, 'product_type_id');
    }

    public function pricingTier(): BelongsTo
    {
        return $this->belongsTo(ProductPricingTier::class, 'pricing_tier_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }
}
