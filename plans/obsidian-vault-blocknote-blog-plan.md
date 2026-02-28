# Obsidian Excalidraw Topic Maps + BlockNote Blog

## Summary

This revised model is feasible and, structurally, cleaner than trying to publish a broad Obsidian vault.

Recommended architecture:

- Use **Obsidian + Excalidraw locally** to build one durable topic map per subject.
- Treat each published map as a **manually exported and uploaded artifact** in Appwrite Storage.
- Add a new **`/maps/$slug`** section in this app for those topic maps.
- Keep **BlockNote blog posts fully separate** in the existing Appwrite table workflow.
- Allow blog posts to **reference maps by slug**, for example `/maps/deep-learning`.

Bottom line:

- **Yes**, this is more practical than full Obsidian-vault publishing.
- **Yes**, blog posts can remain separate and link to maps cleanly.
- **Yes**, slug-based routing like `/maps/deep-learning` fits the current app structure well.
- **No**, I would still avoid using Appwrite as the live source of truth for the Obsidian files themselves.

## What Changed In The Plan

The original plan assumed a published subset of Markdown notes. Your updated idea is narrower and better defined:

- the primary knowledge unit is a **topic map**
- authored as an **Obsidian Excalidraw document**
- optionally containing rich embeddings, diagrams, and linked structure
- published manually when you decide a topic is worth surfacing

That gives you a simpler content model:

- **maps** = durable visual knowledge artifacts
- **blog posts** = fleeting/editorial writing that can cite, explain, or extend maps

This is a good separation.

## Recommended Product Model

### Maps

Maps should be treated as a dedicated published content type:

- one Excalidraw document per topic
- one stable slug per topic
- manually exported from Obsidian before publishing
- manually uploaded to Appwrite Storage
- rendered publicly at `/maps/$slug`

Examples:

- `/maps/deep-learning`
- `/maps/riach-embeddings`
- `/maps/chagas-ecg-representation-learning`

### Blog posts

Blog posts stay as they are now:

- written in BlockNote
- stored as Appwrite table rows
- published independently
- optionally linked to one or more topic maps

Examples of relationship direction:

- a blog post can say “see the map” and link to `/maps/deep-learning`
- a map detail page can show “related posts” if desired

### Source of truth

Keep source of truth split by intent:

- **Obsidian vault** = source of truth for topic maps during authoring
- **Appwrite Storage + map metadata table** = source of truth for published map artifacts
- **Appwrite blog table** = source of truth for published blog posts

## Why This Direction Is Stronger

This is better than full vault publishing for your current use case because:

- it matches how you actually want to think: one visual map per topic
- it avoids building a full Markdown wiki renderer prematurely
- it avoids the complexity of syncing raw vault semantics to the website
- it gives you explicit editorial control over what becomes public
- it keeps the public website stable even if your private vault structure changes

The main tradeoff is that publishing is manual, but that is likely a benefit here, not a problem.

## Recommended Publishing Workflow

### Authoring workflow

For each topic:

1. Create an Excalidraw document in Obsidian.
2. Use it as the canonical topic map.
3. Add drawings, embedded concepts, and whatever supporting structure you need locally.
4. Export a publishable artifact from Obsidian.

### Published artifact format

Recommended first choice:

- export to **SVG**

Fallback:

- export to **PNG** if SVG becomes too brittle or large

Reason:

- SVG preserves detail better for knowledge maps
- it scales better across desktop/mobile
- it can often remain sharper than raster screenshots

Do not plan around publishing the raw `.excalidraw.md` file in v1.

### Manual publish step

When a map is ready:

1. Export the current Excalidraw map to SVG or PNG.
2. Upload the exported asset to Appwrite Storage.
3. Create or update a map metadata record in Appwrite.
4. Publish/update the route at `/maps/$slug`.

This should be manual by design.

## Public Content Model

Add a new map entity separate from blog posts.

Recommended shape:

```ts
type TopicMap = {
  id: string
  slug: string
  title: string
  summary?: string
  topic: string
  status: "draft" | "published"
  assetType: "svg" | "png"
  assetFileId: string
  assetUrl: string
  sourceTool: "obsidian-excalidraw"
  tags: string[]
  relatedPostSlugs: string[]
  publishedAt?: string
  updatedAt?: string
}
```

This should not be merged into `BlogPost`. It is a distinct content type.

## Appwrite Design

### Storage

Use Appwrite Storage for the exported map assets:

- SVG exports
- PNG exports

Recommended bucket usage:

- keep blog/editor uploads in the existing content bucket if you want minimal setup
- or create a dedicated bucket for maps if you want cleaner separation

Preferred long-term option:

- dedicated maps bucket, for example `topic-maps`

### Database / table

Add a dedicated Appwrite table for map metadata.

Suggested fields:

- `title`
- `slug`
- `summary`
- `topic`
- `status`
- `assetType`
- `assetFileId`
- `tags`
- `relatedPostSlugs`
- `publishedAt`

Suggested indexes:

- unique index on `slug`
- index on `status`
- index on `publishedAt`

This mirrors the current blog pattern and fits the app’s existing architecture.

