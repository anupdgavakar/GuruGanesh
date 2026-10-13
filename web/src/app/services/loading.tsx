import { Container } from "@/components/ui/container";

/** Shown the instant "Services" is clicked, while the real page is being built. */
export default function ServicesLoading() {
  return (
    <>
      <section className="bg-linear-to-br from-accent-900 via-accent-800 to-brand-900">
        <Container className="py-16 sm:py-24">
          <div className="h-6 w-28 animate-pulse rounded-full bg-white/15" />
          <div className="mt-5 h-12 w-full max-w-xl animate-pulse rounded-xl bg-white/15 sm:h-16" />
          <div className="mt-5 h-5 w-full max-w-lg animate-pulse rounded bg-white/10" />
          <div className="mt-8 flex gap-3">
            <div className="h-12 w-56 animate-pulse rounded-xl bg-white/15" />
            <div className="h-12 w-40 animate-pulse rounded-xl bg-white/10" />
          </div>
        </Container>
      </section>
      <section className="bg-paper py-16 sm:py-20">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-3xl border border-ink-100 bg-white">
                <div className="aspect-[16/10] w-full animate-pulse bg-ink-100" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-ink-100" />
                  <div className="h-4 w-full animate-pulse rounded bg-ink-100" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-ink-100" />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
