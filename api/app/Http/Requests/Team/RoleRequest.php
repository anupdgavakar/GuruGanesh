<?php

namespace App\Http\Requests\Team;

use App\Enums\UserRole;
use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoleRequest extends FormRequest
{
    // Gated by the 'permission:users' route middleware.
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var Role|null $role */
        $role = $this->route('role'); // null when creating

        return [
            'name' => [
                'required', 'string', 'max:80',
                Rule::unique('roles', 'name')->ignore($role?->id),
            ],
            'description' => ['nullable', 'string', 'max:300'],
            'permissions' => ['present', 'array'],
            // "users" can't be given to a custom role — see UserRole::grantable().
            'permissions.*' => ['string', 'distinct', Rule::in(UserRole::grantable())],
        ];
    }
}
