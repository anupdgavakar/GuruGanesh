"use server";

import { authApiFetch, AuthApiError } from "@/lib/api/auth-server-client";
import type { Order, OrderPayload } from "@/lib/api/types";

// Checkout now requires a logged-in customer, and the Bearer token lives in
// an httpOnly cookie the browser can't read — so, unlike the old
// resources.ts#submitOrder (a plain client-side fetch straight to the API,
// which worked back when checkout was guest-only), this runs the request
// through a Server Action using authApiFetch, exactly like auth-actions.ts,
// so the token gets attached server-side. AuthApiError is caught HERE and
// turned into a plain object — it doesn't survive back to the Client
// Component as a real class instance (same lesson as auth-actions.ts).

export interface SubmitOrderResult {
  data?: Order;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function submitOrderAction(payload: OrderPayload): Promise<SubmitOrderResult> {
  try {
    const res = await authApiFetch<{ status: string; message: string; data: Order }>("/api/orders", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    });
    return { data: res.data };
  } catch (err) {
    if (err instanceof AuthApiError) {
      if (err.status === 401) {
        return { error: "Please log in again to place your order." };
      }
      // A 5xx is a raw, unbounded server exception message (see the same
      // guard in auth-actions.ts) — never forward it as-is.
      if (err.status >= 500) {
        return { error: "Something went wrong on our end. Please try again in a moment." };
      }
      return { error: err.message, fieldErrors: err.errors };
    }
    return { error: "Could not reach the server. Please try again." };
  }
}
