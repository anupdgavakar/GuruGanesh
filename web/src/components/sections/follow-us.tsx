import { SITE_FACEBOOK_URL, SITE_INSTAGRAM_URL } from "@/lib/site";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.8c0-.9.3-1.5 1.6-1.5h1.7V3.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.3H7.5V13h2.8v8h3.2z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 fill-none stroke-current"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" className="fill-current" />
    </svg>
  );
}

const socials = [
  { name: "Facebook", handle: "Guru Ganesh Graphics", href: SITE_FACEBOOK_URL, icon: <FacebookIcon /> },
  { name: "Instagram", handle: "@guruganeshltr", href: SITE_INSTAGRAM_URL, icon: <InstagramIcon /> },
];

/** "Follow us" appeal with links to the shop's social media pages. */
export function FollowUs() {
  return (
    <section
      aria-labelledby="follow-us"
      className="mt-16 rounded-[var(--radius-card)] border border-brand-100 bg-brand-50 px-6 py-10 text-center sm:px-10"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Stay connected</p>
      <h2 id="follow-us" className="mt-2 text-2xl font-semibold text-ink-900 sm:text-3xl">
        Follow us on social media
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-ink-700">
        See our latest work, festival offers and new products first. Follow Guru Ganesh Graphics on Facebook and
        Instagram, and send us a message anytime!
      </p>

      <ul className="mt-8 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
        {socials.map((s) => (
          <li key={s.name}>
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-brand-100 bg-white px-5 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white transition-colors group-hover:bg-brand-600">
                {s.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink-900">Follow on {s.name}</span>
                <span className="block truncate text-sm text-ink-500">{s.handle}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
