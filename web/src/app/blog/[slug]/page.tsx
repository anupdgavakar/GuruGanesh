import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { getBlogBySlug } from "@/lib/api/resources";

export const revalidate = 300;

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);
  if (!post) return {};

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || undefined,
    openGraph: post.thumbnail_url ? { images: [post.thumbnail_url] } : undefined,
  };
}

function formatDate(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(new Date(value));
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) notFound();

  return (
    <article>
      {post.thumbnail_url ? (
        <div className="relative aspect-[21/9] w-full bg-paper-muted">
          <Image src={post.thumbnail_url} alt={post.title} fill sizes="100vw" priority className="object-cover" unoptimized />
        </div>
      ) : null}

      <Container className="max-w-3xl py-12 sm:py-16">
        <Link href="/blog" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          &larr; Back to blog
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink-500">
          {formatDate(post.published_at) ? <span>{formatDate(post.published_at)}</span> : null}
          {post.author ? (
            <>
              <span aria-hidden>&middot;</span>
              <span>{post.author.name}</span>
            </>
          ) : null}
        </div>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">{post.title}</h1>

        {/*
          Blog content is authored by admins only (role:admin-gated write
          routes), not public submissions, so rendering it as HTML from a
          future rich-text editor is an acceptable trust boundary — this
          isn't user-generated content.
        */}
        <div
          className="prose prose-neutral mt-8 max-w-none prose-headings:font-display prose-a:text-brand-600"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </Container>
    </article>
  );
}
