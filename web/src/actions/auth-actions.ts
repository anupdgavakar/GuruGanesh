"use server";

import { cookies } from "next/headers";
import { authApiFetch, AuthApiError } from "@/lib/api/auth-server-client";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";
import type { CustomerUser } from "@/lib/api/types";

// AuthApiError never survives back to a Client Component as a real class
// instance (Next.js re-wraps thrown errors across the server-action
// boundary), so — same pattern as admin/src/actions/resource-actions.ts —
// it's caught HERE and turned into a plain object the client can read.

// A 4xx here is Laravel validation/rate-limit text — short and meant to be
// read by the customer, so it's safe to show as-is. A 5xx is an unhandled
// server exception; in local/debug mode that message is the raw PHP/SQL
// error (e.g. "SQLSTATE[HY000]... database.sqlite, SQL: update ..."), which
// both leaks internal details and, being one long unbroken string, can blow
// out the width of the OTP card on a narrow screen. Collapse those to a
// generic message instead of forwarding them.
function safeErrorMessage(err: AuthApiError): string {
  if (err.status >= 500) return "Something went wrong on our end. Please try again in a moment.";
  return err.message;
}

export interface OtpRequestResult {
  message?: string;
  test_mode?: boolean;
  debug_code?: string | null;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function requestOtpAction(phone: string, name?: string): Promise<OtpRequestResult> {
  try {
    return await authApiFetch<{ message: string; test_mode: boolean; debug_code: string | null }>(
      "/api/auth/otp/request",
      { method: "POST", body: { phone, name } },
    );
  } catch (err) {
    if (err instanceof AuthApiError) return { error: safeErrorMessage(err), fieldErrors: err.errors };
    return { error: "Could not reach the server. Please try again." };
  }
}

export interface OtpVerifyResult {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

interface TokenResponse {
  token: string;
  expires_at: string | null;
  user: CustomerUser;
}

async function completeLogin(res: TokenResponse): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, res.token, sessionCookieOptions);
}

export async function verifyOtpAction(phone: string, code: string, name?: string): Promise<OtpVerifyResult> {
  try {
    const res = await authApiFetch<TokenResponse>("/api/auth/otp/verify", {
      method: "POST",
      body: { phone, code, name },
    });
    await completeLogin(res);
    return {};
  } catch (err) {
    if (err instanceof AuthApiError) return { error: safeErrorMessage(err), fieldErrors: err.errors };
    return { error: "Could not reach the server. Please try again." };
  }
}

/** The test-mode "register without an OTP" bypass — see SkipOtpRequest on the API. */
export async function skipOtpAction(phone: string, name?: string): Promise<OtpVerifyResult> {
  try {
    const res = await authApiFetch<TokenResponse>("/api/auth/otp/skip", {
      method: "POST",
      body: { phone, name },
    });
    await completeLogin(res);
    return {};
  } catch (err) {
    if (err instanceof AuthApiError) return { error: safeErrorMessage(err), fieldErrors: err.errors };
    return { error: "Test-mode sign-in isn't available right now." };
  }
}

export async function logoutAction(): Promise<void> {
  try {
    await authApiFetch("/api/auth/logout", { method: "POST" });
  } catch {
    // Revoking the token server-side failed (already expired, API down) —
    // still clear the local cookie so the browser isn't stuck "logged in"
    // with a token that no longer works either way.
  }
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getCurrentUserAction(): Promise<CustomerUser | null> {
  try {
    return await authApiFetch<CustomerUser>("/api/auth/user");
  } catch {
    return null;
  }
}
