# Research Atlas

Personal homepage built with TanStack Start, Appwrite, and a manual BlockNote publishing workflow.

## Features

- Personal homepage with curated profile and project sections
- Blog list and article routes backed by Appwrite table rows
- Admin blog editor with Appwrite authentication and BlockNote
- Resume page rendered from JSON Resume stored in Appwrite Storage
- Raw resume JSON exposed at `/resume.json`

## Appwrite setup

Create one Appwrite database, one table, and one storage bucket.

You can create the database schema for this repo with:

```bash
npm install
npm run appwrite:seed
```

If you also want a starter post:

```bash
npm run appwrite:seed -- --with-sample
```

This script is idempotent. It creates the configured database, posts table, required columns, and indexes if they do not already exist.

It uses the Appwrite Node server SDK (`node-appwrite`), so run `npm install` after pulling changes that touch the seed script or server Appwrite helpers.

The npm argument syntax is:

- `npm run appwrite:seed` runs the script from `package.json`
- the first `--` tells npm to pass the remaining arguments through to the script
- `--with-sample` is read by `scripts/appwrite-seed.mjs`

### Database

Table: `blogposts`

Seeded table permissions:

- `create("label:admin")`
- `read("label:admin")`
- `update("label:admin")`
- `delete("label:admin")`

This means Appwrite users who should write blog posts need the Appwrite user label `admin`. The app's own `/admin/*` routes are still separately gated by `VITE_ADMIN_USER_IDS`.
This means Appwrite users who should write blog posts need the Appwrite user label `admin`. The app's `/admin/*` routes use that same label for access control.

Required attributes:

- `title` string
- `slug` string
- `excerpt` string
- `coverImageUrl` string, optional
- `status` enum: `draft`, `published`
- `tags` string[]
- `contentJson` string
- `contentHtml` string
- `publishedAt` datetime, optional

Recommended indexes:

- unique index on `slug`
- index on `status`
- index on `publishedAt`

### Storage

Bucket: `site-content`

Store your JSON Resume in this bucket and point `VITE_APPWRITE_RESUME_FILE_ID` at the uploaded file.

## Environment variables

Copy `.env.example` to `.env` and fill in:

- `VITE_APPWRITE_ENDPOINT`
- `VITE_APPWRITE_PROJECT_ID`
- `VITE_APPWRITE_PROJECT_NAME`
- `VITE_APPWRITE_DATABASE_ID`
- `VITE_APPWRITE_TABLE_ID`
- `VITE_APPWRITE_CONTENT_BUCKET_ID`
- `VITE_APPWRITE_RESUME_FILE_ID`
- `APPWRITE_API_KEY` server-side API key for reading Appwrite Storage and server-side content loaders

Suggested API key scopes:

- `databases.read`
- `files.read`

## Development

```bash
npm install
npm run dev
```

## Project Notes

If you want the fast version of how this app is put together:

- [STYLING.md](/home/flo178/projects/home/STYLING.md)
  Design tokens, shadcn-style primitives, and dark mode.
- [ROUTING.md](/home/flo178/projects/home/ROUTING.md)
  How TanStack Start pages, loaders, params, and route files fit together.
- [APPWRITE_ARCHITECTURE.md](/home/flo178/projects/home/APPWRITE_ARCHITECTURE.md)
  Auth, database/storage access, and what is or is not cached.
- [CLIENT_SERVER_BOUNDARY.md](/home/flo178/projects/home/CLIENT_SERVER_BOUNDARY.md)
  Which code runs in the browser, which runs on the server, and how TanStack Start bridges both.

## Tests

```bash
npm run test
```

## Content customization

Update these files first:

- `src/content/profile.ts`
- `src/content/projects.ts`

These hold your profile copy, links, and manually curated GitHub projects.
