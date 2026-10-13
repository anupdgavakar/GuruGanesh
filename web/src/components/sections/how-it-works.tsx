import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const steps = [
  {
    step: "01",
    title: "Choose your product",
    detail: "Pick from business cards, packaging, signage and more — every product has clear pricing tiers.",
    card: "from-brand-100 via-brand-50 to-white",
    icon: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="2.5" />
        <path d="M9 4v16M4 9h5" />
      </>
    ),
  },
  {
    step: "02",
    title: "Customize & upload artwork",
    detail: "Add your design, quantity and finish, or ask our team for help getting it print-ready.",
    card: "from-accent-100 via-accent-50 to-white",
    icon: (
      <>
        <path d="M12 3v12" />
        <path d="M7 8l5-5 5 5" />
        <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
      </>
    ),
  },
  {
    step: "03",
    title: "We print & deliver",
    detail: "Your order goes into production and ships to your door — track it every step of the way.",
    card: "from-brand-200 via-accent-100 to-white",
    icon: (
      <>
        <path d="M3 8l9-5 9 5-9 5-9-5z" />
        <path d="M3 8v9l9 5 9-5V8" />
        <path d="M12 13v9" />
      </>
    ),
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <SectionHeading
          align="center"
          eyebrow="Simple by design"
          title="How Guru Ganesh Graphics Works"
        />

        <div className="relative mt-14 grid gap-8 sm:grid-cols-3">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-4 hidden h-px bg-[repeating-linear-gradient(to_right,var(--color-ink-300)_0,var(--color-ink-300)_6px,transparent_6px,transparent_12px)] sm:block"
          />
          {steps.map((item, i) => (
            <div
              key={item.step}
              className={`relative flex flex-col items-center rounded-2xl border border-ink-100 bg-linear-to-br p-8 pt-11 text-center shadow-[var(--shadow-card)] ${item.card}`}
            >
              <span className="absolute -top-4 left-1/2 z-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white ring-4 ring-white">
                {i + 1}
              </span>
              <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/80 text-brand-600 shadow-sm">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {item.icon}
                </svg>
              </span>
              <p className="mt-5 font-display text-lg font-bold text-ink-900">{item.title}</p>
              <p className="mt-2 max-w-xs text-sm text-ink-600">{item.detail}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
