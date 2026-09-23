<?php

namespace App\Http\Requests\Products;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('product'));
    }

    public function rules(): array
    {
        $product = $this->route('product');

        return [
            'category_id' => ['sometimes', 'required', 'exists:product_categories,id'],
            'subcategory_id' => ['nullable', 'exists:product_subcategories,id'],
            'design_mode_id' => ['nullable', 'exists:product_design_modes,id'],
            'delivery_option_id' => ['nullable', 'exists:product_delivery_options,id'],
            'product_type_id' => ['nullable', 'exists:product_types,id'],
            'pricing_tier_id' => ['nullable', 'exists:product_pricing_tiers,id'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($product->id)],
            'description' => ['nullable', 'string'],
            'base_price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'min_quantity' => ['sometimes', 'required', 'integer', 'min:1'],
            'max_quantity' => ['nullable', 'integer', 'gte:min_quantity'],
            'status' => ['boolean'],
            'is_featured' => ['boolean'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'thumbnail' => ['nullable', 'image', 'max:2048'],
            'header_image' => ['nullable', 'image', 'max:4096'],
            'remove_thumbnail' => ['boolean'],
            'remove_header_image' => ['boolean'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'max:4096'],
            'remove_image_ids' => ['nullable', 'array'],
            'remove_image_ids.*' => ['integer', 'exists:product_images,id'],
        ];
    }
}
