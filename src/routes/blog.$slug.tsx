import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BlogContent } from "../components/blog-content";
import { getPublishedPostBySlugPublicClient } from "../lib/repositories/posts";
import type { BlogPost } from "../lib/types";
import { formatDisplayDate } from "../lib/utils/blog";

export const Route = createFileRoute("/blog/$slug")({
	component: BlogPostPage,
});

function BlogPostPage() {
	const { slug } = Route.useParams();
	const [post, setPost] = useState<BlogPost | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;

		getPublishedPostBySlugPublicClient(slug)
			.then((result) => {
				if (mounted) {
					setPost(result);
				}
			})
			.catch((cause) => {
				if (mounted) {
					setError(
						cause instanceof Error ? cause.message : "Unable to load post.",
					);
				}
			})
			.finally(() => {
				if (mounted) {
					setLoading(false);
				}
			});

		return () => {
			mounted = false;
		};
	}, [slug]);

	if (error) {
		return (
			<section className="mx-auto max-w-3xl py-4 sm:py-8">
				<div className="rounded-[2rem] border border-red-500/25 bg-red-500/10 px-5 py-6 text-red-200 shadow-[var(--shadow-panel)] sm:px-8 sm:py-8 dark:text-red-200">
					{error}
				</div>
			</section>
		);
	}

	if (loading) {
		return (
			<section className="mx-auto max-w-3xl py-4 sm:py-8">
				<div className="rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-6 text-[var(--color-muted)] shadow-[var(--shadow-panel)] sm:px-8 sm:py-8">
					Loading post...
				</div>
			</section>
		);
	}

	if (!post) {
		throw notFound();
	}

	return (
		<article className="mx-auto max-w-3xl py-4 sm:py-8">
			<div className="rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-6 shadow-[var(--shadow-panel)] sm:px-8 sm:py-8">
				<p className="text-xs uppercase tracking-[0.28em] text-[var(--color-muted)]">
					{formatDisplayDate(post.publishedAt)}
				</p>
				<h1 className="mt-4 font-[var(--font-display)] text-5xl leading-none tracking-[-0.05em] text-[var(--color-ink)] sm:text-6xl">
					{post.title}
				</h1>
				{post.excerpt ? (
					<p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-muted)]">
						{post.excerpt}
					</p>
				) : null}
				<div className="mt-6 flex flex-wrap gap-2">
					{post.tags.map((tag) => (
						<span
							key={tag}
							className="rounded-full bg-[var(--color-card)] px-3 py-1 text-sm text-[var(--color-muted)]"
						>
							{tag}
						</span>
					))}
				</div>
				<div className="mt-10">
					<BlogContent
						contentJson={post.contentJson}
						contentHtml={post.contentHtml}
					/>
				</div>
			</div>
		</article>
	);
}
