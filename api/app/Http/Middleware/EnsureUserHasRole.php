<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Route middleware: `->middleware('role:admin')` or `->middleware('role:admin,staff')`.
 *
 * Replaces the old app's AdminMiddleware, which called `auth()->Auth::check()` —
 * not valid PHP against a guard instance, so the check never actually ran.
 */
class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role?->value, $roles, true)) {
            abort(403, 'You do not have permission to perform this action.');
        }

        return $next($request);
    }
}
