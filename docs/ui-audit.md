# AI Radar UI Audit

Audited against:
- `docs/ui-standards.md`
- `onboard/AGENTS.md`
- `onboard/memory.md`
- `onboard/IMPLEMENTATION_RULES.md`
- `docs/source-of-truth.md`

Scope:
- Active UI surfaces in `src/components`, `src/features`, and `src/pages`
- Excludes deleted/orphaned template files already removed

Last updated: 2026-03-18

---

## Systemic Issues

### U1. Daily Brief UI is still monolithic and mixed-concern

- **Component:** `src/components/ExecutiveSummary.tsx` (~399 lines)
- **Issue:** Presentation, formatting/parsing, tab logic, and bookmark wiring are tightly coupled.
- **Violates:** UI standards (layout/system discipline), maintainability expectations.
- **Severity:** HIGH
- **Fix direction:** Split into feature-owned subcomponents (`BriefingSection`, `TldrSection`, shared card/actions), keep behavior unchanged.

### U2. Remaining non-semantic foreground-opacity styling is concentrated in Daily Brief

- **Components:** `src/components/ExecutiveSummary.tsx`, minor scattered instances in cards/shell.
- **Issue:** Still relies on `border-foreground/*`, `bg-foreground/20`, `text-foreground/*` in places where semantic tokens can represent intent.
- **Violates:** Token authority rule.
- **Severity:** MEDIUM
- **Fix direction:** Complete token migration during ExecutiveSummary decomposition to avoid churn.

### U3. Sharp-corner standard has residual drift

- **Components:** `src/components/ExecutiveSummary.tsx` (`rounded-lg`), `src/features/tabs/LatestNewsTab.tsx` (load-more button), plus library overlays (`ui/toast.tsx`, `ui/tooltip.tsx`).
- **Issue:** Product style is mostly sharp, but rounded elements remain inconsistently.
- **Violates:** Sharp-geometry default.
- **Severity:** MEDIUM
- **Fix direction:** Define explicit exceptions for overlay primitives; remove non-essential rounding in product surfaces.

### U4. Navigation metadata is still duplicated

- **Components:** `src/features/shell/navigation.ts`, `src/components/AppSidebar.tsx`
- **Issue:** Sidebar defines its own nav list while shell uses `appTabs`. This creates drift risk.
- **Violates:** Single-source navigation rule.
- **Severity:** MEDIUM
- **Fix direction:** Derive sidebar/menu/tab-strip from one shared config that includes placeholder metadata.

### U5. Settings placeholder is not represented consistently across nav surfaces

- **Components:** `AppSidebar.tsx` vs shell/mobile tab surfaces driven by `appTabs`.
- **Issue:** Settings appears disabled in desktop sidebar but not in mobile/top tab patterns.
- **Violates:** Product consistency for placeholder behavior.
- **Severity:** MEDIUM
- **Fix direction:** Standardize whether Settings placeholder is shown on all nav surfaces or only desktop by explicit rule.

### U6. Toast strategy is ambiguous (two systems mounted)

- **Component:** `src/App.tsx`
- **Issue:** Both `Toaster` and `Sonner` are mounted.
- **Violates:** Simplicity/consistency goals (not a direct visual defect yet).
- **Severity:** LOW-MEDIUM
- **Fix direction:** Choose one toast system or define clear role boundaries.

### U7. UI regression coverage is minimal

- **Files:** `src/test/example.test.ts` (placeholder only)
- **Issue:** No test coverage for core UI invariants (access flow entry, tab integrity, saved states).
- **Violates:** Verification discipline.
- **Severity:** HIGH
- **Fix direction:** Add targeted tests for invariant UI states and navigation integrity.

---

## Recently Remediated

### R1. Semantic token cleanup completed on core active flows

- Shell/tab/auth/search surfaces now primarily use semantic border/input tokens.
- Build verified after cleanup.

### R2. Saved `news` rendering contract hardened

- `SavedTab` now normalizes saved `news` bookmarks into safe `NewsItem` shape before rendering.
- Prevents Daily Brief/TLDR bookmark payload mismatches from degrading Saved UI.

### R3. Dead/stale UI template residue significantly reduced

- Large unreferenced `src/components/ui/*` template set removed; active overlay primitives retained.

---

## Prioritized Execution Order (UI)

1. Decompose `ExecutiveSummary.tsx` while preserving current behavior and tab semantics.
2. Finish token/radius consistency in Daily Brief during decomposition.
3. Unify nav metadata and explicitly standardize Settings placeholder visibility.
4. Resolve dual-toast mounting decision in `App.tsx`.
5. Add minimal UI invariant tests (access entry, tab map, Saved states).

---

## Facts vs Inferences

### Facts

- `ExecutiveSummary.tsx` is still large and mixed-concern.
- Settings placeholder visibility differs across nav surfaces.
- Both toast systems are mounted in `App.tsx`.
- Semantic token migration is incomplete in Daily Brief.
- Placeholder test coverage remains minimal.

### Inferences

- Decomposing Daily Brief first will reduce risk of future UI regressions and speed up token consistency work.
- Keeping duplicate nav definitions will eventually cause drift when tab metadata changes.
