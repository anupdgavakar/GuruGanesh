"use client";

import { useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { stepQuantityDown, stepQuantityUp } from "@/lib/utils";
import type { Product } from "@/lib/api/types";

/**
 * Shown instead of "Add to cart" when a product's price is not shown on the
 * site. The customer picks a quantity and sends a price request, which
 * lands in the admin Inquiries inbox.
 */
export function AskPricePanel({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(product.min_quantity);

  const canDecrease = quantity > product.min_quantity;
  const canIncrease = product.max_quantity === null || quantity < product.max_quantity;

  // The request page asks the customer to sign in first, then sends the request from their account.
  const href = `/ask-price?product=${encodeURIComponent(product.slug)}&qty=${quantity}` as Route;

  return (
    <div className="mt-8 rounded-2xl border border-ink-100 bg-paper-muted p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Quantity</p>
      <div className="mt-1.5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setQuantity((q) => stepQuantityDown(q, product.min_quantity))}
          disabled={!canDecrease}
          aria-label="Decrease quantity"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-700 transition-colors hover:bg-ink-50 disabled:opacity-30"
        >
          −
        </button>
        <span className="min-w-14 text-center font-display text-lg font-bold text-ink-900">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((q) => stepQuantityUp(q, product.min_quantity, product.max_quantity))}
          disabled={!canIncrease}
          aria-label="Increase quantity"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-700 transition-colors hover:bg-ink-50 disabled:opacity-30"
        >
          +
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <ButtonLink href={href} size="lg" className="flex-1 sm:flex-none">
          Ask for price
        </ButtonLink>
        <Link
          href="/contact"
          className="inline-flex h-13 items-center justify-center rounded-full border border-ink-300 px-6 text-sm font-semibold text-ink-900 transition-colors hover:bg-ink-100"
        >
          Ask a question
        </Link>
      </div>

      <p className="mt-3 text-xs text-ink-500">
        Sign in with your mobile number, then send your request — we&apos;ll contact you with the price. Nothing is charged online.
      </p>
    </div>
  );
}
