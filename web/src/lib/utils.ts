import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges conditional class names and resolves Tailwind class conflicts
 * (e.g. `cn("px-2", condition && "px-4")` keeps only `px-4`).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * A page title without the site name on the end. The layout adds " | GuruGanesh Graphics"
 * to every title, and some saved SEO titles already end with it, which showed it twice.
 */
export function pageTitle(title: string) {
  return title.replace(/\s*[|\-–—]\s*Guru\s?Ganesh Graphics\s*$/i, "").trim() || title;
}

/** True when a product has no price set (0 or empty) — it is sold on a quote basis. */
export function isQuoteOnly(amount: number | string | null | undefined) {
  return !(Number(amount) > 0);
}

/** A line price, or "Price on request" for products that have no price yet. */
export function formatPriceOrQuote(unitPrice: number | string, quantity = 1) {
  return isQuoteOnly(unitPrice) ? "Price on request" : formatPrice(Number(unitPrice) * quantity);
}

/** A cart/order subtotal, or "To be confirmed" while every item is still waiting on a quote. */
export function formatSubtotal(subtotal: number) {
  return subtotal > 0 ? formatPrice(subtotal) : "To be confirmed";
}

/**
 * Formats a price for display, e.g. 1999 -> "₹1,999". Accepts the string
 * the API sends for `base_price` (a Laravel `decimal:2` cast serializes as
 * a string, not a number — see lib/api/types.ts) as well as a plain number.
 */
export function formatPrice(amount: number | string, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

/**
 * Caps a list at `max` items, then trims down to the nearest even number.
 * Used for the homepage's "homepage featured" products so the hero slider
 * and the featured-products row never show a lopsided count — always 0, 2,
 * or 4 (given the default max of 4), never 1 or 3.
 */
export function evenCapped<T>(items: T[], max = 4): T[] {
  const capped = items.slice(0, max);
  return capped.slice(0, capped.length - (capped.length % 2));
}

/**
 * How much the + and − buttons change a quantity by. Print jobs are ordered
 * in batches (100 visiting cards, 50 flyers), so a product with a bigger
 * minimum moves in steps of a round number instead of one at a time.
 */
export function quantityStep(minQuantity: number): number {
  if (minQuantity >= 100) return 100;
  if (minQuantity >= 50) return 50;
  if (minQuantity >= 25) return 25;
  if (minQuantity >= 10) return 10;
  return 1;
}

/** Next quantity up: 100 -> 200, 250 -> 300. Never above `max` when there is one. */
export function stepQuantityUp(quantity: number, minQuantity: number, maxQuantity: number | null): number {
  const step = quantityStep(minQuantity);
  const next = (Math.floor(quantity / step) + 1) * step;
  return maxQuantity ? Math.min(next, maxQuantity) : next;
}

/** Next quantity down: 200 -> 100, 250 -> 200. Never below the minimum. */
export function stepQuantityDown(quantity: number, minQuantity: number): number {
  const step = quantityStep(minQuantity);
  const next = (Math.ceil(quantity / step) - 1) * step;
  return Math.max(next, minQuantity);
}
