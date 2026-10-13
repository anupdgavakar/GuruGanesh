<?php

namespace App\Http\Requests\Categories;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoryRequest extends FormRequest
{
    // Write routes are already gated by the 'role:admin' route middleware.
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        // An empty "menu order" box arrives as null; the column is NOT NULL (default 0).
        if ($this->has('menu_order') && ($this->input('menu_order') === null || $this->input('menu_order') === '')) {
            $this->merge(['menu_order' => 0]);
        }
    }

    public function rules(): array
    {
        $id = $this->route('category')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('product_categories', 'slug')->ignore($id)],
            'image' => ['nullable', 'image', 'max:15360'],
            'show_in_menu' => ['sometimes', 'boolean'],
            'menu_order' => ['nullable', 'integer', 'min:0', 'max:1000'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
        ];
    }
}
