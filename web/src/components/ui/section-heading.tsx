import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? (
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-600">{eyebrow}</p>
      ) : null}
      <h2 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">{title}</h2>
      {description ? <p className="mt-3 text-base text-ink-500">{description}</p> : null}
    </div>
  );
}
