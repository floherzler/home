# BlockNote Basics And Common Pitfalls

## Scope

This note documents how BlockNote is currently used in this repo, what the basic moving parts are, and why the recent runtime errors appear in different forms while sharing the same root cause.

Relevant local versions:

- `@blocknote/core`: `^0.23.0`
- `@blocknote/react`: `^0.23.0`

Current editor integration:

- [src/components/blog-editor.tsx](/home/flo178/projects/home/src/components/blog-editor.tsx)

## BlockNote Basics

At a high level, BlockNote has three layers:

1. Editor core
   - Created with `useCreateBlockNote(...)`
   - Holds document state, plugins, upload hooks, formatting state, suggestion menus, table handles, etc.

2. View wrapper
   - Rendered here via `BlockNoteViewRaw`
   - Mounts the editor into the DOM
   - Optionally renders the default UI controllers such as:
     - formatting toolbar
     - link toolbar
     - slash menu
     - emoji picker
     - side menu
     - file panel
     - table handles

3. UI component layer
   - The default UI components do not render from nowhere
   - They read a React context called `ComponentsContext`
   - That context is supposed to provide the concrete React components for toolbar roots, buttons, menus, popovers, side menu buttons, table handles, etc.

## The Root Cause In This Repo

The current runtime failures are not independent bugs. They are multiple symptoms of one structural problem:

- `BlockNoteViewRaw` renders BlockNote default UI controllers
- those controllers render default UI components
- those default UI components call `useComponentsContext()`
- in the installed package set, there is no `ComponentsContext.Provider` being mounted around them
- so the context value is `undefined`
- the minified runtime then crashes with errors like:
  - `can't access property "FormattingToolbar", t is undefined`
  - `can't access property "SideMenu", t is undefined`
  - `can't access property "blockDragStart", t.sideMenu is undefined`

## Local Evidence

### 1. `BlockNoteViewRaw` mounts default UI

In the installed source:

- `node_modules/@blocknote/react/src/editor/BlockNoteView.tsx`

`BlockNoteViewRaw` renders:

- `BlockNoteDefaultUI`

and passes props like:

- `formattingToolbar`
- `linkToolbar`
- `slashMenu`
- `emojiPicker`
- `sideMenu`
- `filePanel`
- `tableHandles`

So enabling these props really does activate BlockNote's default UI layer.

### 2. Default UI controllers assume plugin objects exist

Examples:

- `FormattingToolbarController` reads `editor.formattingToolbar`
- `SideMenuController` reads `editor.sideMenu`
- `TableHandlesController` reads `editor.tableHandles`

This means plugin availability and UI rendering must stay in sync.

If a plugin is disabled but its UI is still rendered, a crash is expected.

That explains the specific error:

- `can't access property "blockDragStart", t.sideMenu is undefined`

This happens when a controller tries to use `editor.sideMenu.blockDragStart` even though the `sideMenu` plugin was disabled.

### 3. Default UI components assume `ComponentsContext` exists

Examples in the installed source:

- `node_modules/@blocknote/react/src/components/FormattingToolbar/FormattingToolbar.tsx`
- `node_modules/@blocknote/react/src/components/SideMenu/SideMenu.tsx`
- `node_modules/@blocknote/react/src/components/FilePanel/FilePanel.tsx`
- `node_modules/@blocknote/react/src/components/LinkToolbar/LinkToolbar.tsx`
- `node_modules/@blocknote/react/src/components/TableHandles/TableHandle.tsx`

These all do some variant of:

```tsx
const Components = useComponentsContext()!;
```

and then immediately dereference:

- `Components.FormattingToolbar.Root`
- `Components.SideMenu.Root`
- `Components.Generic.Menu.Root`
- `Components.TableHandle.Root`

If `Components` is `undefined`, the exact property name in the crash depends on which UI component renders first.

That is why the error message changes while the root cause stays the same.

### 4. `ComponentsContext` exists, but no provider is mounted in the installed packages

In:

- `node_modules/@blocknote/react/src/editor/ComponentsContext.tsx`

the package defines:

- `ComponentsContext`
- `useComponentsContext()`

But searching the installed `@blocknote/*` packages in this repo shows no mounted:

