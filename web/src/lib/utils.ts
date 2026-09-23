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
