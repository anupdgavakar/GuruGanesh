<?php

namespace App\Http\Requests\Brands;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BrandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('brand')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('brands', 'slug')->ignore($id)],
            'website_url' => ['nullable', 'url', 'max:255'],
            'status' => ['boolean'],
            'logo' => [$id ? 'sometimes' : 'nullable', 'image', 'max:15360'],
        ];
    }
}
