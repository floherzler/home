import { AppwriteException, ID, Query } from "appwrite";
import { createServerFn } from "@tanstack/react-start";
import { tablesDB } from "../appwrite";
import { createServerTablesDB, hasServerAppwriteConfig } from "../appwrite-server";
import { env } from "../env";
import { filterPublishedPosts, isValidSlug, slugify } from "../utils/blog";
import type { BlogPost, PostStatus } from "../types";

type RawPostRow = Record<string, unknown> & {
  $id: string;
  $createdAt?: string;
  $updatedAt?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  coverImageUrl?: string;
  status?: PostStatus;
  tags?: string[];
  contentJson?: string;
  contentHtml?: string;
  publishedAt?: string;
};

export type SavePostInput = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl?: string;
  status: PostStatus;
  tags: string[];
  contentJson: string;
  contentHtml: string;
  publishedAt?: string;
};

const requireCollectionConfig = () => {
  if (!env.databaseId || !env.postsTableId) {
    throw new Error(
      "Missing Appwrite table configuration. Set VITE_APPWRITE_DATABASE_ID and VITE_APPWRITE_TABLE_ID.",
    );
  }
};

const mapPost = (row: RawPostRow): BlogPost => ({
  id: row.$id,
  title: typeof row.title === "string" ? row.title : "Untitled",
  slug: typeof row.slug === "string" ? row.slug : "untitled",
  excerpt: typeof row.excerpt === "string" ? row.excerpt : "",
  coverImageUrl:
    typeof row.coverImageUrl === "string" && row.coverImageUrl.length > 0
      ? row.coverImageUrl
      : undefined,
  status: row.status === "published" ? "published" : "draft",
  tags: Array.isArray(row.tags)
    ? row.tags.filter((value): value is string => typeof value === "string")
    : [],
  contentJson: typeof row.contentJson === "string" ? row.contentJson : "[]",
  contentHtml: typeof row.contentHtml === "string" ? row.contentHtml : "",
  publishedAt:
    typeof row.publishedAt === "string" && row.publishedAt.length > 0
      ? row.publishedAt
      : undefined,
  createdAt: row.$createdAt,
  updatedAt: row.$updatedAt,
});

const stripUndefinedValues = <T extends Record<string, unknown>>(value: T) =>
  Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, Exclude<unknown, undefined>] => entry[1] !== undefined),
  );

const getServerTablesDBOrNull = () => {
  if (!hasServerAppwriteConfig) {
    return null;
  }

  return createServerTablesDB();
};

const listPublishedPostsInternal = async () => {
  requireCollectionConfig();

  const serverTablesDB = getServerTablesDBOrNull();

  if (!serverTablesDB) {
    return [] as BlogPost[];
  }

  const response = await serverTablesDB.listRows<RawPostRow>(
    env.databaseId,
    env.postsTableId,
    [Query.equal("status", "published"), Query.orderDesc("publishedAt")],
  );

  return filterPublishedPosts(response.rows.map(mapPost));
};

const getPublishedPostBySlugInternal = async (slug: string) => {
  const posts = await listPublishedPostsInternal();

  return posts.find((post) => post.slug === slug) ?? null;
};

export const listPublishedPostsServerFn = createServerFn({ method: "GET" }).handler(
  async () => listPublishedPostsInternal(),
);

export const getPublishedPostBySlugServerFn = createServerFn({ method: "GET" })
  .inputValidator((value: { slug: string }) => value)
  .handler(async ({ data }) => getPublishedPostBySlugInternal(data.slug));

export const getLatestPostsServerFn = createServerFn({ method: "GET" })
  .inputValidator((value: { limit: number }) => value)
  .handler(async ({ data }) => {
    const posts = await listPublishedPostsInternal();
    return posts.slice(0, data.limit);
  });

export const listPublishedPostsPublicClient = async () => {
  requireCollectionConfig();

  try {
    const response = await tablesDB.listRows<RawPostRow>(
      env.databaseId,
      env.postsTableId,
      [Query.equal("status", "published"), Query.orderDesc("publishedAt")],
    );

    return filterPublishedPosts(response.rows.map(mapPost));
  } catch (error) {
    if (error instanceof AppwriteException) {
      throw new Error(error.message);
    }

    throw error;
  }
};

export const getPublishedPostBySlugPublicClient = async (slug: string) => {
  requireCollectionConfig();

  try {
    const response = await tablesDB.listRows<RawPostRow>(
      env.databaseId,
      env.postsTableId,
      [Query.equal("slug", slug), Query.equal("status", "published"), Query.limit(1)],
    );

    const post = response.rows[0];

    return post ? mapPost(post) : null;
  } catch (error) {
    if (error instanceof AppwriteException) {
      throw new Error(error.message);
    }

    throw error;
  }
};

export const listAllPostsClient = async () => {
  requireCollectionConfig();

  const response = await tablesDB.listRows<RawPostRow>(
    env.databaseId,
    env.postsTableId,
    [Query.orderDesc("$updatedAt")],
  );

  return response.rows.map(mapPost);
};

export const savePostClient = async (input: SavePostInput) => {
  requireCollectionConfig();

  const normalizedSlug = slugify(input.slug);

  if (!input.title.trim()) {
    throw new Error("Title is required.");
  }

  if (!isValidSlug(normalizedSlug)) {
    throw new Error("Slug must use lowercase letters, numbers, and hyphens only.");
  }

  const duplicate = await tablesDB.listRows<RawPostRow>(
    env.databaseId,
    env.postsTableId,
    [Query.equal("slug", normalizedSlug)],
  );

  if (duplicate.rows.some((row) => row.$id !== input.id)) {
    throw new Error(`Slug \"${normalizedSlug}\" is already in use.`);
  }

  const payload = stripUndefinedValues({
    title: input.title.trim(),
    slug: normalizedSlug,
    excerpt: input.excerpt.trim(),
    coverImageUrl: input.coverImageUrl?.trim() || undefined,
    status: input.status,
    tags: input.tags,
    contentJson: input.contentJson,
    contentHtml: input.contentHtml,
    publishedAt: input.status === "published" ? input.publishedAt ?? new Date().toISOString() : undefined,
  });

  try {
    const row = input.id
      ? await tablesDB.updateRow<RawPostRow>(
          env.databaseId,
          env.postsTableId,
          input.id,
          payload,
        )
      : await tablesDB.createRow<RawPostRow>(
          env.databaseId,
          env.postsTableId,
          ID.unique(),
          payload,
        );

    return mapPost(row);
  } catch (error) {
    if (error instanceof AppwriteException) {
      throw new Error(error.message);
    }

    throw error;
  }
};

export const getPostClient = async (id: string) => {
  requireCollectionConfig();

  const row = await tablesDB.getRow<RawPostRow>(
    env.databaseId,
    env.postsTableId,
    id,
  );

  return mapPost(row);
};
