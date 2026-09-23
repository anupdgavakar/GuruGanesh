import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-ink-100 bg-white shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
