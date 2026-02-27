# Appwrite SDK Setup

This project uses two different Appwrite SDKs for two different jobs.

## Which SDK is used where

### `appwrite`

Use the Web SDK for client-side app interactions.

This is the right SDK for:

- browser auth
- user sessions
- frontend reads and writes as the signed-in user
- code that runs in the app UI

In this repo, that includes files like:

- `src/lib/appwrite.ts`
- client-side routes and components that call Appwrite directly

### `node-appwrite`

Use the Node server SDK for server-side admin operations.

This is the right SDK for:

- database creation
- table creation
- schema seeding
- server-side access with an Appwrite API key
- admin operations that should not run in the browser

In this repo, that includes:

- `src/lib/appwrite-server.ts`
- `scripts/appwrite-seed.mjs`

## Why the split matters

The Web SDK and the Node SDK do not expose the same methods.

For example:

- client SDK code in this repo uses browser-oriented auth/session behavior
- server SDK code uses API-key-based admin access

If you try to use the Web SDK for schema creation, you will hit missing-method errors.

## What you need to run

Run these commands from the project root.

### 1. Install dependencies

```bash
npm install
```

This is required because the seed script depends on `node-appwrite`.

### 2. Seed Appwrite

```bash
npm run appwrite:seed
```

This creates the configured database and table schema if they do not already exist.

### 3. Optional: seed a starter post

```bash
npm run appwrite:seed -- --with-sample
```

The first `--` is npm argument forwarding. It passes `--with-sample` to the script itself.

### 4. Start the app

```bash
npm run dev
```

## Recommended order

```bash
npm install
npm run appwrite:seed
npm run dev
```

If you want a sample post:

```bash
npm install
npm run appwrite:seed -- --with-sample
npm run dev
```

## Required environment variables

Your `.env` needs these values for the seed script and server access:

- `VITE_APPWRITE_ENDPOINT`
- `VITE_APPWRITE_PROJECT_ID`
- `VITE_APPWRITE_DATABASE_ID`
- `VITE_APPWRITE_TABLE_ID`
- `APPWRITE_API_KEY`

The rest can be filled in later if you are only trying to get the database bootstrapped.
