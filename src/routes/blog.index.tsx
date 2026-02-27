import { createFileRoute } from "@tanstack/react-router";
import { BlogPostCard } from "../components/blog-post-card";
import { listPublishedPostsServerFn } from "../lib/repositories/posts";

export const Route = createFileRoute("/blog/")({
  loader: () => listPublishedPostsServerFn(),
  component: BlogIndexPage,
});

function BlogIndexPage() {
  const posts = Route.useLoaderData();

  return (
    <section className="rounded-[2rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.88)] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:p-10">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">Blog</p>
      <h1 className="mt-3 font-[var(--font-serif)] text-5xl text-[var(--color-ink)]">Published writing</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--color-muted)]">
        A manual publishing workflow for essays, notes, and project updates.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {posts.length > 0 ? (
          posts.map((post) => <BlogPostCard key={post.id} post={post} />)
        ) : (
          <div className="rounded-[1.75rem] border border-dashed border-[var(--color-line)] bg-[var(--color-card)] p-6 text-[var(--color-muted)]">
            No published posts are available yet.
          </div>
        )}
      </div>
    </section>
  );
}
