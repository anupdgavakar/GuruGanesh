import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CartProvider } from "@/lib/cart/cart-context";
import { AuthProvider } from "@/lib/auth/auth-context";
import { getCategories } from "@/lib/api/resources";
// Self-hosted via @fontsource (npm), not next/font/google — this app builds
// and runs fully offline, with no runtime dependency on fonts.googleapis.com.
// Font stacks themselves are defined in globals.css (`--font-sans` /
// `--font-display`), matching the family names these packages register.
import "@fontsource-variable/inter";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GuruGanesh Graphics — Custom Printing & Design",
    template: "%s | GuruGanesh Graphics",
  },
  description:
    "Custom printing, branding and design — business cards, packaging, signage and more, designed and delivered online.",
  openGraph: {
    type: "website",
    siteName: "GuruGanesh Graphics",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Fetched once here (root layout) rather than in SiteHeader, since the
  // mega menu needs it but SiteHeader is a client component — see
  // components/layout/category-nav.tsx.
  const categories = await getCategories();

  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-paper text-ink-900 antialiased">
        <AuthProvider>
          <CartProvider>
            <SiteHeader categories={categories} />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
