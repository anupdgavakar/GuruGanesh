<?php

namespace App\Http\Requests\DesignFiles;

use Illuminate\Foundation\Http\FormRequest;

class DesignFileUploadRequest extends FormRequest
{
    // Public — uploaded at cart time, before any order/account exists.
    // Rate-limited at the route level (throttle:20,1), same technique as
    // /orders and /inquiries.
    public function authorize(): bool
    {
        return true;
    }

    public const ALLOWED_EXTENSIONS = ['pdf', 'ai', 'eps', 'psd', 'cdr', 'png', 'jpg', 'jpeg'];

    // 75MB — generous for flattened artwork and most native design files;
    // see DesignFileUploadService/filesystems.php for why bigger native
    // files are steered toward the "paste a link" option instead of
    // pushing a huge upload through this server.
    public const MAX_KILOBYTES = 76800;

    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'max:'.self::MAX_KILOBYTES,
                // Deliberately NOT Laravel's `mimes:` rule here: that rule
                // trusts the server's fileinfo/MIME database to recognize
                // the file's content type, and obscure-but-legitimate
                // design formats like .cdr and .ai routinely get sniffed
                // as generic application/octet-stream — which would
                // reject a real CorelDraw file with the right extension.
                // Extension allow-listing is the pragmatic choice print
                // shops use for exactly this reason.
                function ($attribute, $value, $fail) {
                    $extension = strtolower((string) $value->getClientOriginalExtension());

                    if (! in_array($extension, self::ALLOWED_EXTENSIONS, true)) {
                        $fail('The design file must be one of: '.implode(', ', self::ALLOWED_EXTENSIONS).'.');
                    }
                },
            ],
        ];
    }
}
