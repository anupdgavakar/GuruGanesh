/**
 * The Sanctum bearer token lives ONLY in an httpOnly cookie, set and read
 * exclusively from server-side code (Server Actions, Route Handlers, Server
 * Components via `cookies()`) — client-side JS never touches it, which is
 * the whole point of doing auth this way instead of storing the token in
 * localStorage/a readable cookie.
 */

export const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "gg_admin_token";

/** Shared cookie options for setting/clearing the session cookie. */
export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
