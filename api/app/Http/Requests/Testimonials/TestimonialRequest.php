<?php

namespace App\Http\Requests\Testimonials;

use Illuminate\Foundation\Http\FormRequest;

class TestimonialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isCreate = $this->route('testimonial') === null;

        return [
            'customer_name' => [$isCreate ? 'required' : 'sometimes', 'required', 'string', 'max:255'],
            'customer_company' => ['nullable', 'string', 'max:255'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'message' => [$isCreate ? 'required' : 'sometimes', 'required', 'string'],
            'status' => ['boolean'],
            'avatar' => ['nullable', 'image', 'max:2048'],
        ];
    }
}
