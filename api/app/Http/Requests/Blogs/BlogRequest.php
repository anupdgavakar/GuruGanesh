<?php

namespace App\Http\Requests\Blogs;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BlogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('blog')?->id;
        $isCreate = $id === null;

        return [
            'title' => [$isCreate ? 'required' : 'sometimes', 'required', 'string', 'max:255'],
            'slug' => [$isCreate ? 'required' : 'sometimes', 'required', 'string', 'max:255', Rule::unique('blogs', 'slug')->ignore($id)],
            'excerpt' => ['nullable', 'string'],
            'content' => [$isCreate ? 'required' : 'sometimes', 'required', 'string'],
            'status' => ['boolean'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'published_at' => ['nullable', 'date'],
            'thumbnail' => ['nullable', 'image', 'max:4096'],
        ];
    }
}
