"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { formatPriceOrQuote, formatSubtotal, stepQuantityDown, stepQuantityUp } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { DesignPicker } from "@/components/cart/design-picker";

export function CartPage({ designSubmissionEmail }: { designSubmissionEmail: string }) {
  const { items, count, subtotal, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <Container className="flex flex-col items-center gap-4 py-20 text-center sm:py-28">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ink-50 text-ink-300">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="20" r="1.4" />
            <circle cx="18" cy="20" r="1.4" />
            <path d="M2.5 3h2.5l2.5 12.5h10.5l2-9H6.5" />
          </svg>
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">Your cart is empty</h1>
        <p className="max-w-sm text-ink-500">
          Browse the catalog and add a few products — your cart is saved on this device.
        </p>
        <ButtonLink href="/products" size="lg" className="mt-2">
          Browse products
        </ButtonLink>
      </Container>
    );
  }

  return (
    <Container className="py-16 sm:py-24">
      <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">Your cart</h1>
      <p className="mt-2 text-ink-500">
        {count} item{count === 1 ? "" : "s"} — review quantities before checking out.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <li
              key={item.productId}
              className="flex gap-4 rounded-2xl border border-ink-100 bg-white p-4 shadow-[var(--shadow-card)]"
            >
              <Link
                href={`/products/${item.categorySlug}/${item.slug}`}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-paper-muted sm:h-24 sm:w-24"
              >
                {item.thumbnailUrl ? (
                  <Image src={item.thumbnailUrl} alt="" fill sizes="96px" className="object-cover" />
                ) : null}
              </Link>

              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/products/${item.categorySlug}/${item.slug}`}
                    className="font-semibold text-ink-900 hover:text-brand-700"
                  >
                    {item.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="shrink-0 text-sm text-ink-400 hover:text-danger"
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, stepQuantityDown(item.quantity, item.minQuantity))}
                      disabled={item.quantity <= item.minQuantity}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-200 text-ink-700 disabled:opacity-30"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold text-ink-900">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, stepQuantityUp(item.quantity, item.minQuantity, item.maxQuantity))}
                      disabled={item.maxQuantity !== null && item.quantity >= item.maxQuantity}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-200 text-ink-700 disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                  <p className="font-bold text-ink-900">{formatPriceOrQuote(item.unitPrice, item.quantity)}</p>
                </div>
                <DesignPicker item={item} designEmail={designSubmissionEmail} />
              </div>
            </li>
          ))}
        </ul>

        <div className="h-fit rounded-2xl border border-ink-100 bg-paper-muted p-6">
          <h2 className="font-display text-lg font-bold text-ink-900">Order summary</h2>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-ink-500">Subtotal</span>
            <span className="font-semibold text-ink-900">{formatSubtotal(subtotal)}</span>
          </div>
          <p className="mt-2 text-xs text-ink-500">
            Final pricing and delivery are confirmed by our team after checkout — no online payment is taken now.
          </p>
          <ButtonLink href="/checkout" size="lg" className="mt-5 w-full justify-center">
            Proceed to checkout
          </ButtonLink>
          <ButtonLink href="/products" variant="outline" size="md" className="mt-2.5 w-full justify-center">
            Continue shopping
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}
