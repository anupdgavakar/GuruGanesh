import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

/**
 * Proxies a design file download from the Laravel API, attaching the
 * admin's Sanctum token server-side. A plain <a href> to the Laravel API
 * directly wouldn't work here — the token lives in an httpOnly cookie only
 * readable server-side (see lib/api/client.ts), so the browser has no way
 * to attach it to a direct cross-origin request. Routing the download
 * through this same-origin route handler is what lets a normal link click
 * (not a JS fetch) trigger a real, correctly-named file download.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const res = await fetch(`${API_URL}/api/order-items/${id}/design-file`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok || !res.body) {
    return new Response("Not found", { status: res.status || 404 });
  }

  const headers = new Headers();
  const contentType = res.headers.get("content-type");
  const contentDisposition = res.headers.get("content-disposition");
  const contentLength = res.headers.get("content-length");
  if (contentType) headers.set("content-type", contentType);
  if (contentDisposition) headers.set("content-disposition", contentDisposition);
  if (contentLength) headers.set("content-length", contentLength);

  return new Response(res.body, { status: 200, headers });
}
