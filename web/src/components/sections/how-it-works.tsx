import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const steps = [
  {
    step: "01",
    title: "Choose your product",
    detail: "Pick from business cards, packaging, signage and more — every product has clear pricing tiers.",
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
          title="From idea to delivery in three steps"
        />

        <div className="relative mt-12 grid gap-8 sm:grid-cols-3">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-8 hidden h-px bg-linear-to-r from-transparent via-ink-200 to-transparent sm:block"
          />
          {steps.map((item) => (
            <div key={item.step} className="relative flex flex-col items-center text-center">
              <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-brand-500 to-accent-600 text-white shadow-lg shadow-brand-900/10">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {item.icon}
                </svg>
              </span>
              <span className="mt-4 text-xs font-bold uppercase tracking-widest text-brand-600">
                Step {item.step}
              </span>
              <p className="mt-1 font-display text-lg font-bold text-ink-900">{item.title}</p>
              <p className="mt-2 max-w-xs text-sm text-ink-500">{item.detail}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
