# BlockNote Embeds In This Repo

## Scope

This note is the practical embed guide for the blog editor in this repo.

It answers three questions:

1. What does current BlockNote support out of the box?
2. What does this repo support today?
3. Which block should you choose for YouTube, Instagram, Reels, Pinterest, and X?

## Versions

Local repo version:

- `@blocknote/core`: `^0.23.0`
- `@blocknote/react`: `^0.23.0`
- `@blocknote/shadcn`: `^0.23.0`

Latest public BlockNote release I checked:

- `v0.47.0` on `2026-02-23`
- source: `https://github.com/TypeCellOS/BlockNote/releases`

## What BlockNote Supports Out Of The Box

The current official docs for BlockNote's built-in embed blocks list only:

- `file`
- `image`
- `video`
- `audio`

Official docs:

- `https://www.blocknotejs.org/docs/features/blocks/embeds`
- `https://www.blocknotejs.org/docs/features/blocks`

Important detail:

- the official docs describe the `video` block as taking a `url` and rendering a video preview
- the examples use a direct video file URL such as `.webm`
- the docs do not describe a generic iframe/oEmbed/social-embed block

That means "embed" in BlockNote currently means media/file blocks, not a general "paste any social URL and let BlockNote oEmbed it" feature.

## Practical Conclusion

If you paste a normal YouTube page URL into BlockNote's built-in `video` block, BlockNote does **not** automatically treat it as a YouTube iframe embed.

This is consistent with:

- the official embed docs only showing file/image/video/audio blocks
- the built-in examples using direct media asset URLs instead of YouTube pages
- the historical GitHub issue where a YouTube watch URL in a `video` block failed:
  - `https://github.com/TypeCellOS/BlockNote/issues/859`

I did **not** find any official current documentation showing built-in support for:

- YouTube watch URL auto-conversion to iframe embed
- YouTube Shorts auto-conversion to iframe embed
- Instagram post embed blocks
- Instagram Reels embed blocks
- Pinterest embed blocks
- X embedded post blocks
- a generic iframe or oEmbed block

So the answer to "should I have used a generic embed block instead of video?" is:

- no, not with stock BlockNote
- BlockNote does not currently expose a built-in generic embed block in the official docs I checked

## Support Matrix For This Repo

### Works today

- Direct image URLs or uploaded images
- Direct audio URLs or uploaded audio
- Direct video file URLs such as `.mp4` or `.webm`
- YouTube watch URLs
- YouTube Shorts URLs
- `youtu.be` short URLs

### Does not work out of the box here

- Instagram post URLs
- Instagram Reel URLs
- Pinterest pin URLs
- X post URLs
- arbitrary iframe embed snippets

## Why YouTube Needed Custom Logic Here

BlockNote's built-in `video` block is conceptually a "video file/media block".

A YouTube page URL is not a video file URL. It needs:

- URL parsing
- conversion to an embeddable iframe URL
- iframe rendering in both the editor and exported/read-only HTML

That is why this repo now has a custom BlockNote video block override in:

- [src/lib/blocknote.tsx](/home/flo178/projects/home/src/lib/blocknote.tsx)

That custom block keeps normal video-file behavior for direct media URLs, but converts known YouTube URLs into iframe embeds.

Both the editor and the read-only renderer use that shared schema:

- [src/components/blog-editor.tsx](/home/flo178/projects/home/src/components/blog-editor.tsx)
- [src/components/blog-content.tsx](/home/flo178/projects/home/src/components/blog-content.tsx)

## Recommended Block Choice

### YouTube

Use the normal YouTube URL. This repo now handles:

- `https://www.youtube.com/watch?v=...`
- `https://youtu.be/...`
- `https://www.youtube.com/shorts/...`
- `https://www.youtube.com/embed/...`

Recommendation:

- keep using the `video` block in this repo, because we already mapped it to the correct YouTube behavior

### Instagram / Reels

Do **not** expect stock BlockNote `video` or `image` blocks to render Instagram embeds.

If you want Instagram support, the right implementation is likely one of these:

1. add a dedicated custom social embed block
2. add a generic iframe/embed block with an allowlist
3. transform Instagram URLs server-side into approved embed HTML

For this repo, option 1 is the cleanest.

### Pinterest

Same conclusion as Instagram:

- not a built-in BlockNote embed type
- should be treated as a custom embed block or a controlled generic embed block

### X (formerly Twitter)

X does have an official embed path, but it is **not** the same kind of embed as BlockNote's built-in `video` or `image` blocks.

Current official X guidance I checked:

- `help.x.com` says to use `Embed post`, which sends you to `publish.x.com`
- the X developer docs also support converting a post URL through the `publish.twitter.com/oembed` endpoint
- the returned result is HTML/script-based embed markup recognized by X's widget JavaScript

Sources:

- `https://help.x.com/en/using-x/how-to-embed-a-post`
- `https://developer.x.com/docs/twitter-for-websites/embedded-tweets/overview`
- `https://developer.x.com/en/docs/twitter-for-websites/oembed-api`
- `https://developer.x.com/developer-terms/display-requirements.html`

Practical implication:

- X embeds are closer to "provider-owned embed HTML + widget JS"
- they are **not** direct media URLs
- they are also **not** a natural fit for BlockNote's stock `video` block

So for this repo, X should be treated the same way as Instagram and Pinterest:

- either a dedicated custom embed block
- or a controlled generic embed block with provider-specific rendering

If we support X later, the safest implementation pattern is:

1. store the canonical X post URL
2. render a provider-specific embed wrapper for read-only posts
3. keep provider logic isolated instead of trying to force it through `video`

One additional constraint:

- X's own display requirements strongly prefer official embedded posts or current API-backed rendering
- if we ever render X posts without the official embed flow, we would need to satisfy their display rules ourselves

That makes X a worse candidate for "just iframe it" than YouTube.

## Recommended Rule For This Repo

Use these rules unless there is a broader editor redesign:

1. Use stock BlockNote blocks for native media types:
   - file
   - image
   - audio
   - direct video files
2. Use custom schema blocks when the target is really an iframe/social embed:
   - YouTube
   - Instagram
   - Pinterest
3. Do not assume "URL + video block" means "oEmbed".

## If We Want More Social Embeds Later

The next clean step would be a dedicated custom block such as:

- `socialEmbed`

With props like:

- `provider`
- `url`
- `caption`

And an allowlist of supported providers:

- `youtube`
- `instagram`
- `pinterest`
- `x`

That would be more correct than overloading the `video` block for every non-file embed on the web.

## Short Summary

The current custom YouTube logic in this repo is justified.

BlockNote's current public docs do not show a built-in generic embed block, and they do not document stock support for YouTube/Instagram/Pinterest page URLs as iframe embeds.

So:

- YouTube in this repo: custom logic is appropriate
- Instagram, Pinterest, and X: would require additional custom embed support
