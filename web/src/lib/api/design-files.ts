import { API_URL } from "./client";
import type { DesignFileUploadResult } from "./types";

export class DesignFileUploadError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "DesignFileUploadError";
  }
}

/**
 * Uploads a customer's design file to POST /api/design-files, reporting
 * progress as it goes. This deliberately uses XMLHttpRequest rather than
 * `fetch` (which apiFetch in client.ts wraps) — fetch has no upload
 * progress events, and a multi-hundred-MB file with no progress bar looks
 * frozen/broken to the person waiting on it.
 */
export function uploadDesignFile(file: File, onProgress?: (fraction: number) => void): Promise<DesignFileUploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}/api/design-files`);
    xhr.responseType = "json";

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(event.loaded / event.total);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const body = xhr.response as { data?: DesignFileUploadResult };
        if (body?.data) {
          resolve(body.data);
        } else {
          reject(new DesignFileUploadError("The server didn't return an upload reference.", xhr.status));
        }
        return;
      }

      const body = xhr.response as { message?: string; errors?: Record<string, string[]> } | null;
      const fieldError = body?.errors?.file?.[0];
      reject(new DesignFileUploadError(fieldError ?? body?.message ?? "Upload failed.", xhr.status));
    };

    xhr.onerror = () => reject(new DesignFileUploadError("Couldn't reach the server to upload the file.", 0));

    const form = new FormData();
    form.append("file", file);
    xhr.send(form);
  });
}
