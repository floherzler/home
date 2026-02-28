import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BlogPostCard } from "../components/blog-post-card";
import { listPublishedPostsPublicClient } from "../lib/repositories/posts";
import type { BlogPost } from "../lib/types";

export const Route = createFileRoute("/blog/")({
	component: BlogIndexPage,
});

function BlogIndexPage() {
	const [posts, setPosts] = useState<BlogPost[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;

		listPublishedPostsPublicClient()
			.then((result) => {
				if (mounted) {
					setPosts(result);
				}
			})
			.catch((cause) => {
				if (mounted) {
					setError(
						cause instanceof Error
							? cause.message
							: "Unable to load published posts.",
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
	}, []);

	return (
		<section className="rounded-[2rem] border border-[var(--color-line)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-panel)] lg:p-10">
			<p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">
				Blog
			</p>
			<h1 className="mt-3 font-[var(--font-serif)] text-5xl text-[var(--color-ink)]">
				Published writing
			</h1>
			<p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--color-muted)]">
				A manual publishing workflow for essays, notes, and project updates.
			</p>

			<div className="mt-10 grid gap-6 lg:grid-cols-2">
				{error ? (
					<div className="rounded-[1.75rem] border border-red-500/25 bg-red-500/10 p-6 text-red-200 dark:text-red-200">
						{error}
					</div>
				) : loading ? (
					<div className="rounded-[1.75rem] border border-dashed border-[var(--color-line)] bg-[var(--color-card)] p-6 text-[var(--color-muted)]">
						Loading published posts...
					</div>
				) : posts.length > 0 ? (
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
