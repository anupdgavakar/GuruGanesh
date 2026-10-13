"use client";

import { useRef, useState } from "react";
import { useCart, type CartItem } from "@/lib/cart/cart-context";
import { uploadDesignFile, DesignFileUploadError } from "@/lib/api/design-files";
import type { DesignDeliveryMethod } from "@/lib/api/types";

const ALLOWED_EXTENSIONS = [".pdf", ".ai", ".eps", ".psd", ".cdr", ".png", ".jpg", ".jpeg"];
const MAX_BYTES = 75 * 1024 * 1024; // matches DesignFileUploadRequest::MAX_KILOBYTES on the API

type UploadState = { status: "idle" } | { status: "uploading"; fraction: number } | { status: "error"; message: string };

function fileExtension(name: string) {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

const METHODS: { value: DesignDeliveryMethod; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: "link",
    label: "Paste a link",
    description: "Already on Google Drive, Dropbox or similar? Paste the shareable link — nothing to upload.",
    icon: (
      <path
        d="M9.5 14.5l5-5M8 11l-2 2a3 3 0 004.24 4.24l2-2M16 13l2-2a3 3 0 00-4.24-4.24l-2 2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    value: "email",
    label: "Email it to us",
    description: "Send the file from your own email instead — we'll match it to this order once it arrives.",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    value: "upload",
    label: "Upload a file",
    description: "Send it straight from your device — PDF, AI, EPS, PSD, CDR, PNG or JPG, up to 75MB.",
    icon: (
      <>
        <path d="M12 16V4M7 9l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
];

/**
 * Per cart-line "how are you getting us your artwork" picker — three ways,
 * none required: paste a shareable link (Drive/Dropbox/etc, no file ever
 * touches our server), tell us you'll email it separately (to the
 * admin-configurable design_submission_email — see Settings), or upload
 * directly (which actually transfers the file, so it's capped and pointed
 * at the API's private storage; see design-files.ts / MAX_BYTES above).
 *
 * A File object can never be written into `item` — the cart is plain JSON
 * in localStorage — so "upload" fires the request the moment a file is
 * chosen and only the resulting path is ever stored on the cart item.
 */
export function DesignPicker({ item, designEmail }: { item: CartItem; designEmail: string }) {
  const { setItemDesign } = useCart();
  const hasDesign = Boolean(item.designDeliveryMethod);
  const [expanded, setExpanded] = useState(false);
  const [pendingMethod, setPendingMethod] = useState<DesignDeliveryMethod | null>(item.designDeliveryMethod ?? null);
  const [linkValue, setLinkValue] = useState(item.designReference ?? "");
  const [upload, setUpload] = useState<UploadState>({ status: "idle" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mailtoHref = `mailto:${designEmail}?subject=${encodeURIComponent(`Design file — ${item.name}`)}&body=${encodeURIComponent(
    `Hi, I'm attaching the design file for "${item.name}" (qty ${item.quantity}). Please match this to my order once it's submitted.`,
  )}`;

  function handleLinkSave() {
    const trimmed = linkValue.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
    } catch {
      setUpload({ status: "error", message: "That doesn't look like a valid link — check it starts with https://." });
      return;
    }
    setUpload({ status: "idle" });
    setItemDesign(item.productId, { method: "link", reference: trimmed });
    setExpanded(false);
  }

  function handleEmailConfirm() {
    setItemDesign(item.productId, { method: "email" });
    setExpanded(false);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file after an error
    if (!file) return;

    if (!ALLOWED_EXTENSIONS.includes(fileExtension(file.name))) {
      setUpload({ status: "error", message: `That file type isn't supported. Use: ${ALLOWED_EXTENSIONS.join(", ")}.` });
      return;
    }
    if (file.size > MAX_BYTES) {
      setUpload({
        status: "error",
        message: `That file is ${formatBytes(file.size)} — over our 75MB upload limit. Paste a share link instead for files this large.`,
      });
      return;
    }

    setUpload({ status: "uploading", fraction: 0 });
    try {
      const result = await uploadDesignFile(file, (fraction) => setUpload({ status: "uploading", fraction }));
      setItemDesign(item.productId, {
        method: "upload",
        reference: result.design_reference,
        originalFilename: result.design_original_filename,
      });
      setUpload({ status: "idle" });
      setExpanded(false);
    } catch (err) {
      setUpload({
        status: "error",
        message: err instanceof DesignFileUploadError ? err.message : "Upload failed — please try again.",
      });
    }
  }

  function summaryLine() {
    if (item.designDeliveryMethod === "link") return "Link added";
    if (item.designDeliveryMethod === "email") return `You'll email this to ${designEmail}`;
    if (item.designDeliveryMethod === "upload") return item.designOriginalFilename ?? "File uploaded";
    return null;
  }

  if (hasDesign && !expanded) {
    return (
      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-brand-100 bg-brand-50 px-3 py-2 text-sm">
        <span className="flex items-center gap-2 text-brand-800">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
            <path d="M4 12.5l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="truncate">{summaryLine()}</span>
        </span>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="shrink-0 font-semibold text-brand-700 hover:underline"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-ink-100 bg-paper-muted p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Design file (optional)</p>
        {hasDesign ? (
          <button type="button" onClick={() => setExpanded(false)} className="text-xs text-ink-400 hover:text-ink-700">
            Cancel
          </button>
        ) : null}
      </div>
      <p className="mt-1 text-xs text-ink-500">Three ways to get us your artwork — pick whichever&apos;s easiest:</p>

      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {METHODS.map((m, i) => (
          <button
            key={m.value}
            type="button"
            onClick={() => {
              setPendingMethod(m.value);
              setUpload({ status: "idle" });
              if (m.value === "upload") fileInputRef.current?.click();
            }}
            className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors ${
              pendingMethod === m.value
                ? "border-brand-400 bg-brand-50"
                : "border-ink-200 bg-white hover:border-ink-300"
            }`}
          >
            <span
              className={`flex items-center gap-1.5 text-xs font-semibold ${
                pendingMethod === m.value ? "text-brand-700" : "text-ink-800"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  pendingMethod === m.value ? "bg-brand-500 text-white" : "bg-ink-100 text-ink-500"
                }`}
              >
                {i + 1}
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0">
                {m.icon}
              </svg>
              {m.label}
            </span>
            <span className="text-[11px] leading-snug text-ink-500">{m.description}</span>
          </button>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_EXTENSIONS.join(",")}
        onChange={handleFileChange}
        className="hidden"
      />

      {pendingMethod === "link" ? (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="url"
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            placeholder="https://drive.google.com/..."
            className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-300 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
          <button
            type="button"
            onClick={handleLinkSave}
            className="shrink-0 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Save link
          </button>
        </div>
      ) : null}

      {pendingMethod === "email" ? (
        <div className="mt-3 rounded-lg bg-white p-3 text-sm text-ink-700">
          <p>
            Email your design file to{" "}
            <a href={`mailto:${designEmail}`} className="font-semibold text-accent-600 hover:underline">
              {designEmail}
            </a>{" "}
            and mention this product — or use the button below to open a pre-filled email.
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <a
              href={mailtoHref}
              className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 hover:border-ink-300"
            >
              Open email draft
            </a>
            <button
              type="button"
              onClick={handleEmailConfirm}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
            >
              Got it, I&apos;ll email this
            </button>
          </div>
        </div>
      ) : null}

      {pendingMethod === "upload" && upload.status === "uploading" ? (
        <div className="mt-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full bg-brand-500 transition-all"
              style={{ width: `${Math.round(upload.fraction * 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-ink-500">Uploading… {Math.round(upload.fraction * 100)}%</p>
        </div>
      ) : null}

      {upload.status === "error" ? <p className="mt-2 text-xs text-danger">{upload.message}</p> : null}
    </div>
  );
}
