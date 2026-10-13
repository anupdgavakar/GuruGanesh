/**
 * Shows a blog post's body exactly as it was written in the admin editor:
 * headings, bold/italic, lists, quotes, links and pictures.
 *
 * The HTML is cleaned by the API before it is saved (only simple writing
 * tags survive), and only admin/staff can write posts, so rendering it as
 * HTML here is safe.
 *
 * Styling is spelled out (not left to defaults) so it matches the editor and
 * the shop's colours: orange accents on quotes and bullets, maroon links.
 */
const STYLES = [
  "prose prose-lg prose-neutral max-w-none",
  // text
  "text-ink-700 prose-p:leading-8 prose-p:my-5",
  "prose-strong:font-semibold prose-strong:text-ink-900 prose-em:italic",
  // headings
  "prose-headings:font-display prose-headings:text-ink-900 prose-headings:tracking-tight",
  "prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-2xl prose-h2:font-bold sm:prose-h2:text-3xl",
  "prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-xl prose-h3:font-semibold",
  "prose-h4:mt-6 prose-h4:mb-2 prose-h4:text-lg prose-h4:font-semibold",
  // links
  "prose-a:font-medium prose-a:text-accent-600 prose-a:underline prose-a:decoration-brand-300 prose-a:underline-offset-4 hover:prose-a:text-brand-600",
  // lists
  "prose-ul:my-5 prose-ul:list-disc prose-ul:pl-6 prose-ol:my-5 prose-ol:list-decimal prose-ol:pl-6",
  "prose-li:my-2 prose-li:pl-1 prose-li:marker:text-brand-500",
  // quote
  "prose-blockquote:my-8 prose-blockquote:rounded-r-xl prose-blockquote:border-l-4 prose-blockquote:border-brand-400",
  "prose-blockquote:bg-paper-muted prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:text-lg prose-blockquote:font-medium prose-blockquote:italic prose-blockquote:text-ink-900",
  // pictures and divider
  "prose-img:mx-auto prose-img:my-8 prose-img:max-h-[28rem] prose-img:w-auto prose-img:max-w-full prose-img:rounded-2xl",
  "prose-hr:my-10 prose-hr:border-ink-100",
].join(" ");

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * Older posts were saved as plain text (no tags), which a browser shows as
 * one run-together block. Turn that into headings, paragraphs and lists:
 *   "1. Business Printing"           -> small heading
 *   "Why Choose Us?" (short, no stop) -> heading
 *   "Label: a full sentence."        -> bullet with a bold label
 * Posts already written in the styled editor contain tags and are untouched.
 */
export function plainTextToHtml(text: string): string {
  const blocks = text
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  const out: string[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) out.push(`<ul>${list.join("")}</ul>`);
    list = [];
  };

  blocks.forEach((block, i) => {
    const singleLine = !/\r?\n/.test(block);
    const bullet = singleLine && /[.!?]$/.test(block) ? block.match(/^([^.:?!]{2,45}):\s+(.{30,})$/) : null;
    if (bullet) {
      list.push(`<li><strong>${escapeHtml(bullet[1])}:</strong> ${escapeHtml(bullet[2])}</li>`);
      return;
    }
    flush();

    const hasNext = i < blocks.length - 1;
    const short = block.length <= 90;
    if (singleLine && short && hasNext && /^\d{1,2}[.)]\s+\S/.test(block)) {
      out.push(`<h3>${escapeHtml(block)}</h3>`);
    } else if (singleLine && short && hasNext && !/[.,;:!]$/.test(block) && !(block.endsWith("?") && block.length > 60)) {
      out.push(`<h2>${escapeHtml(block)}</h2>`);
    } else {
      out.push(`<p>${escapeHtml(block).replace(/\r?\n/g, "<br>")}</p>`);
    }
  });
  flush();

  return out.join("\n");
}

export function BlogContent({ html }: { html: string }) {
  const body = html.includes("<") ? html : plainTextToHtml(html);
  return <div className={STYLES} dangerouslySetInnerHTML={{ __html: body }} />;
}
