<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\QueryException;
use Illuminate\Support\Collection;

/**
 * A role an admin-panel user can have: a name and the list of permissions it
 * grants (see App\Enums\UserRole for the permission names). Built-in roles
 * (is_system) cannot be deleted; the admin role can't be edited either, so
 * the owner can never lock themselves out.
 */
class Role extends Model
{
    protected $fillable = ['name', 'description', 'permissions'];

    protected function casts(): array
    {
        return [
            'permissions' => 'array',
            'is_system' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        $forget = fn () => app()->forgetInstance('role.definitions');

        static::saved($forget);
        static::deleted($forget);
    }

    public function isAdmin(): bool
    {
        return $this->key === UserRole::Admin->value;
    }

    /** @return Collection<string, Role> every role keyed by its key — loaded once per request. */
    public static function definitions(): Collection
    {
        if (! app()->bound('role.definitions')) {
            app()->singleton('role.definitions', function () {
                try {
                    return static::query()->get()->keyBy('key');
                } catch (QueryException) {
                    // The roles table doesn't exist yet (code deployed before `php artisan migrate`).
                    // Don't take customers' sign-in down with it — see permissionsFor().
                    return collect();
                }
            });
        }

        return app('role.definitions');
    }

    /** What a person with this role key may do. Customers, and unknown roles, may do nothing. */
    public static function permissionsFor(?string $key): array
    {
        if ($key === null || $key === UserRole::Customer->value) {
            return [];
        }

        $role = static::definitions()->get($key);

        // Until the roles are in the database, the admin keeps full access so nobody is locked out.
        if ($role === null && $key === UserRole::Admin->value) {
            return UserRole::all();
        }

        return $role?->permissions ?? [];
    }

    public static function nameFor(?string $key): ?string
    {
        if ($key === null) {
            return null;
        }

        return static::definitions()->get($key)?->name ?? ucfirst($key);
    }
}
