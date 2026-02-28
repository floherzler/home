# Client/Server Boundary Guide

This document explains how client-side and server-side code are separated in this TanStack Start app.

The goal is practical:

- what runs in the browser
- what runs on the server
- how TanStack Start bridges the two
- how this repo currently organizes that split

## Mental Model

TanStack Start lets the same project contain:

- React components that render in the browser
- route loaders and server functions that run on the server
- raw server handlers that return a `Response`

So the important question is not "which folder is frontend/backend", but:

- which code path is browser-only
- which code path is server-only
- which modules are shared safely by both

## Core Files

- `src/routes/__root.tsx`
  Root document and app shell.
- `src/router.tsx`
  Router creation.
- `src/lib/env.ts`
  Browser-safe environment access via `import.meta.env`.
- `src/lib/appwrite.ts`
  Browser Appwrite SDK usage.
- `src/lib/appwrite-server.ts`
  Server Appwrite client factory.
- `src/lib/repositories/posts.ts`
  Mixed module containing both client calls and server functions.
- `src/lib/repositories/resume.ts`
  Server-only resume fetching logic plus server functions.

## Browser-Only Code

Browser-only code is anything that depends on browser globals or browser SDK state.

Typical indicators:

- `window`
- `document`
- `localStorage`
- browser session cookies
- the Appwrite web SDK client

Examples in this repo:

### Theme toggle

`src/components/theme-toggle.tsx`

Uses:

- `document.documentElement`
- `window.localStorage`

That means the interactive theme toggle behavior is browser-only.

### Admin auth UI

`src/routes/admin.login.tsx`

Uses:

- `account.createEmailPasswordSession(...)`
- `account.get()`
- `account.deleteSession("current")`

Those rely on the browser Appwrite SDK and browser session state.

### Client-side admin post operations

In `src/lib/repositories/posts.ts`:

- `listAllPostsClient()`
- `savePostClient()`
- `getPostClient()`

These use the browser `tablesDB` instance from `src/lib/appwrite.ts`, so they are intended for browser/admin usage.

## Server-Only Code

Server-only code is anything that depends on:

- `process.env`
- API keys
- `node-appwrite`
- direct backend fetches that must stay secret
- TanStack Start server functions or server handlers

Examples in this repo:

### Server Appwrite client

`src/lib/appwrite-server.ts`

Uses:

- `process.env`
- `node-appwrite`
- `APPWRITE_API_KEY`

This module must remain server-only in practice because it depends on secrets.

### Resume fetch logic

`src/lib/repositories/resume.ts`

Uses:

- `process.env`
- `APPWRITE_API_KEY`
- direct `fetch(...)` to the Appwrite Storage download endpoint

This is server-side because it uses private credentials.

### Raw server route

`src/routes/resume[.]json.tsx`

Uses:

- `server.handlers.GET`

This route does not render a normal React page. It returns a raw `Response`, so it is handled on the server.

## Shared Code

Some modules are safe to import from either side, as long as they do not touch browser-only or server-only globals at module scope.

Examples:

- `src/lib/utils/blog.ts`
- `src/lib/types.ts`
- route components that only render props/data

Shared code should avoid:

- `window`
- `document`
- `localStorage`
- `process.env`
- server secrets

unless those are isolated inside functions that are only called in the correct runtime.

## TanStack Start Server Functions

This app uses `createServerFn(...)` from `@tanstack/react-start` to localize server logic inside normal TypeScript modules.

Example in `src/lib/repositories/posts.ts`:

```ts
export const listPublishedPostsServerFn = createServerFn({ method: "GET" }).handler(
  async () => listPublishedPostsInternal(),
);
```

And in `src/lib/repositories/resume.ts`:

```ts
export const getResumeServerFn = createServerFn({ method: "GET" }).handler(async () => {
  const jsonText = await fetchResumeJsonText();
  return parseResume(jsonText);
});
```

### What this means

- the implementation inside `.handler(...)` runs on the server
- route loaders can call these server functions
- pages consume the result through `Route.useLoaderData()`

This is one of the main TanStack Start patterns for keeping server logic close to feature code without turning everything into separate API routes.

## Route Loaders as the Server Entry Point

Several route files use loaders to fetch data before rendering.

Examples:

- `src/routes/blog.index.tsx`
- `src/routes/blog.$slug.tsx`
- `src/routes/resume.tsx`

These loaders call server functions, not browser SDK code.

Example flow for the public blog index:

