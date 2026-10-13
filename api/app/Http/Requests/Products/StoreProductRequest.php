<?php

namespace App\Http\Requests\Products;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Product::class);
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'exists:product_categories,id'],
            'subcategory_id' => ['nullable', 'exists:product_subcategories,id'],
            'design_mode_id' => ['nullable', 'exists:product_design_modes,id'],
            'delivery_option_id' => ['nullable', 'exists:product_delivery_options,id'],
            'product_type_id' => ['nullable', 'exists:product_types,id'],
            'pricing_tier_id' => ['nullable', 'exists:product_pricing_tiers,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:products,slug'],
            'description' => ['nullable', 'string'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'min_quantity' => ['required', 'integer', 'min:1'],
            'max_quantity' => ['nullable', 'integer', 'gte:min_quantity'],
            'status' => ['boolean'],
            'is_featured' => ['boolean'],
            'price_on_request' => ['boolean'],
            'banner_headline' => ['nullable', 'string', 'max:255'],
            'banner_subtext' => ['nullable', 'string', 'max:500'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'thumbnail' => ['nullable', 'image', 'max:15360'],
            'header_image' => ['nullable', 'image', 'max:15360'],
            'banner_image' => ['nullable', 'image', 'max:15360'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'max:15360'],
        ];
    }
}
