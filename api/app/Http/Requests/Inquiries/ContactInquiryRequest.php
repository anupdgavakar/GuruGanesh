<?php

namespace App\Http\Requests\Inquiries;

use Illuminate\Foundation\Http\FormRequest;

class ContactInquiryRequest extends FormRequest
{
    // Public endpoint — anyone can submit a contact form.
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'subject' => ['nullable', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
            // A honeypot field: real users never fill this in (it's hidden
            // via CSS on the frontend); a bot that fills every field will.
            // Not persisted — just used to silently reject the submission.
            'website' => ['prohibited'],
        ];
    }
}
