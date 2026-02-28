# Styling Guide

This document describes how styling works in this project, with emphasis on the current homepage, blog surfaces, and dark mode behavior.

## Stack

- Tailwind CSS v4 is used for utility classes.
- A small shadcn-style component layer is used for repeated UI primitives.
- Global design tokens live in `src/styles.css`.
- Theme switching is handled by toggling a `dark` class on the root `<html>` element.

## Core Files

- `src/styles.css`
  Holds the global color, shadow, and typography tokens for both light and dark mode.
- `src/routes/__root.tsx`
  Injects the global stylesheet and runs the theme initialization script before hydration.
- `src/components/theme-toggle.tsx`
  Renders the theme toggle button and updates the active theme.
- `src/components/ui/button.tsx`
  shadcn-style button primitive used by homepage actions and the theme toggle.
- `src/components/ui/card.tsx`
  shadcn-style card primitive used for the homepage panel and other elevated containers.

## Design Tokens

The project uses CSS custom properties instead of hard-coding colors directly in components.

Important tokens in `src/styles.css`:

- `--color-paper`
  Main page background.
- `--color-paper-end`
  Secondary background color used in the page gradient.
- `--color-surface`
  Primary panel background.
- `--color-elevated`
  Slightly stronger surface used for nested cards and controls.
- `--color-card`
  Secondary chip/card background.
- `--color-tag-surface`
  Dedicated blog tag pill background.
- `--color-tag-ink`
  Dedicated blog tag pill text color.
- `--color-line`
  Border color.
- `--color-ink`
  Primary text color.
- `--color-muted`
  Secondary text color.
- `--color-accent-*`
  Accent palette for links, highlighted text, and primary buttons.
- `--shadow-panel`
  Large container shadow.
- `--shadow-soft`
  Smaller control/card shadow.

Light mode tokens are declared in `:root`. Dark mode overrides live in `.dark`.

## Dark Mode

Dark mode works by adding or removing the `dark` class on `document.documentElement`.

### Initialization

In `src/routes/__root.tsx`, a small inline script runs before hydration:

- reads `localStorage.getItem("theme")`
- applies `dark` when the saved value is `"dark"`
- updates `document.documentElement.style.colorScheme`

This avoids a flash where the page first renders in light mode and then switches after React loads.

### Toggle Behavior

In `src/components/theme-toggle.tsx`:

- the toggle is a compact icon button built on the shared `Button` primitive
- clicking it swaps between `"light"` and `"dark"`
- the selected theme is persisted to `localStorage`

### Theme-Aware Rich Text

BlockNote components do not automatically follow the site theme, so:

- `src/components/blog-content.tsx`
- `src/components/blog-editor.tsx`

observe changes to the root class and pass `theme="light"` or `theme="dark"` to BlockNote accordingly.

## shadcn-Style Component Usage

The repo does not currently use the full shadcn generator output. Instead, it uses a minimal local component layer patterned after shadcn:

- `Button`
- `Card`
- `CardContent`

This keeps the current UI simple while still centralizing repeated styles.

### Button Variants

Defined in `src/components/ui/button.tsx`:

- `default`
  Filled accent button, used for primary actions like `Read the blog`.
- `outline`
  Bordered secondary button, used for things like the GitHub CTA.
- `ghost`
  Minimal button, used for low-emphasis actions like the theme toggle and header controls.

If button contrast needs tuning, change the token values in `src/styles.css` first, not the individual page markup.

## Layout Conventions

Current layout styling is intentionally simple:

- page background gradient is handled in `SiteShell`
- major content containers use `Card` or token-based `bg-[var(--color-surface)]`
- nested content blocks use `bg-[var(--color-elevated)]`
- tag pills use dedicated tag tokens instead of general surface colors

This is why homepage and blog surfaces now stay visually consistent across light and dark mode.

## Typography

Typography is tokenized in `src/styles.css`:

- `--font-sans`: `Manrope`
- `--font-display`: `Instrument Serif`
- `--font-serif`: `Instrument Serif`

General rule:

- body copy and UI text use the sans font
- hero headlines and editorial headings use the display/serif font

## How To Extend Styling Safely

When adding or changing UI:

1. Prefer existing tokens in `src/styles.css` over hard-coded hex values.
2. Prefer the shared `Button` and `Card` primitives over duplicating button/panel classes.
3. If a new surface type is needed, add a token first.
4. If something looks wrong in dark mode, check for hard-coded `bg-white`, fixed shadows, or forced `theme="light"` props.

## Current Limitation

The styling system is still intentionally small. It is not yet a full design system with all shadcn primitives. The current setup covers the pieces actually used by the homepage, blog list, blog post page, and theme toggle.
