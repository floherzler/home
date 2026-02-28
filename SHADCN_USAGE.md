# Shadcn Usage In This Project

This project uses a Shadcn-style component approach on top of Tailwind, and BlockNote is now integrated through BlockNote's Shadcn UI package instead of Mantine.

## Current Setup

- BlockNote editor UI uses `@blocknote/shadcn`
- BlockNote editor core uses `@blocknote/react`
- Project styling is driven by Tailwind plus CSS variables in `src/styles.css`
- Local UI primitives live under `src/components/ui`

Relevant files:

- `src/components/blog-editor.tsx`
- `src/components/blog-content.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/styles.css`

## What "Using Shadcn" Means Here

This repo is not using the `shadcn/ui` CLI-generated full component catalog. Instead, it uses a lightweight local Shadcn-style layer:

- Tailwind utility classes
- shared design tokens via CSS variables
- small reusable UI primitives in `src/components/ui`

That is enough for BlockNote's Shadcn integration, as long as the expected style tokens and component overrides are available.

## BlockNote Integration

The editor uses the supported integration path for the installed BlockNote version:

- `useCreateBlockNote(...)` from `@blocknote/react`
- `BlockNoteView` from `@blocknote/shadcn`

This matters because BlockNote's built-in UI depends on a components context provider. The Shadcn package mounts that provider correctly, while the earlier raw integration path did not.

## Reused Local Components

The BlockNote admin editor explicitly reuses this project's local UI modules:

- `Button` from `src/components/ui/button.tsx`
- `Card` from `src/components/ui/card.tsx`

These are passed into BlockNote here:

- `src/components/blog-editor.tsx`

via:

```tsx
shadCNComponents={{ Button, Card }}
```

That means BlockNote uses the same button/card styling direction as the rest of the app where those slots apply.

## Styles Required By BlockNote Shadcn

BlockNote's Shadcn package needs Tailwind to scan its classes and it expects Shadcn-style theme tokens.

Those pieces are configured in `src/styles.css`:

- `@source "../node_modules/@blocknote/shadcn";`
- `@custom-variant dark (&:is(.dark *));`
- `@theme inline { ... }`
- `.bn-shadcn * { @apply border-border outline-ring/50; }`

## Theme Tokens

The project maps its own design system variables onto Shadcn-style token names, for example:

- `--background`
- `--foreground`
- `--card`
- `--popover`
- `--primary`
- `--muted`
- `--accent`
- `--border`
- `--input`
- `--ring`

These are then exposed to Tailwind/BlockNote through `@theme inline`.

This is the bridge that lets BlockNote Shadcn UI inherit the existing project look instead of feeling visually disconnected.

## Where Shadcn Is Used Today

- Admin blog editor UI
- Read-only blog content renderer via BlockNote's Shadcn view
- Local reusable UI primitives such as button and card

## What Is Not Yet Fully Standardized

The project does not yet expose a full local Shadcn component set for every BlockNote slot. Right now, only the components we actually need to override are wired in directly.

So the setup is:

- fully on the BlockNote Shadcn integration path
- partially backed by local project-level Shadcn-style primitives

That is a reasonable minimal setup and avoids dragging in an unnecessary component surface area.

## Image Upload

The switch from Mantine to Shadcn did not change the upload architecture.

Image upload still works through:

- `uploadFile` in `src/components/blog-editor.tsx`
- `uploadBlogImage` in `src/lib/appwrite.ts`

The UI shell changed, but the Appwrite upload path stayed the same.

## Recommended Rule For This Project

If a new editor or overlay UI is added, prefer:

1. local components in `src/components/ui`
2. Tailwind classes using the existing CSS variable tokens
3. Shadcn-compatible naming and structure when possible

This keeps the admin/editor UI visually consistent and avoids splitting the project across multiple UI systems.

## Practical Summary

Yes: the BlockNote editor is now on the Shadcn integration path, and it already reuses local project UI components.

More precisely:

- BlockNote provides the editor behavior and UI framework integration
- this project provides theme tokens and selected local Shadcn-style primitives
- the result is much closer to a single UI system than the earlier Mantine-based setup

## Quickstart For Custom UI Adjustments

This section is the practical Tailwind crash course for this codebase.

If you want to change how the UI looks, there are three main layers:

1. design tokens in `src/styles.css`
2. reusable UI primitives in `src/components/ui`
3. feature-level layout classes directly in components

### 1. Change Tokens First

If the whole app or whole editor feels off, start in `src/styles.css`.

This file defines the visual system:

- colors
- shadows
- radii
- fonts
- dark mode values

Examples:

