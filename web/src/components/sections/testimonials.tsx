"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Testimonial } from "@/lib/api/types";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/**
 * A horizontally-scrolling carousel of testimonial cards (swipe/scroll,
 * scroll-snap per card) with dot pagination underneath — replaces the old
 * static 2–3 column grid. Each dot's active state and the "scroll to this
 * card" behavior both key off which card is nearest the track's center, so
 * this needs to be a client component (plain CSS scroll-snap alone can't
 * drive the dots).
 */
export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  if (testimonials.length === 0) return null;

  function scrollToCard(i: number) {
    cardRefs.current[i]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  function onScroll() {
    const track = trackRef.current;
    if (!track) return;
    const trackCenter = track.scrollLeft + track.clientWidth / 2;
    let closest = 0;
    let closestDist = Infinity;
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(cardCenter - trackCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setActive(closest);
  }

  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <div
        aria-hidden
        className="absolute -bottom-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-accent-100/40 blur-3xl"
      />

      <div className="relative">
        <Container>
          <SectionHeading align="center" eyebrow="Customers" title="Loved by businesses like yours" />
        </Container>

        <div
          ref={trackRef}
          onScroll={onScroll}
          className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-2 sm:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]"
        >
          {testimonials.map((t, i) => (
            <div
              key={t.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="relative w-[82vw] shrink-0 snap-center rounded-2xl border border-ink-100 bg-white p-6 shadow-[var(--shadow-card)] sm:w-[340px]"
            >
              <div className="flex items-center gap-3">
                {t.avatar_url ? (
                  <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
                    <Image src={t.avatar_url} alt="" fill sizes="44px" className="object-cover" />
                  </span>
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-500 to-accent-600 text-sm font-bold text-white">
                    {initials(t.customer_name)}
                  </span>
                )}
                <div>
                  <p className="text-sm font-semibold text-ink-900">{t.customer_name}</p>
                  {t.customer_company ? <p className="text-xs text-ink-500">{t.customer_company}</p> : null}
                </div>
              </div>

              <div className="mt-3 flex gap-0.5 text-brand-500" aria-label={`${t.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, si) => (
                  <svg
                    key={si}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill={si < t.rating ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              <p className="mt-3 text-sm text-ink-700">&ldquo;{t.message}&rdquo;</p>
            </div>
          ))}
        </div>

        {testimonials.length > 1 ? (
          <div className="mt-6 flex justify-center gap-2">
            {testimonials.map((t, i) => (
              <button
                key={t.id}
                type="button"
                aria-label={`Go to testimonial ${i + 1}`}
                aria-current={i === active}
                onClick={() => scrollToCard(i)}
                className={`h-2 rounded-full transition-all ${
                  i === active ? "w-6 bg-brand-500" : "w-2 bg-ink-100 hover:bg-ink-300"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
