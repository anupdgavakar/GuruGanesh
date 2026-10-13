import type { ServiceIconName } from "@/lib/service-visuals";

const PATHS: Record<ServiceIconName, string[]> = {
  design: ["M12 19l7-7 3 3-7 7-3-3z", "M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z", "M2 2l7.6 7.6", "M11 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"],
  brand: ["M12 2l2.4 7.2H22l-6 4.6 2.3 7.2-6.3-4.6-6.3 4.6 2.3-7.2-6-4.6h7.6z"],
  bulk: ["M12 2L2 7l10 5 10-5-10-5z", "M2 17l10 5 10-5", "M2 12l10 5 10-5"],
  rush: ["M13 2L3 14h9l-1 8 10-12h-9l1-8z"],
  gift: ["M20 12v10H4V12", "M2 7h20v5H2z", "M12 22V7", "M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z", "M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"],
  heart: ["M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"],
  flag: ["M4 22V4", "M4 4h13l-2 4 2 4H4"],
  display: ["M3 4h18v12H3z", "M8 20h8", "M12 16v4"],
  package: ["M21 8l-9-5-9 5v8l9 5 9-5V8z", "M3.3 7.3L12 12l8.7-4.7", "M12 22V12"],
  stamp: ["M5 22h14", "M19 18H5v-3a3 3 0 0 1 3-3h1a2 2 0 0 0 2-2V6a3 3 0 1 1 2 0v4a2 2 0 0 0 2 2h1a3 3 0 0 1 3 3v3z"],
  truck: ["M1 3h15v13H1z", "M16 8h4l3 3v5h-7V8z", "M5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z", "M18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"],
  layout: ["M3 3h18v18H3z", "M3 9h18", "M9 21V9"],
};

export function ServiceIcon({ name, size = 24, className }: { name: ServiceIconName; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
