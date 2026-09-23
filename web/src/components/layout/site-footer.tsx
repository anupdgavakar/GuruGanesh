import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";

const columns = [
  {
    title: "Shop",
    links: [
      { href: "/products", label: "All products" },
      { href: "/services", label: "Services" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Contact us" },
    ],
  },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink-100 bg-accent-900 text-accent-100">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2 md:col-span-2">
          <div className="flex items-center gap-2.5">
            <Image src="/brand/logo-mark.png" alt="" width={36} height={36} className="h-9 w-9" unoptimized />
            <p className="font-display text-lg font-extrabold tracking-tight text-white">Guru Ganesh Graphics</p>
          </div>
          <p className="mt-3 max-w-sm text-sm text-accent-200">
            Custom printing, branding and design — business cards, packaging, signage and more, designed and
            delivered online.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold text-white">{col.title}</p>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-accent-200 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-5 text-xs text-accent-300 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} GuruGanesh Graphics. All rights reserved.</p>
          <p>Custom printing &amp; design, delivered online.</p>
        </Container>
      </div>
    </footer>
  );
}