1. route loader runs
2. loader calls `listPublishedPostsServerFn()`
3. server function runs on the server
4. Appwrite is queried on the server
5. loader returns data
6. component reads it via `Route.useLoaderData()`

So although the page is interactive in the browser, the public content fetch itself is server-localized.

## Root Document vs Client Interactivity

`src/routes/__root.tsx` is a useful example of mixed concerns.

### Server-rendered document structure

The root route returns:

- `<html>`
- `<head>`
- `<body>`
- `<HeadContent />`
- `<Scripts />`

That shell is part of server rendering.

### Inline startup script

The theme init script in `__root.tsx` contains browser code:

- `window.localStorage`
- `document.documentElement`

But it is emitted into the HTML document and executed by the browser after the document loads.

So the file itself is not purely "server file" or "client file". Instead:

- the component renders on the server
- the script it outputs executes in the browser

This is a common TanStack Start pattern.

## Environment Variables: Client vs Server

This app uses two access styles:

### Browser-safe env access

`src/lib/env.ts`

Uses:

- `import.meta.env`

This is the correct path for values that can be exposed to browser code.

Examples:

- Appwrite endpoint
- Appwrite project ID
- public database/table IDs

### Server env access

Server-only modules use:

- `process.env`

Examples:

- `src/lib/appwrite-server.ts`
- `src/lib/repositories/resume.ts`

This is where secret values like `APPWRITE_API_KEY` are read.

Rule:

- `import.meta.env` for public/browser-safe config
- `process.env` for server-only config and secrets

## Current Localization Strategy in This Repo

The project currently follows this practical split:

### Public content reads

- localized to the server
- implemented through `createServerFn(...)`
- used by route loaders

Examples:

- published blog list
- published blog post by slug
- resume fetch/parsing

### Admin auth and admin editing

- localized to the browser
- uses Appwrite web SDK directly
- depends on browser session cookies

Examples:

- sign in / sign out
- listing all posts in admin
- creating and editing posts

### Shared view rendering

- page components render UI from loader data or client state
- they stay mostly runtime-neutral unless they explicitly touch browser globals

## Why the Blog Uses Both Client and Server Paths

`src/lib/repositories/posts.ts` is intentionally mixed.

It contains:

- server-side public read functions
- browser-side admin read/write functions

This is convenient because all post-related data logic is in one place, but it also means the file must be written carefully.

The boundary is currently expressed by function choice:

- `listPublishedPostsServerFn(...)`
  server path
- `getPublishedPostBySlugServerFn(...)`
  server path
- `listAllPostsClient()`
  browser path
- `savePostClient()`
  browser path
- `getPostClient()`
  browser path

## Raw Server Handlers

Sometimes the app needs an endpoint, not a page.

This repo does that with:

- `src/routes/resume[.]json.tsx`

That route uses:

```ts
server: {
  handlers: {
    GET: async () => ...
  }
}
```

Use this pattern when the route should return a `Response` directly instead of rendering React.

## How To Decide Where New Code Should Live

Use these rules:

### Put code on the server when:

- it needs secrets
- it uses `process.env`
- it should not trust the browser
- it performs public content fetching on behalf of anonymous users
- it talks to backend APIs with private credentials

### Put code in the browser when:

- it depends on user interaction/state
- it uses `window`, `document`, or `localStorage`
- it depends on the current browser session
- it uses browser-only SDK features

### Keep code shared when:

- it is pure transformation logic
- it is type definitions
- it does not rely on runtime-specific globals

## Common Footguns

### 1. Importing server-only code into client UI by accident

If a component imports a module that touches `process.env` or `node-appwrite` at module scope, you can break the client bundle or leak boundaries.

### 2. Using browser globals during SSR

If a component uses `window` or `document` during server rendering, it can throw at runtime.

That is why browser-only logic in this repo usually lives inside:

- `useEffect(...)`
- inline scripts emitted into the document
- event handlers

### 3. Mixing public config and secrets

Anything under `VITE_*` is public-facing configuration.

Do not put secrets there.

### 4. Assuming a route component is purely client-side

Route files can render on the server, call loaders, emit browser scripts, and hydrate later. Think in terms of code path, not just file location.

## Practical Summary

For this app:

- route loaders and `createServerFn(...)` are the main server boundary
- browser SDK usage marks client-side admin behavior
- `process.env` and `node-appwrite` mark server-only code
- `window`, `document`, and `localStorage` mark browser-only code
- route components themselves can participate in both SSR and client hydration

That is the core client/server localization model currently used in this TanStack Start project.
