import { useNavigate } from "@tanstack/react-router";
import { AppwriteException } from "appwrite";
import { useMemo, useState } from "react";
import { savePostClient } from "../lib/repositories/posts";
import type { BlogPost, PostStatus } from "../lib/types";
import { normalizeTags, slugify } from "../lib/utils/blog";
import { BlogEditor } from "./blog-editor";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

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

const inputClasses =
	"w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-elevated)] px-4 py-3 text-[var(--color-ink)] outline-none ring-0 transition focus:border-[var(--color-accent)]";

export function PostForm({ post }: { post?: BlogPost }) {
	const navigate = useNavigate();
	const [values, setValues] = useState<PostFormValues>(() =>
		buildInitialState(post),
	);
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
		<Card>
			<CardContent className="p-6 lg:p-8">
				<div className="flex flex-col gap-4 border-b border-[var(--color-line)] pb-6 md:flex-row md:items-end md:justify-between">
					<div>
						<p className="text-xs uppercase tracking-[0.28em] text-[var(--color-muted)]">
							Editorial workspace
						</p>
						<h1 className="mt-2 font-[var(--font-serif)] text-4xl text-[var(--color-ink)]">
							{heading}
						</h1>
						<p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
							Configure the article first, then write the body in the large
							editor below. Inline images upload straight to your Appwrite
							content bucket.
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-3">
						<span className="inline-flex rounded-full bg-[var(--color-tag-surface)] px-3 py-1 text-xs font-medium tracking-[0.18em] text-[var(--color-tag-ink)] uppercase">
							{values.status}
						</span>
						<Button type="button" onClick={handleSave} disabled={isSaving}>
							{isSaving ? "Saving..." : "Save post"}
						</Button>
					</div>
				</div>

				{error ? (
					<p className="mt-4 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200 dark:text-red-200">
						{error}
					</p>
				) : null}

				<div className="mt-6 space-y-6">
					<div className="rounded-[1.75rem] border border-[var(--color-line)] bg-[var(--color-elevated)] p-5 shadow-[var(--shadow-soft)]">
						<div className="mb-5 flex flex-col gap-2 border-b border-[var(--color-line)] pb-4">
							<p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">
								Post configuration
							</p>
							<p className="text-sm leading-7 text-[var(--color-muted)]">
								Metadata, publishing state, and cover image stay here so the
								editor below can use the full page width.
							</p>
						</div>

						<div className="grid gap-4 lg:grid-cols-2">
							<label className="block text-sm lg:col-span-2">
								<span className="mb-2 block text-[var(--color-muted)]">
									Title
								</span>
								<input
									value={values.title}
									onChange={(event) =>
										setValues((current) => ({
											...current,
											title: event.target.value,
											slug: current.slug
												? current.slug
												: slugify(event.target.value),
										}))
									}
									className={inputClasses}
								/>
							</label>

							<label className="block text-sm lg:col-span-2">
								<span className="mb-2 block text-[var(--color-muted)]">
									Excerpt
								</span>
								<textarea
									value={values.excerpt}
									onChange={(event) =>
										setValues((current) => ({
											...current,
											excerpt: event.target.value,
										}))
									}
									rows={4}
									className={inputClasses}
								/>
							</label>

							<label className="block text-sm">
								<span className="mb-2 block text-[var(--color-muted)]">
									Slug
								</span>
								<input
									value={values.slug}
									onChange={(event) =>
										setValues((current) => ({
											...current,
											slug: slugify(event.target.value),
										}))
									}
									className={inputClasses}
								/>
							</label>

							<label className="block text-sm">
								<span className="mb-2 block text-[var(--color-muted)]">
									Cover image URL
								</span>
								<input
									value={values.coverImageUrl}
									onChange={(event) =>
										setValues((current) => ({
											...current,
											coverImageUrl: event.target.value,
										}))
									}
									className={inputClasses}
								/>
							</label>

							<label className="block text-sm">
								<span className="mb-2 block text-[var(--color-muted)]">
									Tags
								</span>
								<input
									value={values.tags}
									onChange={(event) =>
										setValues((current) => ({
											...current,
											tags: event.target.value,
										}))
									}
									placeholder="xai, bioinformatics, notes"
									className={inputClasses}
								/>
							</label>

							<label className="block text-sm">
								<span className="mb-2 block text-[var(--color-muted)]">
									Status
								</span>
								<select
									value={values.status}
									onChange={(event) =>
										setValues((current) => ({
											...current,
											status: event.target.value as PostStatus,
										}))
									}
									className={inputClasses}
								>
									<option value="draft">Draft</option>
									<option value="published">Published</option>
								</select>
							</label>

							<label className="block text-sm lg:col-span-2">
								<span className="mb-2 block text-[var(--color-muted)]">
									Publish date
								</span>
								<input
									type="datetime-local"
									value={values.publishedAt}
									onChange={(event) =>
										setValues((current) => ({
											...current,
											publishedAt: event.target.value,
										}))
									}
									className={inputClasses}
								/>
							</label>
						</div>
					</div>

					<div className="block text-sm">
						<span className="mb-3 block text-[var(--color-muted)]">Body</span>
						<BlogEditor
							initialContentJson={values.contentJson}
							onChange={({ contentJson, contentHtml }) =>
								setValues((current) => ({
									...current,
									contentJson,
									contentHtml,
								}))
							}
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
