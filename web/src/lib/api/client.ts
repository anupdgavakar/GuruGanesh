/**
 * Thin typed fetch wrapper around the Laravel API (guru_api).
 *
 * Used from Server Components / route handlers, so plain `fetch` with
 * Next's `next: { revalidate }` caching works — no client-side data library
 * needed for the read-only public catalog. Admin/auth flows (Phase 5) will
 * add a client-side variant once Sanctum tokens are wired up.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public path: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiFetchOptions extends RequestInit {
  /** Seconds to cache the response for (Next's data cache). Defaults to 5 minutes. */
  revalidate?: number | false;
}

export async function apiFetch<T>(
  path: string,
  { revalidate = 300, headers, ...init }: ApiFetchOptions = {},
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...headers,
    },
    next: revalidate === false ? undefined : { revalidate },
    cache: revalidate === false ? "no-store" : undefined,
  });

  if (!res.ok) {
    throw new ApiError(`API request to ${path} failed with ${res.status}`, res.status, path);
  }

  return res.json() as Promise<T>;
}

/**
 * Same as apiFetch, but returns `null` instead of throwing. Use this for
 * data that shouldn't take a whole page down if the API is unreachable or
 * still empty (e.g. during local development before `php artisan serve`
 * is running) — pages fall back to placeholder content instead of 500ing.
 */
export async function apiFetchSafe<T>(path: string, options?: ApiFetchOptions): Promise<T | null> {
  try {
    return await apiFetch<T>(path, options);
  } catch {
    return null;
  }
}
