# Routing Guide

This document explains how pages and routing work in this project with TanStack Start and TanStack Router.

## Stack

- TanStack Start provides the app/runtime layer.
- TanStack Router provides the route definitions, loaders, params, navigation, and route tree.
- Routing in this repo is file-based under `src/routes/`.

## Core Files

- `src/routes/`
  Every file here defines a route.
- `src/routes/__root.tsx`
  Defines the root route, shared document shell, head metadata, and the app shell component.
- `src/router.tsx`
  Creates the router instance from the generated route tree.
- `src/routeTree.gen.ts`
  Generated route tree used by the router. This file is generated and should not be edited manually.

## Router Creation

In `src/router.tsx`, the app creates the router with:

- `routeTree`
- `scrollRestoration: true`
- `defaultPreloadStaleTime: 0`

That means navigation is driven entirely by the generated file-based route tree.

## Root Route

`src/routes/__root.tsx` is the top-level route for the whole app.

It does two separate jobs:

### 1. Document shell

The `shellComponent` is `RootDocument`, which renders:

- `<html>`
- `<head>`
- `<body>`
- `<HeadContent />`
- `<Scripts />`

This is where global stylesheet links, font links, and the theme initialization script are injected.

### 2. Shared app shell

The root route `component` is `SiteShell`.

That means every page route renders inside the shared shell layout, which currently provides:

- the top header
- the theme toggle
- the footer
- the `<Outlet />` region where the active child route renders

## File-Based Route Naming

TanStack Router maps route files to paths.

Examples from this repo:

- `src/routes/index.tsx` -> `/`
- `src/routes/blog.index.tsx` -> `/blog/`
- `src/routes/blog.$slug.tsx` -> `/blog/$slug`
- `src/routes/resume.tsx` -> `/resume`
- `src/routes/admin.login.tsx` -> `/admin/login`
- `src/routes/admin.blog.index.tsx` -> `/admin/blog/`
- `src/routes/admin.blog.new.tsx` -> `/admin/blog/new`
- `src/routes/admin.blog.$id.edit.tsx` -> `/admin/blog/$id/edit`
- `src/routes/resume[.]json.tsx` -> `/resume.json`

Important naming patterns:

- `index.tsx`
  Represents the index route for a segment.
- `.$param`
  Declares a dynamic route parameter.
- dots in filenames
  Represent nested path segments in this file-based setup.
- `[.]`
  Escapes a literal dot in the URL path, used here for `/resume.json`.

## Standard Page Route Pattern

Most page routes follow this structure:

```tsx
export const Route = createFileRoute("/some/path")({
  component: SomePage,
});

function SomePage() {
  return <section>...</section>;
}
```

Example:

- `src/routes/index.tsx`
- `src/routes/admin.blog.new.tsx`

## Loaders

Routes that need data before rendering use a `loader`.

Example:

- `src/routes/blog.index.tsx`
  calls `listPublishedPostsServerFn()`
- `src/routes/resume.tsx`
  calls `getResumeServerFn()`
- `src/routes/blog.$slug.tsx`
  fetches a single published post using the route param

Pattern:

```tsx
export const Route = createFileRoute("/blog/")({
  loader: () => listPublishedPostsServerFn(),
  component: BlogIndexPage,
});

function BlogIndexPage() {
  const posts = Route.useLoaderData();
  return ...;
}
```

Key point:

- `loader`
  fetches the data for the route
- `Route.useLoaderData()`
  reads that data inside the page component

## Dynamic Route Params

Dynamic params come from `$param` in the route path.

Examples:

- `/blog/$slug`
- `/admin/blog/$id/edit`

Inside the route component, use:

```tsx
const { id } = Route.useParams();
```

This is used in:

- `src/routes/admin.blog.$id.edit.tsx`

For loader-based dynamic routes, params are available in the loader arguments:

```tsx
loader: async ({ params }) => {
  const post = await getPublishedPostBySlugServerFn({
    data: { slug: params.slug },
  });
  ...
}
```

This is used in:

- `src/routes/blog.$slug.tsx`

## Not Found Behavior

In `src/routes/blog.$slug.tsx`, if no post is found:

```tsx
throw notFound();
```

That tells TanStack Router to treat the route as missing instead of rendering a broken page.

## Server Handlers

TanStack Start routes can define raw server handlers directly.

This repo uses that in:

- `src/routes/resume[.]json.tsx`

That route does not render a React page. Instead, it exposes a `GET` handler that returns a `Response` with JSON content and headers.

Pattern:

```tsx
export const Route = createFileRoute("/resume.json")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(...);
      },
    },
  },
});
```

Use this when the route should behave like an endpoint instead of a visual page.

## Navigation

Navigation uses TanStack Router primitives.

Examples in this repo:

- `Link`
  for declarative navigation between pages
- `useNavigate`
  for programmatic navigation in the admin flow

Examples:

```tsx
<Link to="/blog">Read the blog</Link>
```

```tsx
<Link to="/blog/$slug" params={{ slug: post.slug }}>
  Read article
</Link>
```

## Route Protection

There is no router-level auth middleware in this repo right now.

Instead, protected pages wrap their content in `AdminGuard`.

Examples:

- `src/routes/admin.blog.new.tsx`
- `src/routes/admin.blog.$id.edit.tsx`
- `src/routes/admin.blog.index.tsx`

So the route still exists normally, but the page component gates access inside the rendered tree.

## Practical Mental Model

For this project, routing works like this:

1. Add a file in `src/routes`.
2. Export `Route = createFileRoute(...)`.
3. Optionally add a `loader` for data.
4. Optionally add `server.handlers` if the route is an endpoint.
5. Render the page component.
6. The page is automatically mounted inside `SiteShell` through `__root.tsx`.

## Current Route Inventory

The app currently includes these route categories:

- homepage
- blog index
- individual blog post pages
- resume page
- raw resume JSON endpoint
- admin login
- admin blog list
- admin new post page
- admin edit post page

## Safe Editing Notes

When adding new routes in this repo:

1. Prefer creating a new file in `src/routes` instead of manually editing generated router files.
2. Do not manually edit `src/routeTree.gen.ts`.
3. Use loaders for page data and `Route.useLoaderData()` inside the page.
4. Use `server.handlers` only when the route should return a raw `Response`.
5. Keep shared page chrome in `SiteShell`, not duplicated inside each route.
