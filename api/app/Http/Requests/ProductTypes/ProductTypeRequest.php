<?php

namespace App\Http\Requests\ProductTypes;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('productType')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('product_types', 'slug')->ignore($id)],
        ];
    }
}
