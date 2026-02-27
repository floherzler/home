import { createFileRoute, notFound } from "@tanstack/react-router";
import { BlogContent } from "../components/blog-content";
import { getPublishedPostBySlugServerFn } from "../lib/repositories/posts";
import { formatDisplayDate } from "../lib/utils/blog";

export const Route = createFileRoute("/blog/$slug")({
	loader: async ({ params }) => {
		const post = await getPublishedPostBySlugServerFn({
			data: { slug: params.slug },
		});

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
		<article className="mx-auto max-w-3xl px-1 py-4 sm:py-8">
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
		</article>
	);
}
