import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

/**
 * Placeholder for routes this phase stubs out but doesn't build content for
 * yet (Phase 4 replaces these with the real page). Keeping the route (and
 * its nav link) real now avoids 404s and lets typedRoutes validate links.
 */
export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <span className="text-sm font-semibold uppercase tracking-wide text-brand-600">Coming soon</span>
      <h1 className="text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">{title}</h1>
      <p className="max-w-md text-ink-500">{description}</p>
      <ButtonLink href="/" className="mt-4">
        Back to home
      </ButtonLink>
    </Container>
  );
}
