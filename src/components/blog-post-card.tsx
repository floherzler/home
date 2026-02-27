import { Link } from "@tanstack/react-router";
import { formatDisplayDate } from "../lib/utils/blog";
import type { BlogPost } from "../lib/types";

export function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <article className="group rounded-[1.75rem] border border-[var(--color-line)] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.07)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
      <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.25em] text-[var(--color-muted)]">
        <span>{formatDisplayDate(post.publishedAt)}</span>
        {post.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="rounded-full bg-[var(--color-card)] px-3 py-1 tracking-[0.18em] text-[var(--color-accent)]">
            {tag}
          </span>
        ))}
      </div>
      <h2 className="mt-4 font-[var(--font-serif)] text-3xl leading-tight text-[var(--color-ink)]">
        {post.title}
      </h2>
      <p className="mt-4 text-base leading-7 text-[var(--color-muted)]">{post.excerpt}</p>
      <Link
        to="/blog/$slug"
        params={{ slug: post.slug }}
        className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent)]"
      >
        Read article
        <span aria-hidden="true" className="transition group-hover:translate-x-1">
          →
        </span>
      </Link>
    </article>
  );
}
