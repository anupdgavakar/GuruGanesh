"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const ROTATE_MS = 4000;
/** After the visitor picks a picture themselves, leave their choice alone for this long. */
const PAUSE_AFTER_CLICK_MS = 12000;

/**
 * Product picture area: one large picture with a row of small ones under it.
 * The large picture changes by itself every few seconds, and clicking a
 * small picture (or the arrows) shows that one instead — the automatic
 * change then waits a while so it doesn't override the visitor's choice.
 * It also holds still while the mouse is over the large picture.
 */
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const pausedUntil = useRef(0);
  const count = images.length;

  useEffect(() => {
    if (count <= 1) return;

    const id = window.setInterval(() => {
      if (hovering || Date.now() < pausedUntil.current) return;
      setIndex((i) => (i + 1) % count);
    }, ROTATE_MS);

    return () => window.clearInterval(id);
  }, [count, hovering]);

  function choose(i: number) {
    pausedUntil.current = Date.now() + PAUSE_AFTER_CLICK_MS;
    setIndex(((i % count) + count) % count);
  }

  return (
    <div>
      <div
        className="relative aspect-square w-full overflow-hidden rounded-[var(--radius-card)] bg-paper-muted"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={i === index ? name : ""}
            aria-hidden={i !== index}
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className={`object-cover transition-opacity duration-500 ${i === index ? "opacity-100" : "opacity-0"}`}
          />
        ))}

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => choose(index - 1)}
              aria-label="Previous picture"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink-800 shadow-md transition-colors hover:bg-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => choose(index + 1)}
              aria-label="Next picture"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink-800 shadow-md transition-colors hover:bg-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => choose(i)}
              aria-label={`Show picture ${i + 1} of ${count}`}
              aria-current={i === index}
              className={`relative aspect-square overflow-hidden rounded-lg bg-paper-muted transition-all ${
                i === index ? "ring-2 ring-brand-500 ring-offset-2" : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={src} alt="" fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
