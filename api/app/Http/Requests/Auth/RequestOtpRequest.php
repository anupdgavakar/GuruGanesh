<?php

namespace App\Http\Requests\Auth;

use App\Support\Phone;
use Illuminate\Foundation\Http\FormRequest;

class RequestOtpRequest extends FormRequest
{
    // Public — this is step one of registration/login, before anyone has a
    // token. Rate-limited at the route level (throttle:5,1).
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['phone' => Phone::normalize($this->input('phone'))]);
    }

    public function rules(): array
    {
        return [
            'phone' => ['required', 'regex:/^\+?[0-9]{10,15}$/'],
            // Only used if this phone turns out to be a brand-new
            // registration — see OtpAuthController::findOrCreateUser().
            'name' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Enter a valid phone number.',
        ];
    }
}
