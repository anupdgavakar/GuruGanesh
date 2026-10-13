<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Route middleware: `->middleware('permission:orders')` or
 * `->middleware('permission:orders,inquiries')` (any one of them is enough).
 *
 * What each role may do lives in App\Models\Role (editable on the Team page). An
 * account that has been switched off is refused everywhere.
 */
class EnsureUserHasPermission
{
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isTeam() || $user->is_active === false) {
            abort(403, 'You do not have permission to perform this action.');
        }

        foreach ($permissions as $permission) {
            if ($user->hasPermission($permission)) {
                return $next($request);
            }
        }

        abort(403, 'Your role does not have access to this.');
    }
}
