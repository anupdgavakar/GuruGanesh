import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/session";
import { API_URL } from "./client";

/**
 * A small authenticated fetch wrapper for the customer OTP auth endpoints —
 * separate from the plain `apiFetch` in client.ts (public, cached, used
 * both client- and server-side) because this one reads the session cookie
 * via next/headers `cookies()`, which only works in server-side code and
 * always fetches fresh. Mirrors admin/src/lib/api/client.ts's
 * `adminApiFetch` exactly; only ever imported from "use server" action
 * files (never directly from a Client Component) — see the `server-only`
 * import above.
 */

export class AuthApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
    this.errors = errors;
  }
}

async function authHeader(): Promise<Record<string, string>> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function authApiFetch<T>(
  path: string,
  options: { method?: string; body?: Record<string, unknown> } = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(await authHeader()),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  const isJson = res.headers.get("content-type")?.includes("application/json") ?? false;
  const payload = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new AuthApiError(
      (payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
        ? payload.message
        : null) ?? `Request to ${path} failed with ${res.status}`,
      res.status,
      payload && typeof payload === "object" && "errors" in payload
        ? (payload.errors as Record<string, string[]>)
        : undefined,
    );
  }

  return payload as T;
}
