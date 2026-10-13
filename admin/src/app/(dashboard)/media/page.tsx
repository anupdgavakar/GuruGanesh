import { adminApiFetch } from "@/lib/api/client";
import type { ApiListResponse, Media } from "@/lib/api/types";
import { UploadMediaForm } from "@/components/media/upload-media-form";
import { MediaCard } from "@/components/media/media-card";
import { PaginationLinks } from "@/components/ui/pagination-links";

export const metadata = { title: "Media Library" };

const PER_PAGE = 20;

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const res = await adminApiFetch<ApiListResponse<Media>>("/api/media");
  const all = res.data;

  const totalPages = Math.max(1, Math.ceil(all.length / PER_PAGE));
  const page = Math.min(totalPages, Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1));
  const items = all.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Media Library</h1>
        <p className="mt-1 text-sm text-ink-500">
          Images, videos and documents uploaded independently of any specific product, blog post, etc.
        </p>
      </div>

      <UploadMediaForm />

      {all.length === 0 ? (
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

      <PaginationLinks
        basePath="/media"
        page={page}
        totalPages={totalPages}
        totalItems={all.length}
        perPage={PER_PAGE}
      />
    </div>
  );
}
