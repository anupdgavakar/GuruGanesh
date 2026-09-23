import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getServices } from "@/lib/api/resources";

export const metadata: Metadata = {
  title: "Services",
  description: "Design help, bulk printing and corporate branding from GuruGanesh Graphics.",
};

export const revalidate = 300;

const fallbackServices = [
  { name: "Design assistance", short_description: "Work with our in-house designers to get your artwork print-ready." },
  { name: "Bulk & corporate orders", short_description: "Volume pricing and dedicated support for larger print runs." },
  { name: "Rush delivery", short_description: "Need it fast? Priority production and expedited shipping." },
];

export default async function ServicesPage() {
  const services = await getServices();
  const items = services.length > 0 ? services : null;

  return (
    <Container className="py-16 sm:py-24">
      <SectionHeading
        align="center"
        eyebrow="What we do"
        title="Services built around your print run"
        description="From a single design tweak to a full corporate rollout — here's how we help."
      />

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(items ?? fallbackServices).map((service, i) => (
          <div key={"slug" in service ? service.slug : i} className="rounded-[var(--radius-card)] border border-ink-100 bg-white p-6 shadow-[var(--shadow-card)]">
            {"image_url" in service && service.image_url ? (
              <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-xl bg-paper-muted">
                <Image src={service.image_url} alt={service.name} fill sizes="400px" className="object-cover" unoptimized />
              </div>
            ) : (
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                {"icon_url" in service && service.icon_url ? (
                  <Image src={service.icon_url} alt="" width={24} height={24} unoptimized />
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M12 2l2.4 7.2H22l-6 4.6 2.3 7.2-6.3-4.6-6.3 4.6 2.3-7.2-6-4.6h7.6z" />
                  </svg>
                )}
              </div>
            )}
            <p className="font-display text-lg font-bold text-ink-900">{service.name}</p>
            <p className="mt-2 text-sm text-ink-500">{service.short_description}</p>
          </div>
        ))}
      </div>

      {!items ? (
        <p className="mt-6 text-center text-xs text-ink-500">
          Showing placeholder services — connect the Laravel API and seed data to see the real list.
        </p>
      ) : null}

      <div className="mt-14 flex justify-center">
        <ButtonLink href="/contact" size="lg">
          Talk to us about your project
        </ButtonLink>
      </div>
    </Container>
  );
}
