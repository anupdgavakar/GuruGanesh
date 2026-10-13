import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const points = [
  {
    title: "Fast turnaround",
    badge: "Quick delivery",
    detail: "Most orders print and ship within 3–5 business days.",
    icon: (
      <path
        d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Free design help",
    badge: "Design support",
    detail: "Use our free templates, or work with our designers for a custom look.",
    icon: (
      <>
        <path
          d="M12 19l7-7 3 3-7 7-3-3z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  {
    title: "Quality guaranteed",
    badge: "Risk-free",
    detail: "Not happy with a print? We'll reprint it or refund you.",
    icon: (
      <path
        d="M12 2l7 3v6c0 5-3.4 8.4-7 10-3.6-1.6-7-5-7-10V5l7-3z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Pan-India delivery",
    badge: "Nationwide",
    detail: "Tracked shipping to every pincode we serve, from metros to small towns.",
    icon: (
      <>
        <rect x="1" y="7" width="15" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
        <path d="M16 10h3.5l3.5 3.5V17h-7v-7z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        <circle cx="6" cy="19" r="1.75" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="18" cy="19" r="1.75" stroke="currentColor" strokeWidth="1.75" />
      </>
    ),
  },
  {
    title: "Trusted by 500+ businesses",
    badge: "5-star rated",
    detail: "Businesses across India rely on us for consistent, on-time printing.",
    icon: (
      <path
        d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7-6.2-3.9-6.2 3.9 1.6-7L2 9.5l7.1-.6L12 2z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Design & order online",
    badge: "Easy ordering",
    detail: "Pick a product, customize it, and check out securely — all in one place.",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
        <path d="M8 20h8M12 16v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </>
    ),
  },
];

export function TrustStrip() {
  return (
    <section className="bg-paper-muted py-16 sm:py-24">
      <Container>
        <SectionHeading align="center" eyebrow="Why choose us" title="Why choose Guru Ganesh Graphics?" />

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {points.map((point) => (
            <div
              key={point.title}
              className="relative flex flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-[var(--shadow-card)]"
            >
              <span className="absolute right-4 top-4 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
                {point.badge}
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  {point.icon}
                </svg>
              </span>
              <div>
                <p className="font-display text-base font-bold text-ink-900">{point.title}</p>
                <p className="mt-1 text-sm text-ink-500">{point.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
