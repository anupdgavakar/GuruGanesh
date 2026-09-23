<?php

namespace App\Http\Requests\Orders;

use Illuminate\Foundation\Http\FormRequest;

class OrderRequest extends FormRequest
{
    // Public endpoint — no account/login required to check out (there is no
    // public customer registration endpoint in this app), same as the
    // contact form.
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_email' => ['required', 'email', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:30'],
            'shipping_address' => ['nullable', 'string', 'max:2000'],
            'notes' => ['nullable', 'string', 'max:2000'],

            // Prices are NEVER taken from the client — only product_id and
            // quantity. OrderController looks up each product's real
            // base_price itself and computes totals server-side, exactly
            // like every *_path field elsewhere in this app is only ever
            // written by trusted server code, never raw request input.
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],

            // A honeypot field, same technique as the contact form — hidden
            // via CSS on the frontend, so only a bot fills it in.
            'website' => ['prohibited'],
        ];
    }
}
