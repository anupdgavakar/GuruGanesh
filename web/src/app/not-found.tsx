import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="font-display text-6xl font-extrabold text-brand-500">404</p>
      <h1 className="text-2xl font-bold text-ink-900">We couldn&apos;t find that page</h1>
      <p className="max-w-md text-ink-500">
        The page you&apos;re looking for may have moved or doesn&apos;t exist yet.
      </p>
      <ButtonLink href="/" className="mt-2">
        Back to home
      </ButtonLink>
    </Container>
  );
}
