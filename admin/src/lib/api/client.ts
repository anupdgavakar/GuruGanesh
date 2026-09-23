import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/session";

/**
 * Authenticated fetch wrapper around the Laravel API (guru_api), for the
 * admin panel only. Callable ONLY from server-side code (Server Components,
 * Server Actions, Route Handlers) — it reads the Sanctum token out of the
 * httpOnly session cookie via next/headers `cookies()`, which throws outside
 * a request context. The `server-only` import makes accidentally importing
 * this from a Client Component a build error instead of a runtime leak.
 *
 * Unlike web/src/lib/api/client.ts (public, unauthenticated, cached reads),
 * every admin request is always fresh (`cache: "no-store"`) — stale data in
 * an admin panel just means editing something you can't see yet.
 */

const API_URL = process.env.API_URL ?? "http://localhost:8000";

export class AdminApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.errors = errors;
  }
}

interface AdminApiFetchOptions extends Omit<RequestInit, "body"> {
  /** A FormData body is sent as-is (multipart); anything else is JSON-encoded. */
  body?: BodyInit | Record<string, unknown> | null;
}

async function authHeader(): Promise<Record<string, string>> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function adminApiFetch<T>(path: string, options: AdminApiFetchOptions = {}): Promise<T> {
  const { body, headers, ...init } = options;
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const isPlainObject = body !== null && typeof body === "object" && !isFormData;

  const res = await fetch(url, {
    ...init,
    method: init.method ?? "GET",
    headers: {
      Accept: "application/json",
      ...(isPlainObject ? { "Content-Type": "application/json" } : {}),
      ...(await authHeader()),
      ...headers,
    },
    body: isPlainObject ? JSON.stringify(body) : (body as BodyInit | null | undefined),
    cache: "no-store",
  });

  const isJson = res.headers.get("content-type")?.includes("application/json") ?? false;
  const payload = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new AdminApiError(
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