- `ComponentsContext.Provider`

So the context consumer exists, but the provider is absent from the installed local package graph.

That is the key structural mismatch.

## Why The Errors Change

The changing errors are expected once the UI layer is partially enabled or partially disabled.

### Case 1: Formatting toolbar enabled

If `formattingToolbar` is rendered, the code reaches:

- `FormattingToolbarController`
- then `FormattingToolbar`
- then `Components.FormattingToolbar.Root`

If `ComponentsContext` is missing, the crash becomes:

- `can't access property "FormattingToolbar", t is undefined`

### Case 2: Side menu enabled

If `sideMenu` is rendered, the code reaches:

- `SideMenuController`
- then `SideMenu`
- then `Components.SideMenu.Root`

If `ComponentsContext` is missing, the crash becomes:

- `can't access property "SideMenu", t is undefined`

### Case 3: Side menu plugin disabled but side menu UI still rendered

If:

- the plugin is disabled via `disableExtensions: ["sideMenu"]`
- but the view still renders `sideMenu`

then the controller fails earlier, before even reaching the missing components context:

- `editor.sideMenu` is `undefined`
- accessing `editor.sideMenu.blockDragStart` crashes

That explains:

- `can't access property "blockDragStart", t.sideMenu is undefined`

## The Actual Problem Statement

The problem is not:

- "the formatting toolbar is broken"
- "the side menu is broken"
- "the drag handle is broken"

The real problem is:

- the repo currently uses `BlockNoteViewRaw` plus BlockNote default UI props
- but the installed local BlockNote package set does not provide the required `ComponentsContext.Provider`
- therefore the default UI stack is not safe to use as-is

## Common Pitfalls In This Setup

### 1. Assuming `BlockNoteViewRaw` is a fully self-contained editor UI

In this local package setup, it is not.

It mounts the editor and it tries to mount default UI controllers, but the default UI components depend on a components provider that is not present in the installed packages.

### 2. Disabling a plugin but forgetting to disable its UI prop

Example:

- `disableExtensions: ["sideMenu"]`
- but `sideMenu` prop remains enabled in `BlockNoteViewRaw`

Result:

- controller accesses `editor.sideMenu`
- runtime crash

### 3. Fixing one UI symptom and assuming the root issue is resolved

Example:

- turning off `sideMenu`
- then clicking selection and seeing `FormattingToolbar` crash

This does not mean a new unrelated bug appeared.
It means the next default UI component reached the same missing context problem.

### 4. Relying on unit tests for editor runtime safety

Current test coverage in this repo checks utility logic, not browser editor interaction.

So these runtime failures can exist while:

- `npm run test` is green
- `npm run build` is green

Build success only proves that the code bundles, not that the BlockNote UI context graph is valid at runtime.

## What Is Safe Right Now

Safe in the current repo:

- using the BlockNote editor core
- reading and writing `contentJson`
- generating `contentHtml`
- using `uploadFile`

Not safe in the current repo without additional integration work:

- BlockNote default formatting toolbar
- BlockNote default side menu
- BlockNote default file panel UI
- BlockNote default table handles UI
- any other BlockNote default UI component that dereferences `ComponentsContext`

## What This Means For Implementation

There are only two robust paths.

### Option A: Treat BlockNote as editor core only

Keep:

- `useCreateBlockNote`
- document serialization
- upload hooks

Do not use BlockNote's default UI components.

Instead:

- render a plain editor surface
- build custom app-local controls for formatting, uploads, and block insertion

This is the safest path for the current dependency set.

### Option B: Add the missing BlockNote UI integration layer

Only do this if we confirm the intended provider package and integration model for this BlockNote version.

That would require:

- identifying the expected package that mounts `ComponentsContext.Provider`
- or upgrading to a package/version combination where the provider is included and documented
- or explicitly mounting a compatible provider ourselves

Until that is done, enabling default BlockNote UI piecemeal will keep producing different variants of the same runtime failure.

## Bottom Line

The many different runtime errors all come from one root issue:

- BlockNote default UI components are being rendered
- those components expect `ComponentsContext`
- in this local setup that context provider is missing

The symptom changes depending on which default BlockNote UI component gets hit first.

So yes: the root cause is the same each time.
