"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-ink-900">Something went wrong</h1>
      <p className="max-w-md text-ink-500">
        That&apos;s on us — try again, or come back in a moment.
      </p>
      <Button onClick={reset} className="mt-2">
        Try again
      </Button>
    </Container>
  );
}
