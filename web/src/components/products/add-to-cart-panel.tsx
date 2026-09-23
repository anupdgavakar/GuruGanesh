"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart/cart-context";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/api/types";

export function AddToCartPanel({ product, categorySlug }: { product: Product; categorySlug: string }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(product.min_quantity);
  const [added, setAdded] = useState(false);

  const unitPrice = Number(product.base_price);
  const canDecrease = quantity > product.min_quantity;
  const canIncrease = product.max_quantity === null || quantity < product.max_quantity;

  function handleAddToCart() {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        categorySlug,
        name: product.name,
        thumbnailUrl: product.thumbnail_url,
        unitPrice,
        minQuantity: product.min_quantity,
        maxQuantity: product.max_quantity,
      },
      quantity,
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="mt-8 rounded-2xl border border-ink-100 bg-paper-muted p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Quantity</p>
          <div className="mt-1.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(product.min_quantity, q - 1))}
              disabled={!canDecrease}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-700 transition-colors hover:bg-ink-50 disabled:opacity-30"
            >
              −
            </button>
            <span className="w-10 text-center font-display text-lg font-bold text-ink-900">{quantity}</span>
            <button
              type="button"
              onClick={() =>
                setQuantity((q) => (product.max_quantity ? Math.min(product.max_quantity, q + 1) : q + 1))
              }
              disabled={!canIncrease}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-700 transition-colors hover:bg-ink-50 disabled:opacity-30"
            >
              +
            </button>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Total</p>
          <p className="mt-1 font-display text-xl font-bold text-ink-900">{formatPrice(unitPrice * quantity)}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button size="lg" onClick={handleAddToCart} className="flex-1 sm:flex-none">
          {added ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 12.5l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Added to cart
            </>
          ) : (
            "Add to cart"
          )}
        </Button>
        <Link
          href="/contact"
          className="inline-flex h-13 items-center justify-center rounded-full border border-ink-300 px-6 text-sm font-semibold text-ink-900 transition-colors hover:bg-ink-100"
        >
          Ask a question
        </Link>
      </div>

      <p className="mt-3 text-xs text-ink-500">
        Add items to your cart and check out with your details — we&apos;ll confirm pricing and follow up to
        collect payment. No online payment is taken at checkout.
      </p>
    </div>
  );
}