- `--color-paper` controls the page background
- `--color-ink` controls main text color
- `--color-accent-button` controls primary button color
- `--shadow-soft` and `--shadow-panel` control depth

Rule of thumb:

- if many components should change together, edit tokens
- if only one component should change, edit the component class list

### 2. Then Adjust The Reusable UI Primitive

Local UI primitives live in `src/components/ui`.

Right now the important ones are:

- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`

These components already centralize shared Tailwind classes. For example, the button variants are defined as string maps:

```tsx
const variantClasses = {
  default: "...",
  outline: "...",
  ghost: "...",
};
```

So if all outline buttons should feel stronger, change the `outline` entry once instead of editing every usage site.

### 3. Use Feature-Level Classes For Local Layout

For one-off layout or spacing changes, edit the component where the UI is rendered.

Example:

- `src/components/blog-editor.tsx`

That is where you would change:

- editor header spacing
- help chip layout
- upload message styling
- editor shell padding

This keeps reusable primitives clean and avoids stuffing feature-specific styles into global UI components.

## Tailwind Patterns Used In This Repo

The codebase mostly uses Tailwind in these ways:

- utility classes directly in `className`
- CSS variables inside arbitrary values
- small reusable class maps in component files

Examples from this repo:

```tsx
className="rounded-[1.75rem] border border-[var(--color-line)] bg-[var(--color-elevated)]"
```

```tsx
className="text-[var(--color-muted)] hover:text-[var(--color-ink)]"
```

```tsx
const sizeClasses = {
  sm: "h-9 rounded-full px-4 text-sm",
  lg: "h-12 rounded-full px-6",
};
```

That means the project does not rely on a huge abstraction layer. Most visual decisions are readable directly in the component.

## How To Safely Change A Component

Use this order:

1. inspect the component file
2. identify whether the problem is token-level, primitive-level, or feature-level
3. change the smallest layer that fixes the problem

Examples:

- Button color is wrong everywhere:
  change token values in `src/styles.css` or the button variant map in `src/components/ui/button.tsx`
- Blog editor card is too cramped:
  change spacing in `src/components/blog-editor.tsx`
- Dark mode is too heavy:
  adjust `.dark` token values in `src/styles.css`

## How `cn(...)` Works Here

This repo uses a very small helper in `src/lib/utils.ts`:

```ts
export function cn(...values) {
  return values.filter(Boolean).join(" ");
}
```

It is only a conditional class joiner. It does not do Tailwind conflict resolution.

That means:

- later classes do not automatically override earlier conflicting utilities in a smart way
- avoid stacking multiple conflicting utilities unless you are sure about the final output

Good usage:

```tsx
cn("rounded-full px-4", isActive && "bg-[var(--color-accent-soft)]")
```

Less safe usage:

```tsx
cn("px-4", compact && "px-2")
```

That can still work, but it is less explicit and easier to get wrong.

## Recommended Customization Workflow

For this codebase, the cleanest workflow is:

1. define or adjust tokens in `src/styles.css` if the change is global
2. update the primitive in `src/components/ui` if the pattern is shared
3. apply final local layout tweaks in the feature component

This avoids two common problems:

- overusing global CSS for component-level issues
- duplicating the same Tailwind strings in many places

## BlockNote-Specific Customization

For the BlockNote editor, there are three customization levels:

1. outer shell in `src/components/blog-editor.tsx`
2. BlockNote container styling in `src/styles.css`
3. Shadcn component overrides passed through `shadCNComponents`

Current examples:

- outer shell and header are styled directly in `src/components/blog-editor.tsx`
- editor internals such as `.bn-editor` and `.bn-container` are styled in `src/styles.css`
- local `Button` and `Card` components are injected into BlockNote

If you want a different toolbar/button feel inside BlockNote, the next place to expand is `shadCNComponents`.

## Practical Examples

### Make Dark Mode Lighter

Edit the `.dark` section in `src/styles.css`:

- raise brightness of `--card`
- soften `--popover`
- lighten `--color-elevated`
- increase contrast between `--color-ink` and `--color-muted`

### Make Buttons More Minimal

Edit `src/components/ui/button.tsx`:

- reduce shadows
- reduce border emphasis
- tighten paddings in `sizeClasses`
- simplify hover states

### Make The Editor Feel Airier

Edit both:

- `src/components/blog-editor.tsx`
- `src/styles.css`

Typical changes:

- increase shell padding
- increase `.bn-editor` padding
- reduce border noise
- increase space between helper chips and content

## Rule Of Thumb

When in doubt:

- tokens for system-wide changes
- `src/components/ui` for reusable patterns
- feature components for local layout

That is the intended styling model for this project.
