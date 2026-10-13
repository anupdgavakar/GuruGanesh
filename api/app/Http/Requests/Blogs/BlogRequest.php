<?php

namespace App\Http\Requests\Blogs;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class BlogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        // Web addresses cannot hold spaces or capitals: "Guru Ganesh Graphics"
        // becomes "guru-ganesh-graphics". If the slug box is left empty on
        // create, build it from the title.
        $slug = $this->input('slug');
        if (is_string($slug) && trim($slug) !== '') {
            $this->merge(['slug' => Str::slug($slug)]);
        } elseif ($this->isMethod('POST') && ! $this->route('blog') && is_string($this->input('title'))) {
            $this->merge(['slug' => Str::slug($this->input('title'))]);
        }
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
            'thumbnail' => ['nullable', 'image', 'max:15360'],
        ];
    }
}
