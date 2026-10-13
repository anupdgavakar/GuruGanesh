import type { Metadata } from "next";
import Image from "next/image";
import { ServiceIcon } from "@/components/sections/service-icon";
import { CtaBanner } from "@/components/sections/cta-banner";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getCategories, getServices } from "@/lib/api/resources";
import { SITE_PHONE_DISPLAY, SITE_PHONE_TEL } from "@/lib/site";
import {
  DEFAULT_VISUAL,
  FALLBACK_SERVICES,
  SERVICE_TONES,
  SERVICE_VISUALS,
  type ServiceIconName,
} from "@/lib/service-visuals";

export const metadata: Metadata = {
  title: "Services",
  description: "Design help, bulk printing, wedding and election printing, signage, packaging and more from GuruGanesh Graphics.",
};

export const revalidate = 60;

const STEPS = [
  { title: "Tell us what you need", detail: "Call, write in or place a request on the site." },
  { title: "We design and proof", detail: "Share your artwork or let our designers help. Approve the proof." },
  { title: "We print with care", detail: "Your job is printed and checked before it leaves us." },
  { title: "Delivered to you", detail: "Your order reaches your door." },
];

const STEP_COLOURS = ["bg-orange-500", "bg-rose-500", "bg-sky-500", "bg-emerald-500"];

/** Lines of a service's text that start with "- " become the check-list; otherwise the defaults are used. */
function highlightsFrom(content: string | null, fallback: string[]): string[] {
  const lines = (content ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.startsWith("- "))
    .map((l) => l.slice(2).trim());
  return lines.length > 0 ? lines : fallback;
}

export default async function ServicesPage() {
  const [services, categories] = await Promise.all([getServices(), getCategories()]);

  const categoryImage = new Map(categories.map((c) => [c.slug, c.image_url ?? null]));

  const items = (services.length > 0 ? services : FALLBACK_SERVICES.map((s, i) => ({ ...s, id: -i - 1, content: null, icon_url: null, image_url: null })))
    .map((service, index) => {
      const visual = SERVICE_VISUALS[service.slug] ?? DEFAULT_VISUAL;
      const tone = SERVICE_TONES[index % SERVICE_TONES.length];
      const image =
        service.image_url ?? (visual.categorySlug ? (categoryImage.get(visual.categorySlug) ?? null) : null);

      return {
        key: service.id,
        name: service.name,
        description: service.short_description,
        icon: visual.icon as ServiceIconName,
        customIcon: service.icon_url,
        image,
        highlights: highlightsFrom(service.content, visual.highlights),
        tone,
        index,
      };
    });

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-br from-accent-900 via-accent-800 to-brand-900">
        <div aria-hidden className="absolute -top-24 -right-10 h-80 w-80 rounded-full bg-brand-500/30 blur-3xl" />
        <div aria-hidden className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div aria-hidden className="absolute top-10 left-1/3 h-48 w-48 rounded-full bg-sky-400/15 blur-3xl" />
        <Container className="relative py-16 sm:py-24">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-200 ring-1 ring-white/15">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
            What we do
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Services built around{" "}
            <span className="bg-linear-to-r from-orange-300 via-rose-300 to-sky-300 bg-clip-text text-transparent">your print run</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base text-accent-100/90 sm:text-lg">
            From a single design tweak to a full campaign or corporate rollout — design, printing and delivery from one place.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/contact" size="lg" className="shadow-lg shadow-brand-900/40">
              Talk to us about your project
            </ButtonLink>
            <ButtonLink
              href={`tel:${SITE_PHONE_TEL}` as never}
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10"
            >
              Call {SITE_PHONE_DISPLAY}
            </ButtonLink>
          </div>

          <ul className="mt-10 flex flex-wrap gap-2.5">
            {items.map((item) => (
              <li key={item.key}>
                <a
                  href={`#service-${item.key}`}
                  className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white ring-1 ring-white/15 transition-colors hover:bg-white/20"
                >
                  <span className={`h-2 w-2 rounded-full ${item.tone.dot}`} />
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Service cards */}
      <section className="bg-paper py-16 sm:py-20">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <article
                key={item.key}
                id={`service-${item.key}`}
                className="group flex scroll-mt-24 flex-col overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`h-1.5 bg-linear-to-r ${item.tone.bar}`} />

                <div className={`relative aspect-[16/10] w-full overflow-hidden ${item.tone.soft}`}>
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className={`flex h-full w-full items-center justify-center bg-linear-to-br ${item.tone.bar} opacity-90`}>
                      <ServiceIcon name={item.icon} size={72} className="text-white/90" />
                    </div>
                  )}

                  <div
                    className={`absolute left-4 bottom-4 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg ring-4 ring-white ${item.tone.chip}`}
                  >
                    {item.customIcon ? (
                      <Image src={item.customIcon} alt="" width={26} height={26} unoptimized />
                    ) : (
                      <ServiceIcon name={item.icon} size={24} />
                    )}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h2 className="font-display text-xl font-bold leading-snug text-ink-900">{item.name}</h2>
                  {item.description ? <p className="mt-2 text-sm text-ink-600">{item.description}</p> : null}

                  {item.highlights.length > 0 ? (
                    <ul className="mt-4 space-y-2">
                      {item.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2 text-sm text-ink-700">
                          <span className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full ${item.tone.soft} ${item.tone.text}`}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 12.5l5 5L20 7" />
                            </svg>
                          </span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <div className="mt-auto pt-6">
                    <ButtonLink href="/contact" variant="outline" size="sm" className={`${item.tone.text} ring-1 ${item.tone.ring} border-transparent`}>
                      Ask about this
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </ButtonLink>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-600">How it works</p>
            <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">From idea to doorstep</h2>
          </div>

          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative rounded-3xl border border-ink-100 bg-white p-6 shadow-[var(--shadow-card)]">
                <span className={`flex h-11 w-11 items-center justify-center rounded-full text-lg font-extrabold text-white ${STEP_COLOURS[i]}`}>
                  {i + 1}
                </span>
                <p className="mt-4 font-display text-lg font-bold text-ink-900">{step.title}</p>
                <p className="mt-1.5 text-sm text-ink-600">{step.detail}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <CtaBanner />
    </>
  );
}
