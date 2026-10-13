import { Container } from "@/components/ui/container";

export interface LegalSection {
  heading: string;
  /** Paragraphs; a line starting with "- " becomes a bullet. */
  body: string[];
}

/** Plain, readable layout shared by the Privacy, Terms and Shipping & returns pages. */
export function LegalPage({
  eyebrow,
  title,
  intro,
  updated,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <section className="relative overflow-hidden bg-linear-to-br from-accent-900 via-accent-800 to-brand-900 py-14 sm:py-16">
        <div aria-hidden className="absolute -top-20 right-10 h-64 w-64 rounded-full bg-brand-500/25 blur-3xl" />
        <Container className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-200 ring-1 ring-white/15">
            {eyebrow}
          </span>
          <h1 className="mt-4 max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-accent-100/90">{intro}</p>
          <p className="mt-3 text-xs text-accent-200/80">Last updated {updated}</p>
        </Container>
      </section>

      <Container className="max-w-3xl py-12 sm:py-16">
        <div className="flex flex-col gap-9">
          {sections.map((section) => {
            const bullets = section.body.filter((line) => line.startsWith("- "));
            const paragraphs = section.body.filter((line) => !line.startsWith("- "));
            return (
              <section key={section.heading}>
                <h2 className="text-xl font-bold text-ink-900">{section.heading}</h2>
                {paragraphs.map((line) => (
                  <p key={line} className="mt-2.5 leading-relaxed text-ink-700">
                    {line}
                  </p>
                ))}
                {bullets.length > 0 ? (
                  <ul className="mt-2.5 list-disc space-y-1.5 pl-5 text-ink-700">
                    {bullets.map((line) => (
                      <li key={line}>{line.slice(2)}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            );
          })}
        </div>
      </Container>
    </>
  );
}
