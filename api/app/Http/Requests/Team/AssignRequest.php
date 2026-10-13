<?php

namespace App\Http\Requests\Team;

use Illuminate\Foundation\Http\FormRequest;

class AssignRequest extends FormRequest
{
    // Gated by the 'permission:assign' route middleware.
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // null / missing = take the handler off. Who may be chosen (an active
        // team member who can actually work on this kind of request) is
        // checked in HandlingController, which knows which kind it is.
        return [
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
        ];
    }
}