## Routing Model

Add:

- `/maps`
- `/maps/$slug`

Behavior:

- `/maps` lists published topic maps
- `/maps/$slug` renders the specific uploaded artifact plus metadata

Example page structure for `/maps/deep-learning`:

- title
- summary
- topic/tags
- published/updated timestamps
- embedded SVG or image
- optional related posts

## Blog-to-Map Linking

Yes, blog posts can reference maps cleanly.

There are two good levels of support:

### Level 1: simple links

Blog posts just include normal links to map routes:

- `/maps/deep-learning`

This is the minimal and sufficient first version.

### Level 2: typed relationship metadata

Add optional map references on blog posts, for example:

```ts
relatedMapSlugs: string[]
```

That allows:

- showing “Related maps” on blog posts
- showing “Referenced in posts” on map pages
- filtering posts by map relationship

I recommend this as a second step, not the first one.

## Slug Strategy

Slug routing is absolutely the right model here.

Use stable human-readable slugs such as:

- `deep-learning`
- `representation-learning`
- `riach-embeddings`

Rules:

- slug is explicit and editable
- slug must be unique among maps
- slug should not depend on the uploaded filename
- replacing the asset should not require changing the slug

This keeps public URLs stable even as the map evolves.

## Recommended UX Separation

The site navigation should make the distinction explicit:

- `Blog`
- `Maps`

The homepage or section copy should frame them differently:

- Blog = essays, updates, commentary
- Maps = structured visual knowledge objects

That separation is clearer than mixing everything into one notes/garden section.

## Implementation Plan

### 1. Preserve the existing blog system

Do not change the current BlockNote/Appwrite blog workflow.

Reason:

- it already works
- it fits short-form editorial publishing
- it should remain independent from map publishing

### 2. Add a map metadata repository

Create a new repository similar to the posts repository, for example:

- `src/lib/repositories/maps.ts`

Responsibilities:

- list published maps
- fetch published map by slug
- admin create/update map metadata

### 3. Add Appwrite storage support for uploaded map assets

Add a new upload flow for map assets:

- admin uploads exported SVG/PNG
- app stores file in Appwrite Storage
- returned file ID is saved into the map record

This can reuse the current browser Appwrite SDK pattern.

### 4. Add admin UI for maps

Create a simple admin flow:

- list maps
- create new map entry
- edit existing map metadata
- upload/replace current map asset
- publish/unpublish map

This admin UI should be simpler than the blog editor because map content itself is not authored inside the app.

### 5. Add public routes

Create:

- `src/routes/maps.index.tsx`
- `src/routes/maps.$slug.tsx`

Public behavior:

- only published maps are shown
- draft maps remain private

### 6. Render SVG/PNG carefully

For public map pages:

- if `assetType === "svg"`, render inline only if sanitized and safe, otherwise render as hosted image/object
- if `assetType === "png"`, render as image
- support zoom or open-in-new-tab if needed later

Conservative v1 choice:

- render uploaded asset as an image/view URL, not inline-transformed SVG markup

### 7. Keep map relationships optional

Initial map record should not require blog references.

Optional later additions:

- `relatedPostSlugs`
- `relatedMapSlugs`

Start simple.

## Testing And Acceptance Criteria

### Core acceptance

- A published map appears on `/maps`.
- A draft map does not appear publicly.
- `/maps/$slug` resolves correctly for published maps.
- Updating the uploaded asset does not change the public slug.
- Existing `/blog` routes continue to work unchanged.
- A blog post can link to `/maps/$slug` successfully.

### Edge cases

- Two maps cannot share the same slug.
- Replacing an asset preserves metadata.
- Missing or deleted asset files degrade gracefully.
- SVG and PNG uploads both render correctly.
- Unpublished maps are not discoverable from the public list or slug route.

### Suggested test coverage

- repository tests for map slug uniqueness and status filtering
- route tests for `/maps` and `/maps/$slug`
- tests for metadata mapping from Appwrite rows
- regression tests for existing blog repository behavior

## Assumptions And Defaults

- Topic maps are the primary published knowledge artifact.
- Topic maps are authored locally in Obsidian Excalidraw.
- Publishing is manual, not automatic sync.
- Appwrite stores published artifacts and metadata, not the live vault.
- Blog posts remain independent content objects.
- Blog posts may reference maps by slug.
- Map URLs should be stable and human-readable.

## What I Think

I think this is a better design than the earlier “publish part of the vault” idea.

Why:

- it matches your actual working style more closely
- it gives you a durable object per topic
- it avoids overcommitting to full digital-garden infrastructure
- it keeps the public information architecture clean
- it is much easier to maintain in the app you already have

The main caution is this:

- if you eventually want rich interactive zooming, node-level linking, or canvas-like navigation on the website, exported SVG/PNG may become limiting

But for v1, that is the correct tradeoff. Start with stable published artifacts, not a browser recreation of Obsidian.

## Exposing Raw `*.excalidraw` Files In The Browser

There is one more useful middle ground between “only export SVG/PNG” and “fully recreate Obsidian in the browser”:

