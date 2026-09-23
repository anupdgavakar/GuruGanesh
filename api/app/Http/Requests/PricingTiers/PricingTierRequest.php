<?php

namespace App\Http\Requests\PricingTiers;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PricingTierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('pricingTier')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('product_pricing_tiers', 'slug')->ignore($id)],
            'description' => ['nullable', 'string'],
            'price_multiplier' => ['required', 'numeric', 'min:0'],
        ];
    }
}
