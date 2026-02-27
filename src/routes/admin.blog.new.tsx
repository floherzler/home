import { createFileRoute } from "@tanstack/react-router";
import { AdminGuard } from "../components/admin-guard";
import { PostForm } from "../components/post-form";

export const Route = createFileRoute("/admin/blog/new")({ component: NewPostPage });

function NewPostPage() {
  return (
    <AdminGuard>
      <PostForm />
    </AdminGuard>
  );
}
