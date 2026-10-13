<?php

namespace App\Http\Requests\Orders;

use Illuminate\Foundation\Http\FormRequest;

class OrderRequest extends FormRequest
{
    // Checkout requires a logged-in customer — the route already enforces
    // auth:sanctum + role:customer, so this is defense-in-depth, not the
    // only check.
    public function authorize(): bool
    {
        return $this->user()?->isCustomer() ?? false;
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

            // How this item's artwork is reaching us — entirely optional,
            // same as today (a customer can always sort out artwork later).
            'items.*.design_delivery_method' => ['nullable', 'in:link,email,upload'],

            // Doubles as either a pasted share link (method=link) or the
            // private storage path POST /design-files already returned
            // (method=upload) — the closure below checks it's a real URL
            // only for the 'link' case, since 'upload' is an internal path
            // rather than something meant to be URL-shaped.
            'items.*.design_reference' => [
                'nullable',
                'string',
                'max:2048',
                'required_if:items.*.design_delivery_method,link',
                'required_if:items.*.design_delivery_method,upload',
                function ($attribute, $value, $fail) {
                    $index = explode('.', $attribute)[1] ?? null;
                    $method = $index !== null ? request()->input("items.$index.design_delivery_method") : null;

                    if ($method === 'link' && $value && ! filter_var($value, FILTER_VALIDATE_URL)) {
                        $fail('Please paste a valid link (starting with https://).');
                    }
                },
            ],

            // The customer's real filename, for method=upload only — what
            // shows up when staff download it from the admin panel.
            'items.*.design_original_filename' => ['nullable', 'string', 'max:255'],

            // A honeypot field, same technique as the contact form — hidden
            // via CSS on the frontend, so only a bot fills it in.
            'website' => ['prohibited'],
        ];
    }
}
