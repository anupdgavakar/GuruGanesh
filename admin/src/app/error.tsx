"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-3 bg-ink-50 px-4 text-center">
      <h1 className="text-xl font-semibold text-ink-900">Something went wrong</h1>
      <p className="max-w-sm text-sm text-ink-500">
        That&apos;s on us — try again, or check that the API is running.
      </p>
      <Button onClick={reset} className="mt-2">
        Try again
      </Button>
    </div>
  );
}
