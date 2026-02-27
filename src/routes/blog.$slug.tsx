import { createFileRoute, notFound } from "@tanstack/react-router";
import { formatDisplayDate } from "../lib/utils/blog";
import { getPublishedPostBySlugServerFn } from "../lib/repositories/posts";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await getPublishedPostBySlugServerFn({ data: { slug: params.slug } });

    if (!post) {
      throw notFound();
    }

    return post;
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const post = Route.useLoaderData();

  return (
    <article className="mx-auto max-w-4xl rounded-[2rem] border border-[var(--color-line)] bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:p-12">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent)]">{formatDisplayDate(post.publishedAt)}</p>
      <h1 className="mt-4 font-[var(--font-serif)] text-5xl leading-tight text-[var(--color-ink)]">{post.title}</h1>
      <p className="mt-5 text-lg leading-8 text-[var(--color-muted)]">{post.excerpt}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-[var(--color-card)] px-3 py-1 text-sm text-[var(--color-accent)]">
            {tag}
          </span>
        ))}
      </div>
      <div className="article-body mt-10" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
    </article>
  );
}
