import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { SITE_EMAIL, SITE_PHONE_DISPLAY } from "@/lib/site";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Common questions about ordering, turnaround and delivery.",
};

const faqs = [
  {
    question: "How do I place an order?",
    answer:
      "Browse products by category or search from the header, add what you need to your cart, and check out. You sign in with just your mobile number and a one-time code — no password. Where a price isn't shown, tap \"Ask for price\" and we'll reply with a quote. Our team will follow up if we need anything else from you to get your order printing.",
  },
  {
    question: "How long does printing and delivery take?",
    answer: "Most orders print and ship within 3–5 business days, with tracked delivery across India.",
  },
  {
    question: "I'm not confident designing it myself — can you help?",
    answer:
      "Yes. We offer free ready-made templates for most products, and our designers can put together a custom look for you — just mention it when you get in touch.",
  },
  {
    question: "What if I'm not happy with the print quality?",
    answer: "Let us know and we'll make it right — we'll reprint the order or refund you.",
  },
  {
    question: "How do I check my order status?",
    answer:
      `Our team keeps you updated directly on every order. For the latest on yours, call ${SITE_PHONE_DISPLAY} or email ${SITE_EMAIL} with your order details.`,
  },
];

export default function HelpCenterPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-linear-to-br from-accent-900 via-accent-800 to-brand-900 py-16 sm:py-20">
        <div aria-hidden className="absolute -top-20 right-10 h-64 w-64 rounded-full bg-brand-500/25 blur-3xl" />
        <Container className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-200 ring-1 ring-white/15">
            Help Center
          </span>
          <h1 className="mt-4 max-w-xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            How can we help?
          </h1>
          <p className="mt-3 max-w-lg text-accent-100/90">
            Answers to what customers ask us most. Can&apos;t find yours? Reach out directly and we&apos;ll help
            you sort it out.
          </p>
        </Container>
      </section>

      <Container className="py-16 sm:py-20">
        <SectionHeading eyebrow="FAQs" title="Frequently asked questions" />

        <div className="mt-10 mx-auto flex max-w-2xl flex-col gap-3">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-ink-100 bg-white p-5 shadow-[var(--shadow-card)] open:shadow-lg"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink-900 [&::-webkit-details-marker]:hidden">
                {faq.question}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="shrink-0 text-ink-400 transition-transform group-open:rotate-180"
                >
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>
              <p className="mt-3 text-sm text-ink-600">{faq.answer}</p>
            </details>
          ))}
        </div>

        <div className="mx-auto mt-12 flex max-w-2xl flex-col items-center gap-4 rounded-2xl border border-dashed border-ink-200 py-10 text-center">
          <p className="text-ink-500">Still need a hand? We&apos;re happy to help directly.</p>
          <ButtonLink href="/contact">Contact us</ButtonLink>
        </div>
      </Container>
    </>
  );
}
