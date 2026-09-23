import { Container } from "@/components/ui/container";

const points = [
  {
    title: "Fast turnaround",
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
    title: "Design help included",
    detail: "Free templates, or work with our designers for a custom look.",
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
    detail: "Tracked shipping to every pincode we serve.",
    icon: (
      <>
        <rect x="1" y="7" width="15" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
        <path
          d="M16 10h3.5l3.5 3.5V17h-7v-7z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <circle cx="6" cy="19" r="1.75" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="18" cy="19" r="1.75" stroke="currentColor" strokeWidth="1.75" />
      </>
    ),
  },
];

export function TrustStrip() {
  return (
    <section className="border-y border-ink-100 bg-paper-muted py-12">
      <Container className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {points.map((point) => (
          <div key={point.title} className="flex items-start gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-brand-600 shadow-[var(--shadow-card)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                {point.icon}
              </svg>
            </span>
            <div>
              <p className="font-display text-base font-bold text-ink-900">{point.title}</p>
              <p className="mt-0.5 text-sm text-ink-500">{point.detail}</p>
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}
