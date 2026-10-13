<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Team\TeamMemberRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * Admin only (permission:users): create the people who work in the admin
 * panel and decide what each may do by giving them a role. Customers are
 * never listed or edited here.
 */
class TeamMemberController extends Controller
{
    public function index()
    {
        $people = User::query()
            ->where('role', '!=', UserRole::Customer->value)
            ->withCount([
                'assignedInquiries as inquiries_count',
                'assignedOrders as orders_count',
            ])
            ->orderByDesc('is_active')
            ->orderBy('name')
            ->get();

        return response()->json(['status' => 'success', 'data' => $people]);
    }

    public function show(User $user)
    {
        $this->ensureTeamMember($user);

        return response()->json(['status' => 'success', 'data' => $user]);
    }

    public function store(TeamMemberRequest $request)
    {
        $data = $request->validated();

        $user = new User(collect($data)->only(['name', 'email', 'phone', 'password'])->all());
        // 'role' isn't mass assignable on purpose — set here, from a value
        // the request has already checked against the allowed roles.
        $user->role = $data['role'];
        $user->is_active = true;
        $user->email_verified_at = now();
        $user->save();

        return response()->json(['status' => 'success', 'data' => $user], 201);
    }

    public function update(TeamMemberRequest $request, User $user)
    {
        $this->ensureTeamMember($user);

        $data = $request->validated();
        $me = $request->user();

        $newRole = $data['role'] ?? $user->role;
        $newActive = $data['is_active'] ?? $user->is_active;
        $losesAdmin = $user->isAdmin() && ($newRole !== UserRole::Admin->value || ! $newActive);

        if ($user->is($me) && ($newRole !== $user->role || ! $newActive)) {
            throw ValidationException::withMessages([
                'role' => "You can't change your own role or switch yourself off — ask another admin.",
            ]);
        }

        if ($losesAdmin && $this->activeAdmins() <= 1) {
            throw ValidationException::withMessages([
                'role' => 'There must always be at least one active admin.',
            ]);
        }

        $roleChanged = $newRole !== $user->role;

        $user->fill(collect($data)->only(['name', 'email', 'phone'])->all());
        $user->role = $newRole;
        $user->is_active = $newActive;

        $passwordChanged = ! empty($data['password']);
        if ($passwordChanged) {
            $user->password = $data['password'];
        }

        $user->save();

        // A switched-off account, a new password or a new role must take
        // effect now, not whenever the old token happens to expire.
        if (! $newActive || $passwordChanged || $roleChanged) {
            $user->tokens()->delete();
        }

        return response()->json(['status' => 'success', 'data' => $user->fresh()]);
    }

    public function destroy(Request $request, User $user)
    {
        $this->ensureTeamMember($user);

        if ($user->is($request->user())) {
            throw ValidationException::withMessages(['role' => "You can't delete your own account."]);
        }

        if ($user->isAdmin() && $user->is_active && $this->activeAdmins() <= 1) {
            throw ValidationException::withMessages(['role' => 'There must always be at least one active admin.']);
        }

        // Their name stays on the history of everything they handled (the
        // timeline keeps its own copy); only the live "handled by" link is cleared.
        $user->tokens()->delete();
        $user->delete();

        return response()->json(['status' => 'success', 'message' => 'Team member deleted.']);
    }

    private function ensureTeamMember(User $user): void
    {
        abort_unless($user->isTeam(), 404);
    }

    private function activeAdmins(): int
    {
        return User::where('role', UserRole::Admin->value)->where('is_active', true)->count();
    }
}
