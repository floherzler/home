import { useNavigate } from "@tanstack/react-router";
import { AppwriteException } from "appwrite";
import { useMemo, useState } from "react";
import { BlogEditor } from "./blog-editor";
import { savePostClient } from "../lib/repositories/posts";
import { normalizeTags, slugify } from "../lib/utils/blog";
import type { BlogPost, PostStatus } from "../lib/types";

type PostFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  status: PostStatus;
  tags: string;
  contentJson: string;
  contentHtml: string;
  publishedAt: string;
};

const emptyDocumentJson = JSON.stringify([
  {
    id: "intro",
    type: "paragraph",
    content: [],
  },
]);

const buildInitialState = (post?: BlogPost): PostFormValues => ({
  title: post?.title ?? "",
  slug: post?.slug ?? "",
  excerpt: post?.excerpt ?? "",
  coverImageUrl: post?.coverImageUrl ?? "",
  status: post?.status ?? "draft",
  tags: post?.tags.join(", ") ?? "",
  contentJson: post?.contentJson ?? emptyDocumentJson,
  contentHtml: post?.contentHtml ?? "",
  publishedAt: post?.publishedAt ? post.publishedAt.slice(0, 16) : "",
});

export function PostForm({ post }: { post?: BlogPost }) {
  const navigate = useNavigate();
  const [values, setValues] = useState<PostFormValues>(() => buildInitialState(post));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const heading = post ? "Edit article" : "New article";

  const plainPublishedAt = useMemo(() => {
    if (!values.publishedAt) {
      return undefined;
    }

    return new Date(values.publishedAt).toISOString();
  }, [values.publishedAt]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const result = await savePostClient({
        id: post?.id,
        title: values.title,
        slug: values.slug,
        excerpt: values.excerpt,
        coverImageUrl: values.coverImageUrl,
        status: values.status,
        tags: normalizeTags(values.tags),
        contentJson: values.contentJson,
        contentHtml: values.contentHtml,
        publishedAt: plainPublishedAt,
      });

      void navigate({ to: "/admin/blog/$id/edit", params: { id: result.id } });
    } catch (cause) {
      if (cause instanceof AppwriteException) {
        setError(cause.message);
      } else if (cause instanceof Error) {
        setError(cause.message);
      } else {
        setError("Unable to save the post.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-[2rem] border border-[var(--color-line)] bg-[rgba(255,255,255,0.9)] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:p-8">
      <div className="flex flex-col gap-3 border-b border-[var(--color-line)] pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-muted)]">Editorial workspace</p>
          <h1 className="mt-2 font-[var(--font-serif)] text-4xl text-[var(--color-ink)]">{heading}</h1>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save post"}
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <label className="block text-sm">
            <span className="mb-2 block text-[var(--color-muted)]">Title</span>
            <input
              value={values.title}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  title: event.target.value,
                  slug: current.slug ? current.slug : slugify(event.target.value),
                }))
              }
              className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none ring-0 focus:border-[var(--color-accent)]"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-2 block text-[var(--color-muted)]">Excerpt</span>
            <textarea
              value={values.excerpt}
              onChange={(event) => setValues((current) => ({ ...current, excerpt: event.target.value }))}
              rows={4}
              className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none ring-0 focus:border-[var(--color-accent)]"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-2 block text-[var(--color-muted)]">Body</span>
            <BlogEditor
              initialContentJson={values.contentJson}
              onChange={({ contentJson, contentHtml }) =>
                setValues((current) => ({ ...current, contentJson, contentHtml }))
              }
            />
          </label>
        </div>

        <div className="space-y-4">
          <label className="block text-sm">
            <span className="mb-2 block text-[var(--color-muted)]">Slug</span>
            <input
              value={values.slug}
              onChange={(event) =>
                setValues((current) => ({ ...current, slug: slugify(event.target.value) }))
              }
              className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none ring-0 focus:border-[var(--color-accent)]"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-2 block text-[var(--color-muted)]">Cover image URL</span>
            <input
              value={values.coverImageUrl}
              onChange={(event) =>
                setValues((current) => ({ ...current, coverImageUrl: event.target.value }))
              }
              className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none ring-0 focus:border-[var(--color-accent)]"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-2 block text-[var(--color-muted)]">Tags</span>
            <input
              value={values.tags}
              onChange={(event) => setValues((current) => ({ ...current, tags: event.target.value }))}
              placeholder="xai, bioinformatics, notes"
              className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none ring-0 focus:border-[var(--color-accent)]"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-2 block text-[var(--color-muted)]">Status</span>
            <select
              value={values.status}
              onChange={(event) =>
                setValues((current) => ({ ...current, status: event.target.value as PostStatus }))
              }
              className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none ring-0 focus:border-[var(--color-accent)]"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-2 block text-[var(--color-muted)]">Publish date</span>
            <input
              type="datetime-local"
              value={values.publishedAt}
              onChange={(event) =>
                setValues((current) => ({ ...current, publishedAt: event.target.value }))
              }
              className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none ring-0 focus:border-[var(--color-accent)]"
            />
          </label>
        </div>
      </div>
    </section>
  );
}
