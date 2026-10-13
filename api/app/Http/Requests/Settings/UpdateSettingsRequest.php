<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    // Admin/staff only — enforced by the route middleware, same pattern as
    // UpdateOrderStatusRequest / UpdateInquiryStatusRequest.
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Nullable at the field level (this is a PATCH — a request may
            // only touch some settings), but a value that IS present must
            // be a real email since it's shown to customers as "email us
            // your design" and used in a mailto: link on the storefront.
            'design_submission_email' => ['sometimes', 'nullable', 'email', 'max:255'],

            // Turns every price off on the website (customers must ask).
            'hide_prices' => ['sometimes', 'boolean'],
        ];
    }
}
