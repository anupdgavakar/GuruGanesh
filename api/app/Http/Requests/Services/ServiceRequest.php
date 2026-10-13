<?php

namespace App\Http\Requests\Services;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('service')?->id;
        $isCreate = $id === null;

        return [
            'name' => [$isCreate ? 'required' : 'sometimes', 'required', 'string', 'max:255'],
            'slug' => [$isCreate ? 'required' : 'sometimes', 'required', 'string', 'max:255', Rule::unique('services', 'slug')->ignore($id)],
            'short_description' => ['nullable', 'string'],
            'content' => ['nullable', 'string'],
            'status' => ['boolean'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'icon' => ['nullable', 'image', 'max:15360'],
            'image' => ['nullable', 'image', 'max:15360'],
        ];
    }
}
