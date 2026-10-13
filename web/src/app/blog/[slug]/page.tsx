import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageTitle } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { BlogContent } from "@/components/blog/blog-content";
import { getBlogBySlug } from "@/lib/api/resources";

export const revalidate = 30;

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);
  if (!post) return {};

  return {
    title: pageTitle(post.meta_title || post.title),
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

        {post.excerpt ? <p className="mt-4 text-lg leading-8 text-ink-500">{post.excerpt}</p> : null}

        {post.thumbnail_url ? (
          // Shown whole (never cropped) at a moderate size, centred.
          <figure className="mt-8 flex justify-center">
            <Image
              src={post.thumbnail_url}
              alt={post.title}
              width={1200}
              height={800}
              sizes="(min-width: 640px) 576px, 100vw"
              priority
              className="h-auto max-h-[26rem] w-auto max-w-full rounded-2xl shadow-card"
            />
          </figure>
        ) : null}

        <div className="mt-8 border-t border-ink-100 pt-8">
          <BlogContent html={post.content} />
        </div>
      </Container>
    </article>
  );
}
