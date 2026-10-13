"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart/cart-context";
import { useAuth } from "@/lib/auth/auth-context";
import { submitOrderAction } from "@/actions/order-actions";
import { formatPrice, formatPriceOrQuote, formatSubtotal } from "@/lib/utils";
import { Button, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

type Status = "idle" | "submitting" | "success" | "error";

const inputClasses =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200";

export function CheckoutForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, count, subtotal, clear } = useCart();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);

  // Checkout requires a logged-in customer — send them to sign in and back.
  useEffect(() => {
    if (user === null) {
      router.replace("/login?next=/checkout");
    }
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = new FormData(e.currentTarget);

    const res = await submitOrderAction({
      customer_name: String(form.get("customer_name") ?? ""),
      customer_email: String(form.get("customer_email") ?? ""),
      customer_phone: String(form.get("customer_phone") ?? ""),
      shipping_address: String(form.get("shipping_address") ?? "") || undefined,
      notes: String(form.get("notes") ?? "") || undefined,
      items: items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
        design_delivery_method: item.designDeliveryMethod,
        design_reference: item.designReference,
        design_original_filename: item.designOriginalFilename,
      })),
      website: String(form.get("website") ?? ""), // honeypot — stays empty for real users
    });

    if (res.error || !res.data) {
      setStatus("error");
      setError(res.error ?? "We couldn't place that order — double-check the form and try again.");
      return;
    }

    setOrderId(res.data.id);
    setStatus("success");
    clear();
  }

  // Not logged in (redirect above is in flight) or still checking session —
  // show nothing worth interacting with rather than a flash of the form.
  if (user === undefined || user === null) {
    return (
      <Container className="flex flex-col items-center gap-3 py-20 text-center sm:py-28">
        <p className="text-ink-500">Just a moment…</p>
      </Container>
    );
  }

  if (status === "success") {
    return (
      <Container className="flex flex-col items-center gap-4 py-20 text-center sm:py-28">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12.5l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">Order received!</h1>
        <p className="max-w-md text-ink-500">
          {orderId ? `Order #${orderId} is` : "Your order is"} in — we&apos;ll confirm the details and follow
          up to collect payment. No online payment was taken.
        </p>
        <ButtonLink href="/products" size="lg" className="mt-2">
          Keep browsing
        </ButtonLink>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container className="flex flex-col items-center gap-4 py-20 text-center sm:py-28">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">Your cart is empty</h1>
        <p className="text-ink-500">Add a few products before checking out.</p>
        <ButtonLink href="/products" size="lg" className="mt-2">
          Browse products
        </ButtonLink>
      </Container>
    );
  }

  return (
    <Container className="py-16 sm:py-24">
      <nav className="mb-6 text-sm text-ink-500">
        <Link href="/cart" className="hover:text-brand-600">
          Cart
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-900">Checkout</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">Checkout</h1>
      <p className="mt-2 text-ink-500">
        Tell us where to reach you — we&apos;ll confirm your order and follow up to collect payment. No online
        payment is taken here.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="customer_name" className="mb-1.5 block text-sm font-medium text-ink-700">
                Full name
              </label>
              <input
                id="customer_name"
                name="customer_name"
                type="text"
                required
                defaultValue={user.name}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="customer_email" className="mb-1.5 block text-sm font-medium text-ink-700">
                Email
              </label>
              <input id="customer_email" name="customer_email" type="email" required className={inputClasses} />
            </div>
          </div>

          <div>
            <label htmlFor="customer_phone" className="mb-1.5 block text-sm font-medium text-ink-700">
              Phone
            </label>
            <input
              id="customer_phone"
              name="customer_phone"
              type="tel"
              required
              defaultValue={user.phone ?? ""}
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="shipping_address" className="mb-1.5 block text-sm font-medium text-ink-700">
              Shipping address <span className="text-ink-400">(optional)</span>
            </label>
            <textarea id="shipping_address" name="shipping_address" rows={3} className={inputClasses} />
          </div>

          <div>
            <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-ink-700">
              Order notes <span className="text-ink-400">(optional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Artwork files, design requests, delivery timing…"
              className={inputClasses}
            />
          </div>

          {/* Honeypot — hidden from sighted users, off the tab order; bots that fill every field trip it. */}
          <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          {error ? <p className="break-words text-sm text-danger">{error}</p> : null}

          <Button type="submit" size="lg" disabled={status === "submitting"} className="w-full sm:w-auto">
            {status === "submitting" ? "Placing order…" : subtotal > 0 ? `Place order — ${formatPrice(subtotal)}` : "Send order request"}
          </Button>
        </form>

        <div className="h-fit rounded-2xl border border-ink-100 bg-paper-muted p-6">
          <h2 className="font-display text-lg font-bold text-ink-900">
            {count} item{count === 1 ? "" : "s"}
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white">
                  {item.thumbnailUrl ? (
                    <Image src={item.thumbnailUrl} alt="" fill sizes="56px" className="object-cover" />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col">
                  <p className="line-clamp-1 text-sm font-medium text-ink-900">{item.name}</p>
                  <p className="text-xs text-ink-500">Qty {item.quantity}</p>
                  {item.designDeliveryMethod ? (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-brand-700">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
                        <path d="M4 12.5l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Design attached
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs text-ink-400">No design file yet</p>
                  )}
                </div>
                <p className="text-sm font-semibold text-ink-900">{formatPriceOrQuote(item.unitPrice, item.quantity)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-ink-200 pt-3 text-sm">
            <span className="text-ink-500">Subtotal</span>
            <span className="font-bold text-ink-900">{formatSubtotal(subtotal)}</span>
          </div>
        </div>
      </div>
    </Container>
  );
}
