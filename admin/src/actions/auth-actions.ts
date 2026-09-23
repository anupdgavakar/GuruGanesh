"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginRequest, logoutRequest } from "@/lib/api/auth";
import { AdminApiError } from "@/lib/api/client";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

export interface LoginFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function loginAction(_prevState: LoginFormState, formData: FormData): Promise<LoginFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  try {
    const res = await loginRequest(email, password);

    if (res.user.role === "customer") {
      // A customer account can still authenticate (it's the same /auth/login
      // endpoint the storefront would use) — it just has no business here.
      // Don't set the session cookie for it.
      return { error: "This account does not have access to the admin panel." };
    }

    const store = await cookies();
    store.set(SESSION_COOKIE, res.token, sessionCookieOptions);
  } catch (err) {
    if (err instanceof AdminApiError) {
      return { error: err.message, fieldErrors: err.errors };
    }
    // TEMP DIAGNOSTIC — the generic message below was swallowing the real
    // cause with no server-side log at all. Remove this console.error once
    // the "Could not reach the API" issue is root-caused (or keep it; an
    // unexpected non-AdminApiError failure is worth logging either way).
    console.error("loginAction: unexpected error reaching the API:", err);
    return { error: "Could not reach the API. Is it running?" };
  }

  redirect("/");
}

export async function logoutAction(): Promise<void> {
  try {
    await logoutRequest();
  } catch {
    // Revoking the token server-side failed (already expired/revoked, or
    // the API is down) — still clear the local cookie so the browser isn't
    // stuck "logged in" with a token that no longer works either way.
  }

  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
