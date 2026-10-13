<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Team\RoleRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Admin only (permission:users): the list of roles, what each may do, and
 * creating your own. Edits apply at once — permissions are read from here on
 * every request, nobody has to sign in again.
 */
class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::query()->orderByDesc('is_system')->orderBy('id')->get();

        $counts = User::query()
            ->selectRaw('role, count(*) as total')
            ->groupBy('role')
            ->pluck('total', 'role');

        $roles->each(fn (Role $role) => $role->setAttribute('users_count', (int) ($counts[$role->key] ?? 0)));

        return response()->json(['status' => 'success', 'data' => $roles]);
    }

    public function show(Role $role)
    {
        return response()->json(['status' => 'success', 'data' => $role]);
    }

    public function store(RoleRequest $request)
    {
        $role = new Role($request->safe()->only(['name', 'description', 'permissions']));
        $role->key = $this->uniqueKey($request->string('name')->toString());
        $role->is_system = false;
        $role->save();

        return response()->json(['status' => 'success', 'data' => $role], 201);
    }

    public function update(RoleRequest $request, Role $role)
    {
        if ($role->isAdmin()) {
            throw ValidationException::withMessages([
                'name' => 'The Admin role always has full access and can\'t be edited.',
            ]);
        }

        $role->update($request->safe()->only(['name', 'description', 'permissions']));

        return response()->json(['status' => 'success', 'data' => $role->fresh()]);
    }

    public function destroy(Role $role)
    {
        if ($role->is_system) {
            throw ValidationException::withMessages(['name' => "Built-in roles can't be deleted."]);
        }

        $people = User::where('role', $role->key)->count();
        if ($people > 0) {
            throw ValidationException::withMessages([
                'name' => "{$people} ".Str::plural('person', $people).' still '.($people === 1 ? 'has' : 'have').' this role — give them another role first.',
            ]);
        }

        $role->delete();

        return response()->json(['status' => 'success', 'message' => 'Role deleted.']);
    }

    /** A short, URL-safe key from the name ("Front desk" -> "front_desk"), unique and never "customer". */
    private function uniqueKey(string $name): string
    {
        $base = Str::slug($name, '_') ?: 'role';
        $key = $base === 'customer' ? 'customer_role' : $base;

        for ($n = 2; Role::where('key', $key)->exists(); $n++) {
            $key = "{$base}_{$n}";
        }

        return $key;
    }
}
