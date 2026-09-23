import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getBlogs } from "@/lib/api/resources";

export const metadata: Metadata = {
  title: "Blog",
  description: "Design tips, product guides and news from GuruGanesh Graphics.",
};

export const revalidate = 300;

function formatDate(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
}

export default async function BlogPage() {
  const posts = await getBlogs(24);

  return (
    <Container className="py-16 sm:py-24">
      <SectionHeading eyebrow="Blog" title="Stories from the print shop" description="Design tips, product guides and news." />

      {posts.length > 0 ? (
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col">
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-paper-muted">
                {post.thumbnail_url ? (
                  <Image
                    src={post.thumbnail_url}
                    alt={post.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105" unoptimized />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-ink-300">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 5h16v14H4z" />
                      <path d="M4 15l4-4 4 4 4-6 4 5" />
                    </svg>
                  </div>
                )}
              </div>
              {formatDate(post.published_at) ? (
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand-600">
                  {formatDate(post.published_at)}
                </p>
              ) : null}
              <p className="mt-1 font-display text-lg font-bold text-ink-900 group-hover:text-brand-700">
                {post.title}
              </p>
              {post.excerpt ? <p className="mt-2 text-sm text-ink-500">{post.excerpt}</p> : null}
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-10 rounded-2xl border border-dashed border-ink-200 py-16 text-center text-ink-500">
          No posts published yet — check back soon.
        </p>
      )}
    </Container>
  );
}
