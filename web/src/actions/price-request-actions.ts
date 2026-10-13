"use server";

import { authApiFetch, AuthApiError } from "@/lib/api/auth-server-client";

// Same shape as order-actions.ts: the customer's token is in an httpOnly
// cookie, so the request goes through a Server Action that attaches it.

export interface PriceRequestPayload {
  product_id: number;
  quantity: number;
  email?: string;
  notes?: string;
}

export interface SubmitPriceRequestResult {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  /** True when the session has ended and the customer must sign in again. */
  needsLogin?: boolean;
}

export async function submitPriceRequestAction(payload: PriceRequestPayload): Promise<SubmitPriceRequestResult> {
  try {
    await authApiFetch<{ status: string; message: string }>("/api/price-requests", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthApiError) {
      if (err.status === 401) return { error: "Please sign in again to send your request.", needsLogin: true };
      if (err.status === 403) return { error: "Please sign in with a customer account to ask for a price." };
      if (err.status === 429) return { error: "Too many requests — please wait a minute and try again." };
      if (err.status >= 500) return { error: "Something went wrong on our end. Please try again in a moment." };
      return { error: err.message, fieldErrors: err.errors };
    }
    return { error: "Could not reach the server. Please try again." };
  }
}
