<?php

namespace App\Http\Requests\Team;

use App\Enums\UserRole;
use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TeamMemberRequest extends FormRequest
{
    // Gated by the 'permission:users' route middleware.
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $member = $this->route('user'); // null when creating
        $creating = $member === null;

        // Any role from the Roles list — except the older "staff" role, which an
        // account that already has it may keep.
        $roles = Role::query()->where('key', '!=', UserRole::Staff->value)->pluck('key')->all();
        if ($member && $member->role === UserRole::Staff->value) {
            $roles[] = UserRole::Staff->value;
        }

        return [
            'name' => [$creating ? 'required' : 'sometimes', 'string', 'max:120'],
            'email' => [
                $creating ? 'required' : 'sometimes', 'email:rfc', 'max:190',
                Rule::unique('users', 'email')->ignore($member?->id),
            ],
            'phone' => [
                'nullable', 'string', 'max:20', 'regex:/^\+?[0-9 \-]{7,20}$/',
                Rule::unique('users', 'phone')->ignore($member?->id),
            ],
            'role' => [$creating ? 'required' : 'sometimes', Rule::in($roles)],
            'is_active' => ['sometimes', 'boolean'],
            'password' => [$creating ? 'required' : 'nullable', 'string', 'min:8', 'max:100'],
        ];
    }
}
