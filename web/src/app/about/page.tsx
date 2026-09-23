import type { Metadata } from "next";
import { CtaBanner } from "@/components/sections/cta-banner";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "About",
  description: "About GuruGanesh Graphics.",
};

const values = [
  { title: "Quality first", detail: "Every order is checked before it ships — reprints are on us if something's off." },
  { title: "Built for business", detail: "From one-off jobs to recurring corporate orders, we scale with you." },
  { title: "Design that helps", detail: "Free templates or a designer's help — you don't need to be a designer to print well." },
];

export default function AboutPage() {
  return (
    <>
      <Container className="py-16 sm:py-24">
        <SectionHeading
          eyebrow="Our story"
          title="Custom printing, done right"
          description="GuruGanesh Graphics prints business cards, packaging, signage and marketing materials for
            businesses that care about how they look — designed online, printed locally, delivered fast."
        />

        <div className="mt-8 max-w-2xl space-y-4 text-ink-700">
          <p>
            We started as a neighborhood print shop and grew into an online-first printing partner, without losing
            the part that mattered: getting the details right, every single order.
          </p>
          <p>
            This page is placeholder copy pending Phase 0&apos;s final brand story — replace it with the real
            company history, mission and photos once they&apos;re ready.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {values.map((value) => (
            <div key={value.title} className="rounded-[var(--radius-card)] border border-ink-100 bg-paper-muted p-6">
              <p className="font-display text-base font-bold text-ink-900">{value.title}</p>
              <p className="mt-2 text-sm text-ink-500">{value.detail}</p>
            </div>
          ))}
        </div>
      </Container>

      <CtaBanner />
    </>
  );
}
