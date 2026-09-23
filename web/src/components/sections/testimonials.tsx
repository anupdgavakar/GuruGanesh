import { Card } from "@/components/ui/card";
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

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      <div
        aria-hidden
        className="absolute -bottom-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-accent-100/40 blur-3xl"
      />
      <Container className="relative">
        <SectionHeading align="center" eyebrow="Customers" title="Loved by businesses like yours" />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.id} className="relative overflow-hidden p-6">
              <svg
                aria-hidden
                width="42"
                height="42"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="absolute -right-1 -top-1 text-brand-50"
              >
                <path d="M9.5 6C6.5 7.5 5 10 5 13c0 2.2 1.5 3.5 3.3 3.5 1.7 0 3-1.2 3-3 0-1.6-1.1-2.7-2.5-2.9.3-1.5 1.5-2.9 3.2-3.7L9.5 6zm9 0c-3 1.5-4.5 4-4.5 7 0 2.2 1.5 3.5 3.3 3.5 1.7 0 3-1.2 3-3 0-1.6-1.1-2.7-2.5-2.9.3-1.5 1.5-2.9 3.2-3.7L18.5 6z" />
              </svg>
              <div className="relative flex gap-0.5 text-brand-500" aria-label={`${t.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill={i < t.rating ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="relative mt-4 text-sm text-ink-700">&ldquo;{t.message}&rdquo;</p>
              <div className="relative mt-5 flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-500 to-accent-600 text-xs font-bold text-white">
                  {initials(t.customer_name)}
                </span>
                <p className="text-sm font-semibold text-ink-900">{t.customer_name}</p>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
