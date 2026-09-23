"use client";
// REVERT-TEST-1790146991

import { useEffect, useState } from "react";
import type { Route } from "next";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { evenCapped, formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/api/types";

const AUTO_ADVANCE_MS = 6000;
const MAX_SLIDES = 4;

/**
 * Homepage hero. Admin marks up to 4 trending products as "homepage
 * featured" (a one-click toggle on the products list — no separate slider
 * to manage), and those become an auto-rotating carousel here: each slide
 * is one product's image with its name/price and a "Get more details"
 * button straight to that product's page.
 *
 * The storefront never shows a lopsided 1- or 3-slide carousel: `products`
 * comes in pre-capped/evened by the homepage (see evenCapped in lib/utils),
 * but filtering out any without an image could still leave an odd count
 * here, so it's re-evened after that filter too (0, 2, or 4 — never 1 or
 * 3). A 0-slide result falls back to the original static hero.
 */
export function Hero({ products }: { products: Product[] }) {
  const items = evenCapped(
    products.filter((p) => p.thumbnail_url || p.header_image_url),
    MAX_SLIDES,
  );

  if (items.length === 0) {
    return <StaticHero />;
  }

  return <HeroCarousel products={items} />;
}

function slideImage(product: Product): string | null {
  return product.header_image_url ?? product.thumbnail_url ?? product.images?.[0]?.url ?? null;
}

function slideHref(product: Product): Route {
  const categorySlug = product.category?.slug ?? "products";
  return `/products/${categorySlug}/${product.slug}` as Route;
}

function HeroCarousel({ products }: { products: Product[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || products.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % products.length), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [paused, products.length]);

  function goTo(i: number) {
    setIndex(((i % products.length) + products.length) % products.length);
  }

  return (
    <section
      className="relative min-h-[520px] overflow-hidden bg-accent-900 sm:min-h-[600px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {products.map((product, i) => {
        const image = slideImage(product);
        return (
          <div
            key={product.id}
            aria-hidden={i !== index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {image ? (
              <Image src={image} alt="" fill priority={i === 0} sizes="100vw" className="object-cover" unoptimized />
            ) : null}
            <div className="absolute inset-0 bg-linear-to-r from-accent-900 via-accent-900/80 to-accent-900/30" />

            <Container className="relative flex h-full min-h-[520px] flex-col items-start justify-center gap-5 py-20 sm:min-h-[600px] sm:py-28">
              {product.category ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-200 ring-1 ring-white/15 backdrop-blur-sm">
                  {product.category.name}
                </span>
              ) : null}
              <h1 className="max-w-2xl text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
                {product.name}
              </h1>
              <p className="max-w-xl text-base text-accent-100/90 sm:text-lg">
                Starting at {formatPrice(product.base_price)}
              </p>
              <ButtonLink href={slideHref(product)} size="lg" className="shadow-lg shadow-brand-900/40">
                Get more details
              </ButtonLink>
            </Container>
          </div>
        );
      })}

      {products.length > 1 ? (
        <>
          <div className="absolute inset-x-0 bottom-5 z-10 flex justify-center gap-2">
            {products.map((product, i) => (
              <button
                key={product.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => goTo(index - 1)}
            className="absolute left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:flex"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => goTo(index + 1)}
            className="absolute right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:flex"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      ) : null}
    </section>
  );
}

/** Original static hero — shown until the admin marks at least 2 products as homepage featured. */
function StaticHero() {
  const badges = [
    { label: "500+ businesses served" },
    { label: "Free design templates" },
    { label: "Pan-India delivery" },
  ];

  return (
    <section className="relative overflow-hidden bg-linear-to-br from-accent-900 via-accent-800 to-brand-900">
      <div aria-hidden className="absolute -top-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-brand-500/30 blur-3xl" />
      <div aria-hidden className="absolute -bottom-40 -left-24 h-[26rem] w-[26rem] rounded-full bg-accent-400/25 blur-3xl" />
      <Image
        src="/brand/logo-mark.png"
        alt=""
        aria-hidden
        width={520}
        height={520}
        className="pointer-events-none absolute -right-24 top-1/2 hidden -translate-y-1/2 opacity-[0.08] lg:block"
        unoptimized
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <Container className="relative flex flex-col items-start gap-6 py-20 sm:py-28 lg:py-32">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-200 ring-1 ring-white/15 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
          Custom printing, made simple
        </span>
        <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
          Print anything. Design everything.
        </h1>
        <p className="max-w-xl text-base text-accent-100/90 sm:text-lg">
          Business cards, packaging, signage and marketing materials — designed online and delivered to your door.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <ButtonLink href={"/products" as Route} size="lg" className="shadow-lg shadow-brand-900/40">
            Start designing
          </ButtonLink>
          <ButtonLink
            href="/services"
            variant="outline"
            size="lg"
            className="border-white/30 text-white hover:bg-white/10"
          >
            Explore services
          </ButtonLink>
        </div>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-6">
          {badges.map((badge) => (
            <span key={badge.label} className="flex items-center gap-2 text-sm font-medium text-white/80">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-brand-400">
                <path
                  d="M4 12.5l5 5L20 7"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {badge.label}
            </span>
          ))}
        </div>
      </Container>
    </section>
  );
}
