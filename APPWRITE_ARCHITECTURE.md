# Appwrite Architecture

This document explains how Appwrite is used in this app: authentication, database access, storage access, client/server boundaries, and caching behavior.

## Overview

This project uses Appwrite in two different ways:

- browser-side via the Appwrite web SDK
- server-side via either `node-appwrite` or direct HTTP fetches

The split is intentional:

- admin auth and admin content editing happen in the browser with the user session
- public blog and resume reads happen on the server with the API key

## Core Files

- `src/lib/appwrite.ts`
  Browser Appwrite client and SDK services.
- `src/lib/appwrite-server.ts`
  Server Appwrite client factory using `node-appwrite`.
- `src/lib/auth.ts`
  Admin authorization helpers.
- `src/lib/repositories/posts.ts`
  Blog read/write access to Appwrite TablesDB.
- `src/lib/repositories/resume.ts`
  Resume read access from Appwrite Storage.
- `src/routes/admin.login.tsx`
  Browser auth flow for sign in, sign up, and sign out.
- `scripts/appwrite-seed.mjs`
  Provisioning script for database/table setup.

## Environment Variables

Public/browser config comes from `src/lib/env.ts` using `import.meta.env`:

- `VITE_APPWRITE_ENDPOINT`
- `VITE_APPWRITE_PROJECT_ID`
- `VITE_APPWRITE_PROJECT_NAME`
- `VITE_APPWRITE_DATABASE_ID`
- `VITE_APPWRITE_TABLE_ID`
- `VITE_APPWRITE_CONTENT_BUCKET_ID`
- `VITE_APPWRITE_RESUME_FILE_ID`

Server-only access also uses:

- `APPWRITE_API_KEY`

Important detail:

- `VITE_*` variables are available in browser code
- `APPWRITE_API_KEY` must stay server-side only

## Browser Appwrite Client

`src/lib/appwrite.ts` creates one browser SDK client:

- `Client`
- `Account`
- `TablesDB`
- `Storage`

The browser client is configured with:

- endpoint
- project ID

Exports:

- `account`
- `tablesDB`
- `storage`
- `client`

This browser client is used for:

- email/password login
- session inspection
- sign out
- admin-side table reads/writes

## Server Appwrite Client

`src/lib/appwrite-server.ts` creates a separate server-side Appwrite client using `node-appwrite`.

It requires:

- `VITE_APPWRITE_ENDPOINT`
- `VITE_APPWRITE_PROJECT_ID`
- `APPWRITE_API_KEY`

Exports:

- `hasServerAppwriteConfig`
- `createServerClient()`
- `createServerTablesDB()`

This server client is used for:

- public blog reads from TablesDB

If server credentials are missing, public blog loaders currently fall back to returning an empty list instead of crashing.

## Authentication Flow

Auth is entirely Appwrite email/password session based.

### Sign In

In `src/routes/admin.login.tsx`:

- `account.createEmailPasswordSession(email, password)` creates the browser session
- `account.get()` fetches the currently signed-in user

### Sign Up

Also in `src/routes/admin.login.tsx`:

- `account.create(...)` creates the account
- then `account.createEmailPasswordSession(...)` signs the user in immediately

### Sign Out

- `account.deleteSession("current")`

This is used both on the login page and the admin index page.

## Authorization Model

This app uses Appwrite user labels for admin authorization.

The important helper is in `src/lib/auth.ts`:

- `isAdminUser(user)`
  returns true when `user.labels` contains `"admin"`
- `getCurrentAdmin()`
  calls `account.get()` and then rejects users without the `admin` label

That means:

- authentication = valid Appwrite session
- authorization = authenticated user plus Appwrite label `admin`

The admin area is not granted by email alone and not granted by app-local config alone.

## Admin Access Behavior

`src/routes/admin.login.tsx` does the following on load:

1. call `account.get()` to see whether a browser session already exists
2. if a session exists, call `getCurrentAdmin()`
3. if the user is labeled `admin`, redirect to `/admin/blog`
4. otherwise show a readable error or guidance message

This is why a user can be:

- signed in to Appwrite
- but still blocked from the admin UI if the `admin` label is missing

## Blog Data: Public Reads

Public blog reads live in `src/lib/repositories/posts.ts`.

### Internal Read Path

`listPublishedPostsInternal()`

- requires `databaseId` and `postsTableId`
- creates a server `TablesDB` instance if server config exists
- queries Appwrite TablesDB for rows where:
  - `status == "published"`
  - ordered descending by `publishedAt`
- maps rows into app-level `BlogPost` objects
- filters and sorts again via `filterPublishedPosts(...)`

### Public Server Functions

These TanStack Start server functions expose blog reads to routes:

- `listPublishedPostsServerFn`
- `getPublishedPostBySlugServerFn`
- `getLatestPostsServerFn`

These are used by page loaders such as:

- `src/routes/blog.index.tsx`
- `src/routes/blog.$slug.tsx`

### Important Security Property

