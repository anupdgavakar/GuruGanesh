import type { Metadata } from "next";
// Self-hosted via @fontsource (npm), not next/font/google — see web/src/app/layout.tsx
// for why (fonts.googleapis.com is blocked in this sandbox and this app should
// never depend on it at runtime either). Font stacks are defined in
// globals.css (--font-sans / --font-display).
import "@fontsource-variable/inter";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "GuruGanesh Admin",
    template: "%s | GuruGanesh Admin",
  },
  description: "Admin panel for GuruGanesh Graphics — manage the catalog, content, media and inquiries.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-ink-50 text-ink-900 antialiased">{children}</body>
    </html>
  );
}
