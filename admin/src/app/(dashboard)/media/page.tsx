import { adminApiFetch } from "@/lib/api/client";
import type { ApiListResponse, Media } from "@/lib/api/types";
import { UploadMediaForm } from "@/components/media/upload-media-form";
import { MediaCard } from "@/components/media/media-card";

export const metadata = { title: "Media Library" };

export default async function MediaPage() {
  const res = await adminApiFetch<ApiListResponse<Media>>("/api/media");
  const items = res.data;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Media Library</h1>
        <p className="mt-1 text-sm text-ink-500">
          Images, videos and documents uploaded independently of any specific product, blog post, etc.
        </p>
      </div>

      <UploadMediaForm />

      {items.length === 0 ? (
        <p className="rounded-card border border-dashed border-ink-200 bg-white p-8 text-center text-sm text-ink-500">
          No media uploaded yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((item) => (
            <MediaCard key={item.id} media={item} />
          ))}
        </div>
      )}
    </div>
  );
}
