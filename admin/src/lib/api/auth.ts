import "server-only";

import { adminApiFetch, AdminApiError } from "./client";
import type { AdminUser } from "./types";

interface LoginResponse {
  status: string;
  token: string;
  expires_at: string | null;
  user: AdminUser;
}

export async function loginRequest(email: string, password: string) {
  return adminApiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function logoutRequest() {
  await adminApiFetch("/api/auth/logout", { method: "POST" });
}

/**
 * The current user from the session cookie's token, or null if there's no
 * cookie, the token is invalid/expired, or the API is unreachable. Unlike
 * most endpoints this one returns the user object directly, not wrapped in
 * `{status, data}` — see AuthController::user().
 */
export async function getCurrentUser(): Promise<AdminUser | null> {
  try {
    return await adminApiFetch<AdminUser>("/api/auth/user");
  } catch (err) {
    if (err instanceof AdminApiError) return null;
    return null;
  }
}
