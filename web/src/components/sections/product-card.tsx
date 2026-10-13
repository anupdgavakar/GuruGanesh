"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart/cart-context";
import { formatPrice, isQuoteOnly } from "@/lib/utils";
import { COMING_SOON_IMAGE } from "@/lib/placeholders";
import type { Product } from "@/lib/api/types";

export function ProductCard({ product }: { product: Product }) {
  const categorySlug = product.category?.slug ?? "products";
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  // No price shown on the site: the card links to the product page, where the customer asks for it.
  const askPrice = isQuoteOnly(product.base_price);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      slug: product.slug,
      categorySlug,
      name: product.name,
      thumbnailUrl: product.thumbnail_url,
      unitPrice: Number(product.base_price),
      minQuantity: product.min_quantity,
      maxQuantity: product.max_quantity,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Link
      href={`/products/${categorySlug}/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-ink-100 bg-white shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-muted">
        <Image
          src={product.thumbnail_url ?? product.header_image_url ?? COMING_SOON_IMAGE}
          alt={product.thumbnail_url || product.header_image_url ? product.name : `${product.name} — picture coming soon`}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.is_featured ? (
          <span className="absolute left-3 top-3 rounded-full bg-linear-to-r from-brand-500 to-brand-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
            Featured
          </span>
        ) : null}
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100"
        />
        {askPrice ? null : (
          <button
            type="button"
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
            className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-600 opacity-100 shadow-md transition-all duration-200 hover:bg-brand-500 hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
          >
            {added ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 12.5l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="9" cy="20" r="1.3" />
                <circle cx="18" cy="20" r="1.3" />
                <path d="M2.5 3h2.5l2.5 12.5h10.5l2-9H6.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 6.5h4M17 4.5v4" strokeLinecap="round" />
              </svg>
            )}
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        {product.category ? (
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{product.category.name}</p>
        ) : null}
        <p className="font-semibold text-ink-900 transition-colors group-hover:text-brand-700">{product.name}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <p className="text-sm font-bold text-ink-900">{askPrice ? "Ask for price" : `From ${formatPrice(product.base_price)}`}</p>
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-50 text-ink-400 transition-colors group-hover:bg-brand-500 group-hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
