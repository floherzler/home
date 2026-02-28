import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminGuard } from "../components/admin-guard";
import { PostForm } from "../components/post-form";
import { Card, CardContent } from "../components/ui/card";
import { getPostClient } from "../lib/repositories/posts";
import type { BlogPost } from "../lib/types";

export const Route = createFileRoute("/admin/blog/$id/edit")({
	component: EditPostPage,
});

function EditPostPage() {
	const { id } = Route.useParams();

	return (
		<AdminGuard>
			<EditPostScreen id={id} />
		</AdminGuard>
	);
}

function EditPostScreen({ id }: { id: string }) {
	const [post, setPost] = useState<BlogPost | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;

		getPostClient(id)
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
			});

		return () => {
			mounted = false;
		};
	}, [id]);

	if (error) {
		return (
			<Card className="border-red-500/25 bg-red-500/10 shadow-[var(--shadow-panel)]">
				<CardContent className="p-8 text-red-200 dark:text-red-200">
					{error}
				</CardContent>
			</Card>
		);
	}

	if (!post) {
		return (
			<Card>
				<CardContent className="p-8 text-[var(--color-muted)]">
					Loading post...
				</CardContent>
			</Card>
		);
	}

	return <PostForm post={post} />;
}
