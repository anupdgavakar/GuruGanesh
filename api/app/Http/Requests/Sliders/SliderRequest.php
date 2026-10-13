<?php

namespace App\Http\Requests\Sliders;

use Illuminate\Foundation\Http\FormRequest;

class SliderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * The sliders table only defaults sort_order to 0 when the column is
     * left out of the insert entirely — an explicit null (what the admin
     * form sends when the field is left blank) bypasses that default and
     * trips the NOT NULL constraint. Normalize blank input to 0 here so
     * both store() and update() insert/save a real integer either way.
     */
    protected function prepareForValidation(): void
    {
        if ($this->input('sort_order') === null || $this->input('sort_order') === '') {
            $this->merge(['sort_order' => 0]);
        }
    }

    public function rules(): array
    {
        $isCreate = $this->route('slider') === null;

        return [
            'title' => ['nullable', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'link_url' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'status' => ['boolean'],
            'image' => [$isCreate ? 'required' : 'sometimes', 'image', 'max:15360'],
        ];
    }
}
