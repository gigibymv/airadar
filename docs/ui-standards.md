# AI Radar UI Standards

## Purpose

- This document defines AI Radar's UI standards for layout, typography, spacing, token usage, responsive behavior, and verification.
- Its goal is to prevent visual drift, inconsistent tab behavior, token bypass, and patch-chain UI fixes.
- For UI changes, this file is the visual source of truth for AI Radar.

## How to Use

- Read with:
  - `onboard/AGENTS.md`
  - `onboard/memory.md`
  - `onboard/IMPLEMENTATION_RULES.md`
  - `docs/source-of-truth.md`
- If this file conflicts with product truth docs, product truth docs win.
- If a rule is ambiguous, call out ambiguity instead of inventing a one-off pattern.

## Non-Negotiable Principles

### 1. Product surfaces remain distinct

- Daily Brief, Latest News, Community, Use Cases, and Saved are separate product surfaces.
- Do not style or compose them into one generic dashboard.
- Settings remains placeholder-only unless explicitly scoped.

### 2. Editorial over decorative

- Prioritize reading hierarchy, scanning speed, and clarity.
- Avoid decorative dashboard patterns, heavy shadows, and novelty effects.

### 3. Sharp geometry is default

- Default radius is sharp/minimal.
- New rounded corners require explicit rationale.
- Existing external-library UI overlays (toast/tooltip) are exceptions until standardized.

### 4. Tokens are authoritative

- Use semantic tokens from `src/index.css` (`background`, `foreground`, `border`, `input`, `muted-*`, `primary`, etc.).
- Do not introduce raw Tailwind color classes for product UI.
- Opacity variants on semantic colors are allowed only when they preserve hierarchy and no semantic token fits.

### 5. Layout is a system

- Width, spacing, alignment, and typography changes are system changes, not local tweaks.
- Do not solve one collision by pushing nearby elements with arbitrary spacing hacks.

### 6. Desktop and mobile are both first-class

- Every meaningful UI change must be checked on desktop and mobile.
- Mobile must be intentionally adapted, not compressed desktop.

## Typography Rules

- Preserve editorial hierarchy:
  - Display titles: strongest weight and largest scale.
  - Section headers: italic editorial style where already used.
  - Body copy: readable, stable line-height.
  - Metadata: muted and subordinate.
- Use consistent text roles across tabs.
- Avoid ad hoc per-component size drift.

## Spacing and Alignment Rules

- Repeated patterns use repeated spacing.
- Similar sections share left-edge alignment.
- Card internals should follow consistent vertical rhythm.
- Do not introduce negative margins to "fix" local layout.

## Component and Pattern Rules

### Navigation

- Tab metadata should come from a single source of truth.
- Sidebar, mobile menu, and top tab strip must remain behaviorally consistent.
- If Settings is shown, it should be consistently represented as placeholder/disabled.

### Cards and Lists

- Keep card/list spacing compact and readable.
- Bookmark and action affordances should remain stable across item types.
- Loading, empty, and error states must use coherent structure and tone.

### Forms and Search

- Inputs use semantic input/border tokens.
- Keep focus/hover transitions consistent.
- Do not distribute access/auth logic into presentational components.

## Responsive Rules

- Validate at minimum:
  - mobile `<640`
  - desktop `>=1024`
- Use this adaptation order under constraint:
  1. reflow
  2. stack
  3. simplify grouping
  4. reduce density
  5. reduce size only if hierarchy stays intact

## Accessibility and Interaction Rules

- Interactive elements remain clearly visible and reachable.
- Icon-only actions must keep explicit `aria-label`.
- Disabled states must be visually clear.
- Hover affordances cannot be the only signal on mobile.

## Verification Checklist

### Layout integrity

- Any overlap, clipping, or hidden text?
- Any broken containment when content grows?
- Any drift in section or card alignment?

### Typography and hierarchy

- Do text roles remain consistent across similar screens?
- Any metadata competing with primary content?
- Any local font-size nudges that break rhythm?

### Responsive behavior

- Desktop passes?
- Mobile passes?
- One breakpoint fixed while another regressed?

### Product consistency

- Tab identity preserved?
- Settings still placeholder-only?
- Saved states coherent (loading/empty/error)?

### Token discipline

- New color/border/spacing values use semantic tokens?
- Any one-off styles added without documented reason?

## Forbidden Behaviors

- Do not collapse tab-specific UI into a single generic feed treatment.
- Do not introduce a parallel local style system beside semantic tokens.
- Do not patch layout via arbitrary nudges when structural composition is the issue.
- Do not ship UI changes verified on only one breakpoint.
