// A handful of distinct glyphs keyed by keyword so common category names get
// a recognizable icon instead of every tile showing the same placeholder
// square — falls back to the generic square for anything unmatched. Shared
// between the homepage category grid and the /products catalog index so
// both surfaces render category tiles identically.
const iconPaths: { match: RegExp; path: React.ReactNode }[] = [
  {
    match: /card/i,
    path: (
      <>
        <rect x="2.5" y="6" width="19" height="13" rx="2" />
        <path d="M2.5 10.5h19" />
        <path d="M6 14.5h5" />
      </>
    ),
  },
  {
    match: /flyer|brochure|leaflet/i,
    path: (
      <>
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M15 3v4h4" />
        <path d="M9 12h6M9 16h6" />
      </>
    ),
  },
  {
    match: /packag/i,
    path: (
      <>
        <path d="M3 8l9-5 9 5-9 5-9-5z" />
        <path d="M3 8v9l9 5 9-5V8" />
        <path d="M12 13v9" />
      </>
    ),
  },
  {
    match: /sign|banner/i,
    path: (
      <>
        <path d="M4 4v17" />
        <path d="M4 4h13l-2.5 4L17 12H4" />
      </>
    ),
  },
  {
    match: /sticker|label/i,
    path: (
      <>
        <path d="M13 3L3 13v5a3 3 0 003 3h5l10-10z" />
        <path d="M14 8l2 2" />
        <circle cx="8.5" cy="15.5" r="1" />
      </>
    ),
  },
  {
    match: /apparel|shirt|clothing/i,
    path: (
      <>
        <path d="M8 3l4 2 4-2 4 4-3 3v11H7V10L4 7l4-4z" />
      </>
    ),
  },
];

const fallbackPath = (
  <>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M3 9h18M9 21V9" />
  </>
);

export function iconFor(name: string) {
  return iconPaths.find((entry) => entry.match.test(name))?.path ?? fallbackPath;
}
