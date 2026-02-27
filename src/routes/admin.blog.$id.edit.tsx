import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminGuard } from "../components/admin-guard";
import { PostForm } from "../components/post-form";
import { getPostClient } from "../lib/repositories/posts";
import type { BlogPost } from "../lib/types";

export const Route = createFileRoute("/admin/blog/$id/edit")({ component: EditPostPage });

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
          setError(cause instanceof Error ? cause.message : "Unable to load post.");
        }
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  if (error) {
    return (
      <section className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-red-700 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
        {error}
      </section>
    );
  }

  if (!post) {
    return (
      <section className="rounded-[2rem] border border-[var(--color-line)] bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        Loading post...
      </section>
    );
  }

  return <PostForm post={post} />;
}
