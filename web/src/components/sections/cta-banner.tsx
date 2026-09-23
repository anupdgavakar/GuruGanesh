import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function CtaBanner() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-500 via-brand-600 to-accent-700 px-8 py-14 text-center sm:px-16">
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div aria-hidden className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/10" />
          <div aria-hidden className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-white/10" />
          <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Have a design ready? Let&apos;s print it.
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-brand-50">
            Upload your artwork or start from a free template — get a quote in minutes.
          </p>
          <div className="relative mt-6 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/products" variant="white" size="lg">
              Get started
            </ButtonLink>
            <ButtonLink
              href="/contact"
              variant="outline"
              size="lg"
              className="border-white/40 text-white hover:bg-white/10"
            >
              Talk to us
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
