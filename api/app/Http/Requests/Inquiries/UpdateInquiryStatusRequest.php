<?php

namespace App\Http\Requests\Inquiries;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInquiryStatusRequest extends FormRequest
{
    // Already gated by the 'role:admin' route middleware.
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(['new', 'read', 'responded'])],
        ];
    }
}
