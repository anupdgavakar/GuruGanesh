<?php

namespace App\Http\Requests\DeliveryOptions;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DeliveryOptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('deliveryOption')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('product_delivery_options', 'slug')->ignore($id)],
            'description' => ['nullable', 'string'],
            'estimated_days' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
