<?php

namespace App\Http\Requests\Orders;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderStatusRequest extends FormRequest
{
    // Already gated by the 'role:admin,staff' route middleware.
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(['pending_review', 'confirmed', 'processing', 'completed', 'cancelled'])],
        ];
    }
}
