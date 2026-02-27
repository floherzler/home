import type { BlogPost, PostStatus } from "../types";

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

export const isValidSlug = (value: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

export const normalizeTags = (value: string) =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

export const isPublished = (status: PostStatus, publishedAt?: string) =>
  status === "published" && Boolean(publishedAt);

export const filterPublishedPosts = (posts: BlogPost[]) =>
  posts
    .filter((post) => isPublished(post.status, post.publishedAt))
    .sort((left, right) => {
      const leftDate = left.publishedAt ? new Date(left.publishedAt).getTime() : 0;
      const rightDate = right.publishedAt ? new Date(right.publishedAt).getTime() : 0;

      return rightDate - leftDate;
    });

export const formatDisplayDate = (value?: string) => {
  if (!value) {
    return "Draft";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};
