"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart/cart-context";
import { formatPrice } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";

export function CartButton() {
  const { items, count, subtotal, updateQuantity, removeItem } = useCart();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickAway(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-ink-100 hover:text-brand-600"
      >
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="20" r="1.4" />
          <circle cx="18" cy="20" r="1.4" />
          <path d="M2.5 3h2.5l2.5 12.5h10.5l2-9H6.5" />
        </svg>
        {count > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-ink-100 bg-white p-4 shadow-xl">
          {items.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-ink-500">Your cart is empty.</p>
              <Link
                href="/products"
                onClick={() => setOpen(false)}
                className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:underline"
              >
                Browse products
              </Link>
            </div>
          ) : (
            <>
              <p className="mb-3 text-sm font-semibold text-ink-900">
                Your cart ({count} item{count === 1 ? "" : "s"})
              </p>
              <ul className="flex max-h-72 flex-col gap-3 overflow-y-auto">
                {items.map((item) => (
                  <li key={item.productId} className="flex gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-paper-muted">
                      {item.thumbnailUrl ? (
                        <Image src={item.thumbnailUrl} alt="" fill sizes="56px" className="object-cover" unoptimized />
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-1 text-sm font-medium text-ink-900">{item.name}</p>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          aria-label={`Remove ${item.name}`}
                          className="shrink-0 text-ink-300 hover:text-danger"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= item.minQuantity}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-ink-200 text-ink-600 disabled:opacity-30"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-xs font-semibold text-ink-900">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.maxQuantity !== null && item.quantity >= item.maxQuantity}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-ink-200 text-ink-600 disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-xs font-semibold text-ink-900">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3 text-sm">
                <span className="text-ink-500">Subtotal</span>
                <span className="font-bold text-ink-900">{formatPrice(subtotal)}</span>
              </div>

              <ButtonLink
                href="/cart"
                onClick={() => setOpen(false)}
                className="mt-3 w-full justify-center"
              >
                View cart &amp; checkout
              </ButtonLink>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
