"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ProductCategory } from "@/lib/api/types";

/**
 * Secondary nav bar under the header — one quick-link tab per top-level
 * category plus an "All categories" trigger that opens a Printo-style mega
 * menu (one column per category, subcategories listed underneath). Desktop
 * only; the mobile equivalent lives inline in the SiteHeader slide-down
 * menu, since it needs no hover/positioning logic.
 */
export function CategoryNav({ categories }: { categories: ProductCategory[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onClickAway(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", onClickAway);
      document.addEventListener("keydown", onKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", onClickAway);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (categories.length === 0) return null;

  function openNow() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function closeSoon() {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  function close() {
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative hidden border-t border-ink-100 bg-paper-muted/60 md:block" onMouseLeave={closeSoon}>
      <div className="mx-auto flex max-w-7xl items-center gap-7 px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          onMouseEnter={openNow}
          aria-expanded={open}
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
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="hidden items-center gap-6 overflow-x-auto lg:flex">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products/${category.slug}` as Route}
              className="whitespace-nowrap py-3 text-sm font-medium text-ink-600 transition-colors hover:text-brand-600"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      {open ? (
        <div className="absolute inset-x-0 top-full z-50 border-t border-ink-100 bg-white shadow-xl" onMouseEnter={openNow}>
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
      ) : null}
    </div>
  );
}
