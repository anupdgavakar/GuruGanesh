"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import type { NavGroup, NavIcon } from "./nav-config";
import { cn } from "@/lib/utils";

const icons: Record<NavIcon, React.ReactNode> = {
  box: (
    <>
      <path d="M3 8l9-5 9 5-9 5-9-5z" />
      <path d="M3 8v9l9 5 9-5V8" />
      <path d="M12 13v9" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
    </>
  ),
  palette: (
    <>
      <path d="M12 2a10 10 0 100 20c1.5 0 2-1 2-2s-.5-1.5-.5-2.5S14 16 15 16h2a4 4 0 004-4c0-5.5-4.5-10-9-10z" />
      <circle cx="7.5" cy="10.5" r="1" />
      <circle cx="11" cy="7" r="1" />
      <circle cx="15.5" cy="9" r="1" />
    </>
  ),
  truck: (
    <>
      <rect x="1" y="7" width="13" height="9" rx="1.5" />
      <path d="M14 10h3.5L21 13.5V16h-7v-6z" />
      <circle cx="6" cy="18" r="1.75" />
      <circle cx="17.5" cy="18" r="1.75" />
    </>
  ),
  tag: (
    <>
      <path d="M13 3L3 13v5a3 3 0 003 3h5l10-10z" />
      <circle cx="8.5" cy="15.5" r="1" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 6h10M18 6h2M4 18h2M10 18h10" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="6" cy="18" r="2" />
    </>
  ),
  star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
  document: (
    <>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M15 3v4h4" />
      <path d="M9 12h6M9 16h6" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="M21 16l-5.5-5.5L3 20" />
    </>
  ),
  megaphone: (
    <>
      <path d="M3 10v4a1 1 0 001 1h2l6 4V5l-6 4H4a1 1 0 00-1 1z" />
      <path d="M17 9a4 4 0 010 6" />
    </>
  ),
  inbox: (
    <>
      <path d="M3 12h5l1.5 3h5L16 12h5" />
      <path d="M3 12l1.5-7h15L21 12v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z" />
    </>
  ),
  cart: (
    <>
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M2.5 3h2.5l2.5 12.5h10.5l2-9H6.5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.8 20a6.2 6.2 0 0112.4 0" />
      <path d="M16 5.2a3.2 3.2 0 010 5.6M18 14.3a6.2 6.2 0 013.2 5.7" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </>
  ),
};

function NavGlyph({ icon }: { icon: NavIcon }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {icons[icon]}
    </svg>
  );
}

export function Sidebar({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-200 bg-white md:flex">
      <div className="relative flex h-16 items-center gap-2.5 overflow-hidden border-b border-ink-200 bg-linear-to-br from-accent-900 to-accent-800 px-5">
        <Link href="/" className="relative flex items-center gap-2.5">
          <Image src="/brand/logo-mark.png" alt="" width={32} height={32} className="h-8 w-8" priority unoptimized />
          <span className="font-display text-base font-semibold text-white">
            Guru Ganesh
            <span className="ml-1.5 rounded bg-white/15 px-1.5 py-0.5 text-xs font-medium text-brand-100">
              Admin
            </span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="px-2.5 pb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-300">
              {group.label}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href as Route}
                      className={cn(
                        "relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                        active
                          ? "bg-accent-50 font-medium text-accent-700"
                          : "text-ink-700 hover:bg-ink-50",
                      )}
                    >
                      {active ? (
                        <span
                          aria-hidden
                          className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-500"
                        />
                      ) : null}
                      <span className={cn("shrink-0", active ? "text-accent-700" : "text-ink-400")}>
                        <NavGlyph icon={item.icon} />
                      </span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
