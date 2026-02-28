import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminGuard } from "../components/admin-guard";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { account } from "../lib/appwrite";
import { listAllPostsClient } from "../lib/repositories/posts";
import type { BlogPost } from "../lib/types";
import { formatDisplayDate } from "../lib/utils/blog";

export const Route = createFileRoute("/admin/blog/")({
	component: AdminBlogIndexPage,
});

function AdminBlogIndexPage() {
	return (
		<AdminGuard>
			<AdminDashboard />
		</AdminGuard>
	);
}

function AdminDashboard() {
	const [posts, setPosts] = useState<BlogPost[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;

		listAllPostsClient()
			.then((result) => {
				if (mounted) {
					setPosts(result);
				}
			})
			.catch((cause) => {
				if (mounted) {
					setError(
						cause instanceof Error ? cause.message : "Unable to load posts.",
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
		<Card>
			<CardContent className="p-8">
				<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
					<div>
						<p className="text-xs uppercase tracking-[0.28em] text-[var(--color-muted)]">
							Admin
						</p>
						<h1 className="mt-3 font-[var(--font-serif)] text-4xl">
							Blog dashboard
						</h1>
					</div>
					<div className="flex gap-3">
						<Button
							type="button"
							onClick={() =>
								void account
									.deleteSession("current")
									.then(() => window.location.assign("/admin/login"))
							}
							variant="outline"
						>
							Log out
						</Button>
						<Button asChild>
							<Link to="/admin/blog/new">New post</Link>
						</Button>
					</div>
				</div>

				{error ? (
					<p className="mt-6 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200 dark:text-red-200">
						{error}
					</p>
				) : null}

				<div className="mt-8 overflow-hidden rounded-[1.5rem] border border-[var(--color-line)] bg-[var(--color-elevated)] shadow-[var(--shadow-soft)]">
					<table className="w-full border-collapse text-left text-sm">
						<thead className="bg-[var(--color-card)] text-[var(--color-muted)]">
							<tr>
								<th className="px-4 py-3 font-medium">Title</th>
								<th className="px-4 py-3 font-medium">Status</th>
								<th className="px-4 py-3 font-medium">Updated</th>
								<th className="px-4 py-3 font-medium">Action</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr>
									<td
										className="px-4 py-4 text-[var(--color-muted)]"
										colSpan={4}
									>
										Loading posts...
									</td>
								</tr>
							) : posts.length === 0 ? (
								<tr>
									<td
										className="px-4 py-4 text-[var(--color-muted)]"
										colSpan={4}
									>
										No posts yet.
									</td>
								</tr>
							) : (
								posts.map((post) => (
									<tr
										key={post.id}
										className="border-t border-[var(--color-line)]"
									>
										<td className="px-4 py-4 text-[var(--color-ink)]">
											{post.title}
										</td>
										<td className="px-4 py-4 capitalize">
											<span className="inline-flex rounded-full bg-[var(--color-tag-surface)] px-3 py-1 text-xs font-medium tracking-[0.18em] text-[var(--color-tag-ink)] uppercase">
												{post.status}
											</span>
										</td>
										<td className="px-4 py-4 text-[var(--color-muted)]">
											{formatDisplayDate(post.updatedAt)}
										</td>
										<td className="px-4 py-4">
											<Link
												to="/admin/blog/$id/edit"
												params={{ id: post.id }}
												className="font-medium text-[var(--color-accent)] transition hover:text-[var(--color-accent-strong)]"
											>
												Edit
											</Link>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</CardContent>
		</Card>
	);
}
