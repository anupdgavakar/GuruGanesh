<?php

namespace App\Http\Requests\DesignModes;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DesignModeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('designMode')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('product_design_modes', 'slug')->ignore($id)],
            'description' => ['nullable', 'string'],
        ];
    }
}
