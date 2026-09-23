import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

/**
 * Coarse route guard: redirects to /login when the session cookie is
 * missing. This only checks presence, not validity — Proxy runs on every
 * request and shouldn't make a network call to the API just to render a
 * page. The real check (is the token still valid, does this user's role
 * actually allow admin access) happens in (dashboard)/layout.tsx via
 * getCurrentUser(), which redirects to /login itself if that fails.
 *
 * Named `proxy`, not `middleware` — Next.js 16 renamed the file convention
 * (middleware.ts is deprecated); see node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (!hasSession && !isLoginPage) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Everything except Next internals and static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
