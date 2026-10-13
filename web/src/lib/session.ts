/**
 * The customer's Sanctum bearer token lives ONLY in an httpOnly cookie, set
 * and read exclusively from server-side code (Server Actions via
 * `cookies()`) — client-side JS never touches it. Same pattern as the admin
 * panel's lib/session.ts, with its own cookie name so the two apps never
 * collide if they're ever served from the same domain.
 */

export const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "gg_customer_token";

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
