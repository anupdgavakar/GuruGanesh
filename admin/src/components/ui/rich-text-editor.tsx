"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A small writing box with formatting buttons (headings, bold, italic,
 * underline, lists, quote, link). What you see is what the website shows.
 * The finished text is kept as simple HTML in a hidden field named `name`,
 * so the form saves it exactly like any other field. The API cleans it again
 * on save, so only safe writing tags are ever stored.
 *
 * No extra packages: it uses the browser's own editing support.
 */

const ALLOWED = new Set(["P", "BR", "H2", "H3", "H4", "STRONG", "EM", "U", "UL", "OL", "LI", "BLOCKQUOTE", "A", "HR"]);
const RENAME: Record<string, string> = { B: "STRONG", I: "EM", H1: "H2", H5: "H4", H6: "H4" };

/** Pasted text from Word, Google Docs or a web page: keep headings/bold/lists/links, drop styles and junk. */
function cleanHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");

  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return (node.textContent ?? "").replace(/ /g, " ").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c] ?? c);
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const el = node as HTMLElement;
    let tag = el.tagName;
    if (["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "NOSCRIPT", "SVG", "FORM"].includes(tag)) return "";

    const inner = Array.from(el.childNodes).map(walk).join("");
    tag = RENAME[tag] ?? tag;

    // Google Docs wraps everything in <b style="font-weight:normal"> — don't turn that into bold.
    if (el.tagName === "B" && el.style.fontWeight === "normal") return inner;

    if (!ALLOWED.has(tag)) return inner;
    const name = tag.toLowerCase();
    if (name === "br" || name === "hr") return `<${name}>`;
    if (name === "a") {
      const href = el.getAttribute("href") ?? "";
      return /^(https?:|mailto:|tel:|\/|#)/i.test(href) ? `<a href="${href.replace(/"/g, "&quot;")}">${inner}</a>` : inner;
    }
    return `<${name}>${inner}</${name}>`;
  };

  return Array.from(doc.body.childNodes).map(walk).join("");
}

/** Old posts may be plain text: show them as paragraphs. */
function toInitialHtml(value: string): string {
  if (!value.trim()) return "";
  if (/<[a-z][\s\S]*>/i.test(value)) return value;
  return value
    .split(/\n{2,}/)
    .map((p) => `<p>${p.trim().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function Btn({
  label,
  title,
  onClick,
  wide,
}: {
  label: React.ReactNode;
  title: string;
  onClick: () => void;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      // mousedown keeps the text selection; click would steal it.
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`h-8 rounded-md px-2 text-sm text-ink-700 hover:bg-ink-100 ${wide ? "min-w-[3.25rem]" : "min-w-8"}`}
    >
      {label}
    </button>
  );
}

export function RichTextEditor({
  name,
  defaultValue,
  required,
}: {
  name: string;
  defaultValue: string;
  required?: boolean;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const [html, setHtml] = useState(() => toInitialHtml(defaultValue));
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const savedRange = useRef<Range | null>(null);

  // The hidden form field mirrors the text. It is controlled (value=...), so React's
  // automatic form reset after saving can never blank it. An empty box is truly empty.
  const hasText = html.replace(/<[^>]*>/g, "").trim().length > 0 || /<(img|hr)\b/i.test(html);
  const hiddenValue = hasText ? html : "";

  useEffect(() => {
    hiddenRef.current?.setCustomValidity(required && !hasText ? "Please write the post content." : "");
  }, [hasText, required]);

  function sync() {
    if (editorRef.current) setHtml(editorRef.current.innerHTML);
  }

  function run(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand("defaultParagraphSeparator", false, "p");
    document.execCommand(command, false, value);
    sync();
  }

  function block(tag: string) {
    run("formatBlock", tag);
  }

  function openLink() {
    const sel = window.getSelection();
    savedRange.current = sel && sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null;
    setLinkUrl("https://");
    setLinkOpen(true);
  }

  function applyLink() {
    const url = linkUrl.trim();
    setLinkOpen(false);
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (savedRange.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
    if (url && url !== "https://") run("createLink", url);
  }

  function onPaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const htmlData = e.clipboardData.getData("text/html");
    const text = e.clipboardData.getData("text/plain");
    const cleaned = htmlData
      ? cleanHtml(htmlData)
      : text
          .split(/\n{2,}/)
          .map((p) => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>")}</p>`)
          .join("");
    document.execCommand("insertHTML", false, cleaned);
    sync();
  }

  function switchMode(next: "visual" | "html") {
    if (next === mode) return;
    setMode(next);
  }

  // The writing box is removed while in HTML view, so refill it when it comes back.
  useEffect(() => {
    if (mode === "visual" && editorRef.current) editorRef.current.innerHTML = html;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <div className="rounded-lg border border-ink-200 bg-white focus-within:border-accent-500 focus-within:ring-2 focus-within:ring-accent-100">
      <input ref={hiddenRef} type="text" name={name} value={hiddenValue} onChange={() => {}} tabIndex={-1} aria-hidden className="sr-only" />

      <div className="flex flex-wrap items-center gap-0.5 border-b border-ink-200 bg-ink-50 px-2 py-1.5">
        {mode === "visual" ? (
          <>
            <Btn label="Text" title="Normal paragraph" onClick={() => block("P")} wide />
            <Btn label={<span className="font-semibold">H2</span>} title="Big heading" onClick={() => block("H2")} />
            <Btn label={<span className="font-semibold">H3</span>} title="Smaller heading" onClick={() => block("H3")} />
            <span className="mx-1 h-5 w-px bg-ink-200" />
            <Btn label={<b>B</b>} title="Bold" onClick={() => run("bold")} />
            <Btn label={<i>I</i>} title="Italic" onClick={() => run("italic")} />
            <Btn label={<u>U</u>} title="Underline" onClick={() => run("underline")} />
            <span className="mx-1 h-5 w-px bg-ink-200" />
            <Btn label="• List" title="Bullet list" onClick={() => run("insertUnorderedList")} wide />
            <Btn label="1. List" title="Numbered list" onClick={() => run("insertOrderedList")} wide />
            <Btn label="❝" title="Quote" onClick={() => block("BLOCKQUOTE")} />
            <Btn label="Link" title="Add a link to the selected words" onClick={openLink} wide />
            <Btn label="Unlink" title="Remove link" onClick={() => run("unlink")} wide />
            <Btn label="Clear" title="Remove formatting from the selection" onClick={() => run("removeFormat")} wide />
          </>
        ) : (
          <span className="px-2 text-xs text-ink-500">HTML view — for advanced edits.</span>
        )}
        <div className="ml-auto flex gap-0.5 text-xs">
          <button
            type="button"
            onClick={() => switchMode("visual")}
            className={`h-8 rounded-md px-2.5 ${mode === "visual" ? "bg-white font-medium text-ink-900 shadow-sm" : "text-ink-600 hover:bg-ink-100"}`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => switchMode("html")}
            className={`h-8 rounded-md px-2.5 ${mode === "html" ? "bg-white font-medium text-ink-900 shadow-sm" : "text-ink-600 hover:bg-ink-100"}`}
          >
            HTML
          </button>
        </div>
      </div>

      {linkOpen && mode === "visual" ? (
        <div className="flex items-center gap-2 border-b border-ink-200 bg-amber-50 px-3 py-2">
          <label htmlFor={`${name}-link`} className="text-xs text-ink-700">
            Link address
          </label>
          <input
            id={`${name}-link`}
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
            }}
            className="h-8 min-w-0 flex-1 rounded-md border border-ink-200 px-2 text-sm outline-none focus:border-accent-500"
            autoFocus
          />
          <button type="button" onClick={applyLink} className="h-8 rounded-md bg-accent-600 px-3 text-sm font-medium text-white hover:bg-accent-700">
            Add
          </button>
          <button type="button" onClick={() => setLinkOpen(false)} className="h-8 rounded-md px-2 text-sm text-ink-600 hover:bg-ink-100">
            Cancel
          </button>
        </div>
      ) : null}

      {mode === "visual" ? (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Post content"
          onInput={sync}
          onBlur={sync}
          onPaste={onPaste}
          className="min-h-72 max-h-[32rem] overflow-y-auto px-4 py-3 text-[15px] leading-7 text-ink-800 outline-none [&_a]:text-accent-700 [&_a]:underline [&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-brand-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h4]:mt-3 [&_h4]:font-semibold [&_li]:my-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6"
        />
      ) : (
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          spellCheck={false}
          rows={16}
          className="block w-full resize-y rounded-b-lg px-4 py-3 font-mono text-xs leading-6 text-ink-800 outline-none"
        />
      )}
    </div>
  );
}
