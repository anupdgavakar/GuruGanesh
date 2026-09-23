import type { Metadata } from "next";
import { ContactForm } from "@/components/sections/contact-form";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with GuruGanesh Graphics.",
};

const details = [
  { label: "Email", value: "hello@guruganeshgraphics.com" },
  { label: "Phone", value: "+91 00000 00000" },
  { label: "Hours", value: "Mon–Sat, 10am–7pm IST" },
];

export default function ContactPage() {
  return (
    <Container className="py-16 sm:py-24">
      <SectionHeading
        eyebrow="Get in touch"
        title="Let's talk about your project"
        description="Questions about a product, a bulk order, or just want a quote? Send us a message."
      />

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          {details.map((d) => (
            <div key={d.label}>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{d.label}</p>
              <p className="mt-1 text-ink-900">{d.value}</p>
            </div>
          ))}
          <p className="text-xs text-ink-500">
            Contact details are placeholders until Phase 0 finalizes real company information.
          </p>
        </div>

        <div className="rounded-[var(--radius-card)] border border-ink-100 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
          <ContactForm />
        </div>
      </div>
    </Container>
  );
}
