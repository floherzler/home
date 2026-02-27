import { describe, expect, it } from "vitest";
import { filterPublishedPosts, isValidSlug, slugify } from "../blog";

describe("blog utilities", () => {
  it("normalizes text into a clean slug", () => {
    expect(slugify("  Single-cell Notes & Tools  ")).toBe("single-cell-notes-tools");
    expect(isValidSlug("single-cell-notes-tools")).toBe(true);
    expect(isValidSlug("Bad Slug")).toBe(false);
  });

  it("keeps only published posts ordered by published date descending", () => {
    const posts = filterPublishedPosts([
      {
        id: "1",
        title: "Draft",
        slug: "draft",
        excerpt: "",
        status: "draft",
        tags: [],
        contentJson: "[]",
        contentHtml: "",
      },
      {
        id: "2",
        title: "Older",
        slug: "older",
        excerpt: "",
        status: "published",
        tags: [],
        contentJson: "[]",
        contentHtml: "",
        publishedAt: "2025-01-01T00:00:00.000Z",
      },
      {
        id: "3",
        title: "Newer",
        slug: "newer",
        excerpt: "",
        status: "published",
        tags: [],
        contentJson: "[]",
        contentHtml: "",
        publishedAt: "2025-02-01T00:00:00.000Z",
      },
    ]);

    expect(posts.map((post) => post.slug)).toEqual(["newer", "older"]);
  });
});
