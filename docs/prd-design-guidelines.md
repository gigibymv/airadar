# AI Radar — PRD: Design Guidelines

## 1. Design Philosophy

**Tone:** Editorial, minimal, intelligence-grade. Think Bloomberg Terminal meets a curated newsletter.

**Principles:**
- **Clarity over decoration** — every pixel serves information delivery
- **Typographic hierarchy** — headlines, labels, and body text are clearly differentiated by weight and size
- **Sharp geometry** — 0px border radius throughout; no rounded corners
- **Restrained palette** — warm neutrals with a single blue accent for interactive elements

## 2. Typography

| Role | Font | Weight | Size |
|------|------|--------|------|
| Display / headings | Inter Tight | 700–900 | 22–36px |
| Section headers (italic) | Inter Tight Italic | 400 | 22–26px |
| Body text | Inter Tight | 400 | 13px |
| Labels / metadata | Inter Tight | 400–500 | 10–11px |
| Buttons / nav | Inter Tight | 600 | 13px |

**Rules:**
- Section dividers use italic lowercase headers (e.g., *"by people"*, *"latest"*) with a horizontal rule extending to the right.
- No ALL CAPS except for very short labels (2-3 words max).

## 3. Color System

All colors are HSL, defined in `index.css` as CSS custom properties.

| Token | HSL | Usage |
|-------|-----|-------|
| `--background` | 40 8% 92% | Page background — warm off-white |
| `--foreground` | 0 0% 12% | Primary text — near black |
| `--primary` | 225 85% 50% | Interactive accent — blue |
| `--muted-foreground` | 0 0% 45% | Secondary text, timestamps, metadata |
| `--card` | 40 20% 97% | Card surfaces |
| `--takeaway` | 8 80% 52% | Highlight color for key takeaways |
| `--border` | 40 8% 85% | Subtle borders |

**Rules:**
- Never use raw Tailwind colors (`text-gray-500`, `bg-blue-600`). Always reference semantic tokens.
- Borders use `border-foreground/10` or `border-foreground/15` for subtle separators.
- Hover states: `text-muted-foreground → text-foreground` transition.

## 4. Layout

- **Desktop:** Fixed 220px sidebar + fluid main content area (max-width 6xl / ~1152px).
- **Mobile:** Full-width, sidebar hidden, hamburger menu for navigation.
- **Spacing:** `px-4 sm:px-8` horizontal padding. `py-6 md:py-8` vertical padding.
- **Cards:** Minimal — no heavy shadows, no rounded corners. Use subtle borders or background shifts.

## 5. Component Patterns

### Section Headers
```
[italic title] ——————————————— [optional action]
```
Italic Inter Tight at 22–26px, followed by a `flex-1 h-px bg-foreground/20` divider.

### Navigation
- Desktop sidebar: left-aligned, active state = `border-l-2 border-foreground` + semibold.
- Inline tabs: underline style, active = `border-b-2 border-primary` + primary color.

### Cards / List Items
- Compact rows with hover highlight.
- Bookmark toggle icon on each item.
- Source badges and metadata in muted small text.

### Buttons
- Primary: border + text, hover inverts (bg-foreground text-background).
- Refresh / action: small, outlined, with icon.
- Disabled: `opacity-30 cursor-not-allowed`.

## 6. Motion & Interaction

- Use `transition-colors` and `transition-all` for hover states.
- `animate-fade-in` for mobile menu and search bar reveal.
- No heavy animations or page transitions — speed and scannability are paramount.

## 7. Responsive Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| < 640px (sm) | Single column, hamburger nav, collapsible search |
| 640–1023px | Wider content area, inline search visible |
| ≥ 1024px (lg) | Sidebar visible, full layout |

## 8. Iconography

- Lucide React icons throughout.
- Icon size: `h-4 w-4` standard, `h-3.5 w-3.5` for compact/secondary contexts.
- Icons are decorative accompaniments to text, never standalone without a label (except bookmark toggle).