- publish the raw Excalidraw file itself as a downloadable or browser-openable artifact
- separately publish the rendered SVG/PNG as the primary public view

This is the recommended model if you want readers to inspect or reuse the source drawing.

### Important limitation

Obsidian Excalidraw files are not always the same thing as plain standalone Excalidraw `.excalidraw` JSON files.

Depending on how you save/export from the plugin, you may end up with:

- Obsidian plugin-specific files such as `.excalidraw.md`
- exported SVG/PNG
- or a standard Excalidraw JSON export

That distinction matters because browsers cannot natively render a raw Excalidraw source file by themselves. A browser needs either:

- a rendered image or SVG
- or a frontend Excalidraw viewer/editor capable of loading the JSON file

### Recommended publish shape

For each topic map, store up to three artifacts:

- primary rendered asset: SVG or PNG
- optional raw source export: standard `.excalidraw` JSON file
- optional original Obsidian source: `.excalidraw.md`, private by default

Public behavior:

- the map page renders the SVG/PNG as the canonical public view
- the page offers a “Download source” or “Open source file” link for the raw `.excalidraw` export if available
- the Obsidian-specific `.excalidraw.md` source should usually remain private unless you have confirmed it is useful to external readers

### Browser exposure options

There are three realistic options:

#### Option 1: download-only

- upload the exported `.excalidraw` file to Appwrite Storage
- expose it as a file link on `/maps/$slug`
- readers can download and import it into Excalidraw or compatible tools

This is the safest first version.

#### Option 2: open in external Excalidraw-compatible flow

- host the exported `.excalidraw` file in Appwrite
- add a button that downloads it or opens a separate tool/workflow that can import it

This is still simple and avoids embedding a complex editor in your app.

#### Option 3: embedded browser viewer

- store a standard `.excalidraw` JSON export
- build or embed a frontend viewer using the Excalidraw web package
- load the JSON from Appwrite and render it interactively on `/maps/$slug`

This is feasible later, but it is a materially larger implementation and should not be the first version unless interactivity is the core requirement.

### Recommended default

Default behavior for v1:

- public page shows exported SVG/PNG
- public page optionally includes a raw `.excalidraw` download link
- no embedded interactive Excalidraw renderer yet

That gives readers access to the source artifact without forcing you to solve full browser-side Excalidraw compatibility immediately.

## Future Phase: Custom Excalidraw Viewer

If richer browser-side map consumption becomes important, a custom Excalidraw viewer is a reasonable v2 for this app, as long as it stays read-only.

### Why this is reasonable

A read-only viewer is materially simpler than trying to recreate the full Excalidraw web app or the Obsidian plugin experience.

It would let readers:

- zoom and pan the scene
- inspect the full canvas more naturally than with a static SVG
- get closer to the original Excalidraw structure
- download the source file if they want to reuse it

This is a realistic extension of the current app.

### Why this should not be v1

What becomes expensive quickly:

- writing changes back into your canonical source
- live collaboration
- share-link semantics similar to `excalidraw.com`
- Obsidian-specific wikilinks, transclusions, or plugin behaviors
- exact parity with the Obsidian editing workflow

The Excalidraw package supports rendering and editing scenes, but collaboration and hosted sharing behavior are not something you get for free just by embedding the package.

### Recommended v2 scope

Keep the viewer explicitly read-only:

- load a standard exported `.excalidraw` JSON file from Appwrite Storage
- render it inside `/maps/$slug`
- disable persistence from the browser
- optionally hide most editing controls
- preserve a separate SVG/PNG asset as fallback and preview

This keeps the implementation bounded and avoids confusing the website with the authoring tool.

### Suggested storage model for viewer support

For each published topic map, support both:

- `primary rendered asset`
  - SVG or PNG
  - used for previews, cards, and guaranteed fallback rendering
- `raw source asset`
  - standard `.excalidraw` export
  - used by the future viewer and for source download

Recommended metadata shape extension:

```ts
type TopicMap = {
  id: string
  slug: string
  title: string
  summary?: string
  topic: string
  status: "draft" | "published"
  assetType: "svg" | "png"
  assetFileId: string
  assetUrl: string
  sourceTool: "obsidian-excalidraw"
  sourceFileId?: string
  sourceFormat?: "excalidraw"
  sourceUrl?: string
  tags: string[]
  relatedPostSlugs: string[]
  publishedAt?: string
  updatedAt?: string
}
```

### Suggested route evolution

Initial route model:

- `/maps`
- `/maps/$slug`

Future enhancement options:

- keep `/maps/$slug` as the main page and progressively enhance it with the viewer
- or add a dedicated source view such as `/maps/$slug/source`

Preferred default:

- keep one route, `/maps/$slug`
- show the rendered asset by default
- load the read-only Excalidraw viewer only when a source file is available and the UI chooses to expose it

### Acceptance criteria for the future viewer

- A published map with a stored `.excalidraw` source can be opened in a read-only browser viewer.
- The viewer reads from Appwrite Storage and does not mutate the source.
- A fallback rendered SVG/PNG remains available if the viewer fails.
- Readers can still download the raw `.excalidraw` source directly.
- Existing blog-to-map links continue to work unchanged.
