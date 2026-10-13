"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { submitPriceRequestAction } from "@/actions/price-request-actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { COMING_SOON_IMAGE } from "@/lib/placeholders";
import { stepQuantityDown, stepQuantityUp } from "@/lib/utils";

interface PriceRequestProduct {
  id: number;
  slug: string;
  name: string;
  minQuantity: number;
  maxQuantity: number | null;
  imageUrl: string | null;
  categoryName: string | null;
}

const inputClasses =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200";

/**
 * The price request itself. Asking for a price needs a signed-in customer,
 * so a visitor who isn't signed in is sent to the login page and brought
 * back here (same product and quantity) to finish.
 */
export function PriceRequestForm({
  product,
  initialQuantity,
}: {
  product: PriceRequestProduct;
  initialQuantity: number;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(initialQuantity);
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  const here = `/ask-price?product=${encodeURIComponent(product.slug)}&qty=${quantity}`;

  // Not signed in: go and sign in, then come straight back here.
  useEffect(() => {
    if (user === null) {
      router.replace(`/login?next=${encodeURIComponent(here)}` as Route);
    }
    // `here` changes with the quantity; the redirect only matters once, when the session check finishes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = new FormData(e.currentTarget);
    const result = await submitPriceRequestAction({
      product_id: product.id,
      quantity,
      email: String(form.get("email") ?? "").trim() || undefined,
      notes: String(form.get("notes") ?? "").trim() || undefined,
    });

    if (result.needsLogin) {
      router.replace(`/login?next=${encodeURIComponent(here)}` as Route);
      return;
    }

    if (!result.ok) {
      setStatus("idle");
      setError(result.error ?? "We couldn't send that — please try again.");
      return;
    }

    setStatus("success");
  }

  if (user === undefined || user === null) {
    return (
      <p className="mx-auto max-w-xl py-16 text-center text-sm text-ink-500">
        {user === null ? "Taking you to sign in…" : "Loading…"}
      </p>
    );
  }

  if (status === "success") {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-brand-200 bg-brand-50 p-8 text-center">
        <p className="font-display text-xl font-bold text-ink-900">Thanks — we&apos;ve got your request!</p>
        <p className="mt-2 text-sm text-ink-700">
          We&apos;ll contact you{user.phone ? ` on ${user.phone}` : ""} with the price for {quantity} × {product.name}.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/products">Keep browsing</ButtonLink>
          <ButtonLink href="/" variant="outline">
            Back to home
          </ButtonLink>
        </div>
      </div>
    );
  }

  const canDecrease = quantity > product.minQuantity;
  const canIncrease = product.maxQuantity === null || quantity < product.maxQuantity;

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Ask for price</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink-900">Get the price for this product</h1>

      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-ink-100 bg-white p-4 shadow-[var(--shadow-card)]">
        <div className="relative h-20 w-20 flex-none overflow-hidden rounded-xl bg-paper-muted">
          <Image src={product.imageUrl ?? COMING_SOON_IMAGE} alt="" fill sizes="80px" className="object-cover" />
        </div>
        <div className="min-w-0">
          {product.categoryName ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{product.categoryName}</p>
          ) : null}
          <p className="truncate font-display text-lg font-bold text-ink-900">{product.name}</p>
          <Link href={`/products` as Route} className="text-xs text-ink-500 hover:underline">
            Choose a different product
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <p className="text-sm font-medium text-ink-700">Quantity</p>
          <div className="mt-1.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQuantity((q) => stepQuantityDown(q, product.minQuantity))}
              disabled={!canDecrease}
              aria-label="Decrease quantity"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-700 transition-colors hover:bg-ink-50 disabled:opacity-30"
            >
              −
            </button>
            <span className="min-w-14 text-center font-display text-lg font-bold text-ink-900">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => stepQuantityUp(q, product.minQuantity, product.maxQuantity))}
              disabled={!canIncrease}
              aria-label="Increase quantity"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-700 transition-colors hover:bg-ink-50 disabled:opacity-30"
            >
              +
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-paper-muted p-4 text-sm text-ink-700">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Your details</p>
          <p className="mt-1 font-semibold text-ink-900">{user.name}</p>
          {user.phone ? <p>{user.phone}</p> : null}
          <p className="mt-1 text-xs text-ink-500">We&apos;ll contact you on this number with the price.</p>
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-700">
            Email <span className="text-ink-400">(optional)</span>
          </label>
          <input id="email" name="email" type="email" autoComplete="email" className={inputClasses} />
        </div>

        <div>
          <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-ink-700">
            Anything we should know? <span className="text-ink-400">(optional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            maxLength={1000}
            placeholder="Size, paper, finish, deadline…"
            className={inputClasses}
          />
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <Button type="submit" size="lg" disabled={status === "submitting"} className="w-full sm:w-auto">
          {status === "submitting" ? "Sending…" : "Send price request"}
        </Button>
      </form>
    </div>
  );
}
