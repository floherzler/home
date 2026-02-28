# Rendering Model In This Repo

This is the practical answer to:

- why does this app do server rendering at all?
- what runs on the server?
- what runs in the browser?
- how do I avoid `document is not defined` style bugs?

## Short Answer

This app uses **TanStack Start**, which means routes are **server-rendered first** by default and then **hydrated** in the browser.

So for most pages:

1. the server renders HTML first
2. the browser receives that HTML
3. React hydrates it and adds interactivity

That is why browser-only code can fail even inside a normal React component:

- the component may be rendered on the server before the browser ever sees it

## Why Server Rendering Exists Here

You did not explicitly build a separate backend/frontend split, but TanStack Start gives you SSR by default because it helps with:

- first page load speed
- content showing before JS finishes loading
- route loaders fetching data on the server
- public pages like blog posts being renderable as HTML immediately

In this repo, public pages like:

- `/`
- `/blog`
- `/blog/$slug`
- `/resume`

all fit that pattern well.

## The Core Mental Model

There are three different things happening in this app:

### 1. Server render

React renders route components to HTML on the server.

Examples:

- [src/routes/__root.tsx](/home/flo178/projects/home/src/routes/__root.tsx)
- [src/components/site-shell.tsx](/home/flo178/projects/home/src/components/site-shell.tsx)
- [src/routes/blog.index.tsx](/home/flo178/projects/home/src/routes/blog.index.tsx)
- [src/routes/blog.$slug.tsx](/home/flo178/projects/home/src/routes/blog.$slug.tsx)

Important consequence:

- code that runs during render must be safe without `window` or `document`

### 2. Client hydration

After the HTML arrives, React runs in the browser and hydrates the page.

This is when browser-only behavior becomes safe:

- `window`
- `document`
- `localStorage`
- DOM observers
- click handlers

Examples:

- theme toggle behavior
- editor interactivity
- hover panels

### 3. Server functions / loaders

Some data fetching runs on the server through route loaders and `createServerFn(...)`.

Examples:

- [src/routes/blog.index.tsx](/home/flo178/projects/home/src/routes/blog.index.tsx)
- [src/routes/blog.$slug.tsx](/home/flo178/projects/home/src/routes/blog.$slug.tsx)
- [src/lib/repositories/posts.ts](/home/flo178/projects/home/src/lib/repositories/posts.ts)

This is separate from hydration.

It means:

- a page can be server-rendered
- and its data can also be fetched server-side
- and then the browser hydrates the result

## What Currently Runs Where

## Safe On The Server

These are SSR-safe because they mostly render HTML from props/loader data:

- [src/routes/__root.tsx](/home/flo178/projects/home/src/routes/__root.tsx)
- [src/components/site-shell.tsx](/home/flo178/projects/home/src/components/site-shell.tsx)
- [src/routes/blog.index.tsx](/home/flo178/projects/home/src/routes/blog.index.tsx)
- [src/routes/blog.$slug.tsx](/home/flo178/projects/home/src/routes/blog.$slug.tsx)
- [src/components/blog-post-card.tsx](/home/flo178/projects/home/src/components/blog-post-card.tsx)

## Browser-Only Or Client-Sensitive

These must be treated carefully because they touch browser APIs or browser-oriented libraries:

- [src/components/theme-toggle.tsx](/home/flo178/projects/home/src/components/theme-toggle.tsx)
- [src/components/blog-editor.tsx](/home/flo178/projects/home/src/components/blog-editor.tsx)
- BlockNote / TipTap editor creation
- anything using `window`, `document`, `MutationObserver`, or `localStorage`

## Mixed

[src/components/blog-content.tsx](/home/flo178/projects/home/src/components/blog-content.tsx) is now intentionally mixed:

- server side: render `contentHtml` fallback
- client side: mount BlockNote for richer read-only rendering

That split exists because BlockNote editor creation touches the DOM too early for SSR.

## The Bug You Just Hit

This stack:

```txt
ReferenceError: document is not defined
...
at BlogContent (.../src/components/blog-content.tsx:31:17)
```

meant:

- `BlogContent` was being rendered on the server
- `useCreateBlockNote(...)` ran during that render
- BlockNote created TipTap immediately
- TipTap touched `document`
- SSR crashed

So the issue was not "React is confused".

The issue was:

- a browser-oriented editor object was being created during server rendering

## Practical Rules

Use these rules in this repo.

### Rule 1

If a component creates a rich editor instance, assume it is **not SSR-safe** until proven otherwise.

Examples:

- BlockNote
- TipTap
- anything that mounts or measures DOM during initialization

### Rule 2

If code touches any of these, it is browser-only:

- `window`
- `document`
- `localStorage`
- `MutationObserver`
- `ResizeObserver`
- direct DOM APIs

That code must either:

- run inside `useEffect`
- or only render after a client-only guard

### Rule 3

Do not import browser-heavy modules into SSR paths unless the import itself is safe.

This matters because even if you only use one helper from a module, importing that module can still pull in browser-only code.

That is why the YouTube URL helper was moved out of the BlockNote custom module into:

- [src/lib/utils/embeds.ts](/home/flo178/projects/home/src/lib/utils/embeds.ts)

## How To Think About A Component

When you create or edit a component, ask:

1. Is this component rendered by a route?
2. If yes, can it render on the server without browser globals?
3. If not, should it:
   - defer setup to `useEffect`
   - gate rendering behind `isClient`
   - or render a simpler server fallback?

## Patterns To Use

### Safe pattern: render-only component

Good for SSR:

- takes data as props
- returns JSX
- no browser globals
- no editor initialization

### Safe pattern: client-only enhancement

Good when SSR HTML is still useful:

1. render fallback HTML on the server
2. after mount, replace/enhance with client-only UI

That is now the pattern used by:

- [src/components/blog-content.tsx](/home/flo178/projects/home/src/components/blog-content.tsx)

### Safe pattern: browser-only effect

Good for theme, observers, and DOM syncing:

```tsx
useEffect(() => {
  // browser-only code here
}, []);
```

## Current Practical Map

If you want the simplest operational rule for this repo:

- route components are server-rendered first
- anything editor-related should be assumed client-only
- pure UI/layout components are usually safe on both sides
- loaders and `createServerFn(...)` run on the server
- browser state and DOM APIs only belong in effects or client-only branches

## If You Want Less SSR In The Future

That is a broader app-level choice, not just a component tweak.

You could choose to make more surfaces client-only, but with the current TanStack Start setup the default assumption should remain:

- pages render on the server first
- interactive enhancements attach in the browser afterward

## Recommended Habit

Before adding a new library, especially an editor or widget, check:

1. does it access `document` during initialization?
2. can it be mounted only after client hydration?
3. do we need a server fallback for this route?

If the answer to 1 is yes, do not create it directly during SSR render.
