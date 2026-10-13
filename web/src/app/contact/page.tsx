import type { Metadata } from "next";
import { ContactForm } from "@/components/sections/contact-form";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { SITE_EMAIL, SITE_PHONE_DISPLAY, SITE_PHONE_TEL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with GuruGanesh Graphics.",
};

const details = [
  { label: "Email", value: SITE_EMAIL, href: `mailto:${SITE_EMAIL}` },
  { label: "Phone", value: SITE_PHONE_DISPLAY, href: `tel:${SITE_PHONE_TEL}` },
];

/** Keeps a value from the address bar short and free of line breaks before it goes into the form. */
function clean(value: string | string[] | undefined, max: number): string {
  const text = Array.isArray(value) ? value[0] : value;
  return (text ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, max);
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const product = clean(query.product, 150);
  const qty = clean(query.qty, 9).replace(/\D/g, "");
  const priceRequest = product !== "";

  const defaultSubject = priceRequest ? `Price request: ${product}` : undefined;
  const defaultMessage = priceRequest
    ? `Hello, please share the price for ${qty ? `${qty} × ` : ""}${product}.`
    : undefined;

  return (
    <Container className="py-16 sm:py-24">
      <SectionHeading
        eyebrow={priceRequest ? "Ask for price" : "Get in touch"}
        title={priceRequest ? `Get the price for ${product}` : "Let's talk about your project"}
        description={
          priceRequest
            ? "Tell us how to reach you and we'll come back with the price."
            : "Questions about a product, a bulk order, or just want a quote? Send us a message."
        }
      />

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          {details.map((d) => (
            <div key={d.label}>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{d.label}</p>
              <a href={d.href} className="mt-1 block text-ink-900 hover:text-brand-600 hover:underline">
                {d.value}
              </a>
            </div>
          ))}
        </div>

        <div className="rounded-[var(--radius-card)] border border-ink-100 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
          <ContactForm defaultSubject={defaultSubject} defaultMessage={defaultMessage} priceRequest={priceRequest} />
        </div>
      </div>
    </Container>
  );
}
