# GuruGanesh Graphics — web

The public storefront: Next.js 16 (App Router, TypeScript, React 19), built to
consume the `guru_api` Laravel backend (`F:\GuruGanesh\api`).

Built as **Phase 3** of the site rebuild — the foundation only (layout shell,
design tokens, API client, home page). Phase 4 fills in the real
products/services/blog/contact pages this phase only stubs out.

## Getting started

```bash
npm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_URL at your API
npm run dev
```

Open http://localhost:3000. Start the Laravel API alongside it
(`php artisan serve`, defaults to `http://localhost:8000`) to see real data —
without it, the home page still renders using built-in placeholder content
(see "Resilient by design" below).

## Stack

- **Next.js 16** — App Router, Server Components, Turbopack build.
- **TypeScript**, strict mode.
- **Tailwind CSS v4** — CSS-first config; design tokens live in
  `src/app/globals.css` under `@theme`, not a `tailwind.config.js`.
- **Fonts**: self-hosted via `@fontsource` (Inter for body, Poppins for
  headings/display) — not `next/font/google`. This keeps builds and dev
  servers fully offline; there's no runtime dependency on
  `fonts.googleapis.com`.
- `typedRoutes` is on — `next/link` hrefs to internal routes are type-checked.
  A dynamic `href` (built from a string) needs `as Route` from `"next"`; see
  `src/components/sections/hero.tsx` for an example.

## Project structure

```
src/
  app/                  routes (App Router) — layout, home page, stub pages
  components/
    ui/                 generic primitives: Button, Card, Container, Badge…
    layout/              SiteHeader, SiteFooter, nav config
    sections/            page sections: Hero, CategoryGrid, Testimonials…
  lib/
    api/
      client.ts          typed fetch wrapper around the Laravel API
      resources.ts        one function per public endpoint (getSliders, …)
      types.ts             TS types mirroring the API's JSON resources
    utils.ts              cn() class merge helper, formatPrice()
```

## Design tokens — placeholder pending Phase 0

Phase 0 (design & branding, referencing Printo/Vistaprint) hasn't produced
final brand assets yet. `src/app/globals.css` ships a deliberately solid
stand-in palette (a warm "saffron" brand color + deep indigo accent) so the
site doesn't look like unstyled Tailwind defaults while that's pending. Every
component reads color via the `brand-*` / `accent-*` / `ink-*` tokens, never
a hardcoded hex — swapping in the real palette once it exists is a one-file
change to `globals.css`, no component edits needed.

## Resilient by design

Every API call in `lib/api/resources.ts` goes through `apiFetchSafe`, which
returns `[]`/`null` instead of throwing if the API is unreachable (e.g. you
haven't started `php artisan serve` yet, or CORS isn't configured for this
origin). Components render sensible placeholder content in that case (see
`CategoryGrid`) rather than crashing the page — this was verified by building
and smoke-testing this app with no API running at all.

## Connecting to the API

Set `NEXT_PUBLIC_API_URL` in `.env.local` (see `.env.example`). The Laravel
API's CORS config (`guru_api/.env.example` → `CORS_ALLOWED_ORIGINS`) already
allow-lists `http://localhost:3000` for local development.

## Scripts

- `npm run dev` — dev server (Turbopack)
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint
- `npx tsc --noEmit` — type-check only
