import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminGuard } from "../components/admin-guard";
import { account } from "../lib/appwrite";
import { listAllPostsClient } from "../lib/repositories/posts";
import { formatDisplayDate } from "../lib/utils/blog";
import type { BlogPost } from "../lib/types";

export const Route = createFileRoute("/admin/blog/")({ component: AdminBlogIndexPage });

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
          setError(cause instanceof Error ? cause.message : "Unable to load posts.");
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
    <section className="rounded-[2rem] border border-[var(--color-line)] bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-muted)]">Admin</p>
          <h1 className="mt-3 font-[var(--font-serif)] text-4xl">Blog dashboard</h1>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => void account.deleteSession("current").then(() => window.location.assign("/admin/login"))}
            className="rounded-full border border-[var(--color-line)] px-5 py-3 text-sm font-medium text-[var(--color-ink)]"
          >
            Log out
          </button>
          <Link to="/admin/blog/new" className="rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-medium text-white">
            New post
          </Link>
        </div>
      </div>

      {error ? <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-[var(--color-line)]">
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
                <td className="px-4 py-4 text-[var(--color-muted)]" colSpan={4}>
                  Loading posts...
                </td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-[var(--color-muted)]" colSpan={4}>
                  No posts yet.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="border-t border-[var(--color-line)]">
                  <td className="px-4 py-4">{post.title}</td>
                  <td className="px-4 py-4 capitalize">{post.status}</td>
                  <td className="px-4 py-4 text-[var(--color-muted)]">{formatDisplayDate(post.updatedAt)}</td>
                  <td className="px-4 py-4">
                    <Link to="/admin/blog/$id/edit" params={{ id: post.id }} className="text-[var(--color-accent)]">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
