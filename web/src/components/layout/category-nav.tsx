"use client";

import type { Route } from "next";
import Image from "next/image";
import { COMING_SOON_IMAGE } from "@/lib/placeholders";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ProductCategory } from "@/lib/api/types";

/**
 * Secondary nav bar under the header — one quick-link tab per top-level
 * category plus an "All categories" trigger. Both open a full-width
 * dropdown on hover, but they show different things: "All categories" is a
 * Printo-style mega menu (every category, one column each, subcategories
 * listed underneath); a single category tab is a Vistaprint-style flyout —
 * just that category's own subcategories, each as an image + name card, so
 * a shopper can jump straight to e.g. "Self Inking Stamps" without opening
 * the full mega menu first.
 *
 * Only one of the two panels is ever open at once (they share the same
 * dropdown surface below the bar), tracked by `active`: "all" for the mega
 * menu, a category id for a single category's flyout, or null when closed.
 * Desktop only; the mobile equivalent lives inline in the SiteHeader
 * slide-down menu, since it needs no hover/positioning logic.
 */
export function CategoryNav({ categories }: { categories: ProductCategory[] }) {
  const [active, setActive] = useState<"all" | number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onClickAway(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setActive(null);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setActive(null);
    }
    if (active !== null) {
      document.addEventListener("mousedown", onClickAway);
      document.addEventListener("keydown", onKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", onClickAway);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [active]);

  if (categories.length === 0) return null;

  function openNow(key: "all" | number) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActive(key);
  }

  function closeSoon() {
    closeTimer.current = setTimeout(() => setActive(null), 150);
  }

  function close() {
    setActive(null);
  }

  const activeCategory = typeof active === "number" ? categories.find((c) => c.id === active) : undefined;

  // The quick-link row only shows the categories the admin ticked "Show in the
  // header menu bar" for (Admin > Categories), in their menu order — capped at
  // 7 so the bar always fits on one line instead of scrolling sideways. If
  // nothing has been ticked yet, fall back to the first 6 so it is never empty.
  // Every category is still reachable through "All categories".
  const flagged = categories.filter((c) => c.show_in_menu);
  const barCategories = (flagged.length > 0 ? flagged : categories).slice(0, flagged.length > 0 ? 7 : 6);

  return (
    <div ref={rootRef} className="relative hidden border-t border-ink-100 bg-paper-muted/60 md:block" onMouseLeave={closeSoon}>
      <div className="mx-auto flex max-w-7xl items-center gap-7 px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setActive((v) => (v === "all" ? null : "all"))}
          onMouseEnter={() => openNow("all")}
          aria-expanded={active === "all"}
          aria-haspopup="true"
          className="flex shrink-0 items-center gap-1.5 py-3 text-sm font-semibold text-ink-900 transition-colors hover:text-brand-600"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          All categories
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className={`transition-transform ${active === "all" ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="hidden min-w-0 flex-1 items-center gap-6 overflow-hidden lg:flex">
          {barCategories.map((category) => (
            <Link
              key={category.id}
              href={`/products/${category.slug}` as Route}
              onMouseEnter={() => openNow(category.id)}
              aria-expanded={active === category.id}
              aria-haspopup="true"
              className="whitespace-nowrap py-3 text-sm font-medium text-ink-600 transition-colors hover:text-brand-600"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      {active === "all" ? (
        <div className="absolute inset-x-0 top-full z-50 max-h-[calc(100vh-14rem)] overflow-y-auto overscroll-contain border-t border-ink-100 bg-white shadow-xl" onMouseEnter={() => openNow("all")}>
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-8 sm:grid-cols-3 lg:grid-cols-6 lg:px-8">
            {categories.map((category) => (
              <div key={category.id}>
                <Link
                  href={`/products/${category.slug}` as Route}
                  onClick={close}
                  className="text-sm font-bold uppercase tracking-wide text-ink-900 hover:text-brand-600"
                >
                  {category.name}
                </Link>
                <ul className="mt-3 flex flex-col gap-2">
                  {(category.subcategories ?? []).map((sub) => (
                    <li key={sub.id}>
                      <Link
                        href={`/products/${category.slug}?subcategory=${sub.slug}` as Route}
                        onClick={close}
                        className="text-sm text-ink-600 hover:text-brand-600"
                      >
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/products/${category.slug}` as Route}
                  onClick={close}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
                >
                  View all
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>

          <div className="border-t border-ink-100 bg-paper-muted/60">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-8">
              <p className="text-sm text-ink-600">
                Not sure where to start? Tell us what you need and we&apos;ll help you pick the right product.
              </p>
              <Link
                href="/contact"
                onClick={close}
                className="rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
              >
                Talk to us
              </Link>
            </div>
          </div>
        </div>
      ) : activeCategory ? (
        <div
          className="absolute inset-x-0 top-full z-50 max-h-[calc(100vh-14rem)] overflow-y-auto overscroll-contain border-t border-ink-100 bg-white shadow-xl"
          onMouseEnter={() => openNow(activeCategory.id)}
        >
          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
            {(activeCategory.subcategories ?? []).length > 0 ? (
              <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                {(activeCategory.subcategories ?? []).map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/products/${activeCategory.slug}?subcategory=${sub.slug}` as Route}
                    onClick={close}
                    className="group flex flex-col items-center gap-2 text-center"
                  >
                    <div className="relative h-40 w-40 overflow-hidden rounded-xl bg-paper-muted ring-1 ring-ink-100 transition-shadow group-hover:shadow-md">
                      <Image
                        src={sub.image_url ?? COMING_SOON_IMAGE}
                        alt=""
                        fill
                        sizes="160px"
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs font-medium text-ink-700 group-hover:text-brand-600">{sub.name}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-500">No subcategories yet.</p>
            )}

            <Link
              href={`/products/${activeCategory.slug}` as Route}
              onClick={close}
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"
            >
              View all {activeCategory.name}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
