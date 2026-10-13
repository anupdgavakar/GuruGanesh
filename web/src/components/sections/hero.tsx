"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import type { Slider } from "@/lib/api/types";

/** Time each set of slides stays on screen before sliding to the next. */
const AUTO_ADVANCE_MS = 5500;

/**
 * Homepage hero. This is its own admin-managed list — "Homepage Slides" in
 * the admin panel — independent of products: a slide might promote a
 * specific product, but it might just as easily be a category push or
 * general company/brand messaging, so it isn't derived from the product
 * catalog the way the "Featured Products" row below it is.
 *
 * Layout per slide: heading, then the image (in a rounded card, with dot
 * navigation under it), then the subheading, then the two buttons — one
 * slide visible at a time, advancing automatically every AUTO_ADVANCE_MS.
 * Zero slides (nothing added in admin yet, or none currently active) falls
 * back to the original static hero.
 */
export function Hero({ slides }: { slides: Slider[] }) {
  if (slides.length === 0) {
    return <StaticHero />;
  }

  return <HeroCarousel slides={slides} />;
}

function slideHref(slide: Slider): Route | null {
  if (!slide.link_url) return null;
  return slide.link_url as Route;
}

/** How many slide-cards show at once on desktop, side by side (on mobile one shows at a time). */
const VISIBLE_COUNT = 3;
/** Length of the slide-over animation. Keep in sync with `duration-700` below. */
const TRANSITION_MS = 700;
/** Space between cards. */
const GAP = "1.5rem";

function HeroCarousel({ slides }: { slides: Slider[] }) {
  const total = slides.length;
  const visibleCount = Math.min(VISIBLE_COUNT, total);

  // `index` is the slide at the left edge. The track holds the real slides
  // followed by copies of the first `visibleCount`, so after the last real
  // slide it keeps sliding forward into the copies, then snaps back to 0
  // (invisibly — the copies look identical) for an endless loop.
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const items = [...slides, ...slides.slice(0, visibleCount)];

  useEffect(() => {
    if (total <= 1) return;
    const id = setInterval(() => setIndex((i) => i + 1), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [total]);

  // Reached the copies: once the slide-over finishes, jump back to the start with no animation.
  useEffect(() => {
    if (index < total) return;
    const t = setTimeout(() => {
      setAnimate(false);
      setIndex(index - total);
    }, TRANSITION_MS + 60);
    return () => clearTimeout(t);
  }, [index, total]);

  // Turn the animation back on once the snap-back has been painted.
  useEffect(() => {
    if (animate) return;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setAnimate(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [animate]);

  function goTo(i: number) {
    setAnimate(true);
    setIndex(i);
  }

  const current = index % total;
  const visibleIds = new Set(Array.from({ length: visibleCount }, (_, k) => slides[(current + k) % total].id));

  return (
    <section className="relative overflow-hidden bg-linear-to-br from-accent-900 via-accent-800 to-brand-900">
      <div aria-hidden className="absolute -top-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-brand-500/30 blur-3xl" />
      <div aria-hidden className="absolute -bottom-40 -left-24 h-[26rem] w-[26rem] rounded-full bg-accent-400/25 blur-3xl" />

      <Container className="relative py-16 sm:py-20 lg:py-24">
        <div className="overflow-x-clip py-6">
          <div
            className="flex"
            style={{ gap: GAP, ["--gap" as string]: GAP, ["--n" as string]: visibleCount }}
          >
            {items.map((slide, i) => (
              <div
                key={`${slide.id}-${i}`}
                aria-hidden={i >= total}
                className={`w-full flex-none lg:w-[calc((100%_-_var(--gap)*(var(--n)_-_1))/var(--n))] ${
                  animate ? "transition-transform duration-700 ease-in-out motion-reduce:transition-none" : "transition-none"
                }`}
                style={{ transform: `translateX(calc(${-index} * (100% + var(--gap))))` }}
              >
                <SlideCard slide={slide} first={i === 0} />
              </div>
            ))}
          </div>
        </div>

        {total > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={visibleIds.has(s.id)}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all ${
                  visibleIds.has(s.id) ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

/**
 * One slide's content: the image on top, then a single row underneath with
 * the heading, subheading and buttons all side by side (wrapping to stack
 * only if the card gets too narrow to fit them, e.g. on small phones).
 */
function SlideCard({ slide, first }: { slide: Slider; first: boolean }) {
  const href = slideHref(slide);
  const headline = slide.title?.trim() || "Guru Ganesh Graphics";
  const description = slide.subtitle?.trim() || "";
  const Heading = first ? "h1" : "h2";

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl shadow-2xl shadow-black/30 ring-1 ring-white/10">
        {slide.image_url ? (
          <Image
            src={slide.image_url}
            alt=""
            fill
            priority={first}
            sizes="(min-width: 1024px) 45vw, 90vw"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-white/5" />
        )}
      </div>

      <div className="flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-3 text-left">
        <Heading className="text-lg font-extrabold leading-tight tracking-tight text-white sm:text-xl">
          {headline}
        </Heading>

        {description ? <p className="text-sm text-accent-100/90 sm:text-base">{description}</p> : null}

        <div className="flex flex-wrap gap-2.5">
          {href ? (
            <ButtonLink href={href} className="shadow-lg shadow-brand-900/40">
              Get more details
            </ButtonLink>
          ) : null}
          <ButtonLink
            href="/products"
            variant={href ? "outline" : "primary"}
            className={href ? "border-white/30 text-white hover:bg-white/10" : "shadow-lg shadow-brand-900/40"}
          >
            View all products
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

/** Original static hero — shown until admin adds at least one active homepage slide. */
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