Public blog reads do not rely on a browser Appwrite session.

They run on the server with the Appwrite API key, which means:

- anonymous visitors can view published posts
- draft posts are not exposed by the public loaders

## Blog Data: Admin Reads and Writes

Admin-side blog editing uses the browser Appwrite SDK in `src/lib/repositories/posts.ts`.

### Admin Listing

`listAllPostsClient()`

- calls `tablesDB.listRows(...)`
- orders by `$updatedAt` descending

This is used by the admin blog index page.

### Get One Post

`getPostClient(id)`

- calls `tablesDB.getRow(...)`

This is used by the edit page.

### Save Post

`savePostClient(input)`

Behavior:

1. validate table config
2. normalize slug with `slugify(...)`
3. validate slug format
4. query Appwrite for duplicate slugs
5. build the row payload
6. call either:
   - `tablesDB.createRow(...)`
   - or `tablesDB.updateRow(...)`

If the post is published and no `publishedAt` is supplied, it defaults to the current ISO timestamp.

Errors from Appwrite are converted into normal `Error` messages for the UI.

### Important Security Property

Admin writes depend on the current browser Appwrite session and table permissions.

So even if the frontend shows admin UI, Appwrite itself still remains the real enforcement point for create/update access.

## Resume Data

Resume access is handled differently from blog posts.

The code is in `src/lib/repositories/resume.ts`.

### Storage Read Path

`fetchResumeJsonText()`

- reads endpoint, project ID, bucket ID, file ID, and API key from server env
- makes a direct HTTP `fetch(...)` request to the Appwrite file download endpoint
- sends:
  - `X-Appwrite-Key`
  - `X-Appwrite-Project`

This returns the raw JSON text stored in Appwrite Storage.

### Parsing

`parseResume(jsonText)`

- parses the JSON
- validates that the top-level value is an object

### Server Functions

- `getResumeServerFn`
  returns parsed resume JSON as an object
- `getResumeJsonTextServerFn`
  returns the raw JSON text

### JSON Endpoint Route

`src/routes/resume[.]json.tsx` exposes `/resume.json` by calling `fetchResumeJsonText()` and returning a raw `Response`.

That endpoint explicitly sets:

- `Content-Type: application/json; charset=utf-8`
- `Cache-Control: public, max-age=300`

This is the clearest cache policy in the app right now.

## Caching Behavior

Caching in this app is intentionally minimal.

### 1. TanStack Router / route preloading

In `src/router.tsx`:

- `defaultPreloadStaleTime: 0`

That means route preloads are considered stale immediately. In practice, the app does not keep a long-lived client-side freshness window for route data.

### 2. Blog reads

Public blog reads:

- go through TanStack Start server functions
- query Appwrite on the server
- do not define explicit HTTP cache headers in the blog routes

So currently:

- there is no custom long-lived cache layer for public blog pages
- blog data is effectively fetched fresh through the server-function path

Admin blog reads/writes:

- use the browser Appwrite SDK directly
- also do not have an app-defined cache layer

### 3. Resume JSON endpoint

`/resume.json` does have explicit HTTP caching:

- `public, max-age=300`

That means clients and intermediaries may cache that response for 5 minutes.

### 4. Session state

Auth state is effectively stored by Appwrite session cookies in the browser.

The app itself does not keep a separate auth cache beyond React state such as:

- `currentUser`
- `isLoadingSession`

Those are UI state values, not a separate auth persistence layer.

### 5. Theme storage

Not Appwrite-related, but often confused with caching:

- theme is persisted in `localStorage`

That is local preference storage only, not server data caching.

## Failure Modes

Some important failure cases to understand:

### Missing browser config

If public Appwrite config is missing:

- browser-side auth and admin table access will fail

### Missing server config

If server Appwrite config is missing:

- public blog loaders return empty results
- resume server fetches fail

### Missing admin label

If a user can authenticate but lacks the Appwrite `admin` label:

- `account.get()` succeeds
- `getCurrentAdmin()` fails
- admin UI access is denied

### Localhost/session platform issues

`getReadableAuthError(...)` in `src/lib/auth.ts` contains a specific message for Appwrite 401 cases where the browser origin/session cookie setup is wrong.

This is useful when login appears to succeed but Appwrite still does not recognize the session for that origin.

## Data Ownership and Permissions

From the app’s perspective:

- Appwrite is the source of truth
- frontend validation improves UX
- Appwrite permissions remain the real access control

The seed script and README describe the intended table permissions and the `admin` label workflow. The important consequence is that the app does not assume trust purely from frontend state.

## Practical Mental Model

Use this simplified model when working on the app:

1. Public visitors read published content through server-side Appwrite access.
2. Admin users authenticate in the browser with Appwrite sessions.
3. Admin pages read and write rows directly from the browser SDK under the user session.
4. Resume JSON is pulled from Appwrite Storage on the server.
5. Only `/resume.json` currently has explicit HTTP cache headers.
6. Most other content paths are intentionally close to fresh reads rather than heavily cached views.
