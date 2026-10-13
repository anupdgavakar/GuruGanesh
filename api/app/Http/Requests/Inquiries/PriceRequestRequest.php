<?php

namespace App\Http\Requests\Inquiries;

use Illuminate\Foundation\Http\FormRequest;

class PriceRequestRequest extends FormRequest
{
    // The route already needs a signed-in customer; this is a second check.
    public function authorize(): bool
    {
        return $this->user()?->isCustomer() ?? false;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:10000000'],
            // The customer's name and phone come from their account; an email is optional.
            'email' => ['nullable', 'email', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'website' => ['prohibited'], // honeypot, as on the contact form
        ];
    }
}
