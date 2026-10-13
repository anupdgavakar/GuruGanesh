/**
 * Shrinks a big photo in the browser before it is uploaded, so it does not
 * run into the web server's upload limits (PHP allows only 2 MB per file out
 * of the box). Quality is kept: the picture is only scaled down when it is
 * bigger than MAX_EDGE px (twice what the shop ever shows), re-saved at high
 * quality, and if it is still too heavy for a safe upload it is stepped down
 * a little at a time until it fits. Anything unsupported (GIF, SVG, animated,
 * errors) is returned untouched. The API repeats the same optimisation on its
 * side.
 */

const MAX_EDGE = 2400;
/** Aim to be at or under this, so the file always fits PHP's default 2 MB upload limit. */
export const TARGET_BYTES = 1.8 * 1024 * 1024;
/** Pictures under this size that also fit MAX_EDGE are not touched. */
const SKIP_BELOW_BYTES = 400 * 1024;
const MUST_BE_SMALLER_THAN = 0.95;

/** Tried in order until the picture fits TARGET_BYTES; the first step is the "same quality" one. */
const STEPS: { edge: number; quality: number }[] = [
  { edge: MAX_EDGE, quality: 0.88 },
  { edge: MAX_EDGE, quality: 0.82 },
  { edge: 2000, quality: 0.82 },
  { edge: 1600, quality: 0.8 },
];

const SUPPORTED = ["image/jpeg", "image/png", "image/webp"];

export type CompressResult = {
  file: File;
  before: number;
  after: number;
  changed: boolean;
  /** True if the file is still above TARGET_BYTES (so a strict server may refuse it). */
  stillLarge: boolean;
};

function renamed(name: string, extension: string) {
  const base = name.includes(".") ? name.slice(0, name.lastIndexOf(".")) : name;
  return `${base}.${extension}`;
}

async function hasTransparency(bitmap: ImageBitmap): Promise<boolean> {
  // Sample a downscaled copy; a transparent logo always has transparent pixels at this scale.
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return true;
  ctx.drawImage(bitmap, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 250) return true;
  }
  return false;
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

type Encoded = { blob: Blob; type: string; extension: string };

async function encode(
  bitmap: ImageBitmap,
  edge: number,
  quality: number,
  kind: "jpeg" | "webp" | "png",
): Promise<Encoded | null> {
  const longest = Math.max(bitmap.width, bitmap.height);
  const ratio = longest > edge ? edge / longest : 1;
  const width = Math.max(1, Math.round(bitmap.width * ratio));
  const height = Math.max(1, Math.round(bitmap.height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (kind === "jpeg") {
    // Photos: paint on white first so nothing can turn black.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(bitmap, 0, 0, width, height);

  const type = kind === "jpeg" ? "image/jpeg" : kind === "webp" ? "image/webp" : "image/png";
  const extension = kind === "jpeg" ? "jpg" : kind;
  const blob = await toBlob(canvas, type, kind === "png" ? undefined : quality);

  return blob && blob.size > 0 ? { blob, type, extension } : null;
}

export async function compressImage(file: File): Promise<CompressResult> {
  const unchanged: CompressResult = {
    file,
    before: file.size,
    after: file.size,
    changed: false,
    stillLarge: file.size > TARGET_BYTES,
  };

  if (!SUPPORTED.includes(file.type) || typeof createImageBitmap !== "function") return unchanged;

  try {
    // "from-image" applies the camera's rotation note so photos are not saved sideways.
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const longest = Math.max(bitmap.width, bitmap.height);
    const needsResize = longest > MAX_EDGE;

    if (!needsResize && file.size < SKIP_BELOW_BYTES) {
      bitmap.close();
      return unchanged;
    }

    const transparent = file.type !== "image/jpeg" && (await hasTransparency(bitmap));
    const kind: "jpeg" | "webp" | "png" = transparent
      ? file.type === "image/webp"
        ? "webp"
        : "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpeg";

    // Step down until the picture fits; keep the best attempt if none does.
    let best: Encoded | null = null;
    for (const step of STEPS) {
      const attempt = await encode(bitmap, step.edge, step.quality, kind);
      if (!attempt) continue;
      if (!best || attempt.blob.size < best.blob.size) best = attempt;
      if (attempt.blob.size <= TARGET_BYTES) break;
    }

    // Transparent PNGs can stay large (PNG can't be squeezed lossily). WebP keeps
    // transparency at a fraction of the size, so use it when PNG won't fit.
    if (kind === "png" && (!best || best.blob.size > TARGET_BYTES)) {
      for (const step of [{ edge: MAX_EDGE, quality: 0.9 }, { edge: 2000, quality: 0.85 }]) {
        const attempt = await encode(bitmap, step.edge, step.quality, "webp");
        if (!attempt) continue;
        if (!best || attempt.blob.size < best.blob.size) best = attempt;
        if (attempt.blob.size <= TARGET_BYTES) break;
      }
    }
    bitmap.close();

    if (!best) return unchanged;

    // Keep the original unless clearly better — but a file that is too big to upload is always replaced.
    const clearlySmaller = best.blob.size < file.size * MUST_BE_SMALLER_THAN;
    const resizedAndSmaller = needsResize && best.blob.size < file.size;
    const originalTooBig = file.size > TARGET_BYTES && best.blob.size < file.size;
    if (!clearlySmaller && !resizedAndSmaller && !originalTooBig) return unchanged;

    const out = new File([best.blob], renamed(file.name, best.extension), { type: best.type, lastModified: Date.now() });
    return { file: out, before: file.size, after: out.size, changed: true, stillLarge: out.size > TARGET_BYTES };
  } catch {
    return unchanged;
  }
}

export function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export type OptimizeOutcome = { message: string | null; warning: string | null };

/**
 * Compresses every picture in an <input type="file"> in place (replacing its
 * file list). Returns a short note about what was saved, and a warning if a
 * file is still too large to upload safely.
 */
export async function optimizeInputFiles(input: HTMLInputElement): Promise<OptimizeOutcome> {
  const files = Array.from(input.files ?? []);
  if (files.length === 0) return { message: null, warning: null };

  const results = await Promise.all(files.map((f) => compressImage(f)));

  if (results.some((r) => r.changed)) {
    const transfer = new DataTransfer();
    results.forEach((r) => transfer.items.add(r.file));
    input.files = transfer.files;
  }

  const big = results.find((r) => r.stillLarge);
  const warning = big
    ? `This file is still ${formatBytes(big.after)}. If it does not save, choose a smaller picture or raise upload_max_filesize in php.ini.`
    : null;

  if (!results.some((r) => r.changed)) return { message: null, warning };

  const before = results.reduce((sum, r) => sum + r.before, 0);
  const after = results.reduce((sum, r) => sum + r.after, 0);
  return {
    message: `Compressed before upload: ${formatBytes(before)} → ${formatBytes(after)} (same visible quality).`,
    warning,
  };
}
