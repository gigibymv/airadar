# AI Radar — Codex Progress Log

Last updated: 2026-03-19 (America/New_York)

## Purpose

Persistent handoff file for cross-session continuity.
Update this file after each completed prompt/run.

## Current Phase

Prompt-pack execution in progress.

Post-pack Phase 1 cleanup in progress (from Prompt 18 execution order).

Completed prompts:

- 1. Full repo audit
- 2. Access model audit
- 7. Refactor access layer
- 8. Refactor app shell and navigation
- 9. Split Daily Brief and Latest News properly
- 3. Navigation and tab integrity audit
- 4. Data flow and domain model audit
- 5. Generated-code smell audit
- 6. Minimal safe refactor plan
- 10. Harden Use Cases surface
- 11. Harden Saved feature
- 12. Add explicit taxonomy for people vs companies
- 13. Normalize data contracts
- 14. UI consistency pass
- 15. Semantic token cleanup
- 16. Remove dead code and stale abstractions
- 17. Prepare a rewrite map
- 18. Create a first-pass execution order

Pending prompts (requested to complete step-by-step):

- then continue with 10+

## What Was Changed

### Access refactor (Prompt 7)

- Extracted app entry access composition:
  - `src/features/access/AppAccessBoundary.tsx` (new)
  - `src/features/access/ProtectedAppRoute.tsx` (new)
- Simplified app composition:
  - `src/App.tsx` updated to use new access modules

Behavior preserved:

- Password Gate still runs before app entry
- Supabase Auth still guards `/`

### Shell/navigation refactor (Prompt 8)

- Added shell navigation model:
  - `src/features/shell/navigation.ts` (new)
- Added shell layout component:
  - `src/features/shell/AppShellLayout.tsx` (new)
- Extracted tab surfaces:
  - `src/features/tabs/DailyBriefTab.tsx` (new)
  - `src/features/tabs/LatestNewsTab.tsx` (new)
  - `src/features/tabs/UseCasesTab.tsx` (new)
  - `src/features/tabs/CommunityTab.tsx` (new)
  - `src/features/tabs/SavedTab.tsx` (new)
- Updated:
  - `src/pages/Index.tsx` (now orchestration layer)
  - `src/components/AppSidebar.tsx` (shared `Tab` type)

### Daily Brief vs Latest News distinction (Prompt 9)

- Explicit shell-level distinction:
  - Top search UI now appears only on `Latest News`
  - Daily Brief no longer inherits generic feed search affordance
- Updated:
  - `src/features/shell/AppShellLayout.tsx`
  - `src/pages/Index.tsx`

### Use Cases hardening (Prompt 10)

- Removed fake fallback behavior for curated use cases:
  - `src/hooks/useUseCases.ts` now returns `[]` when DB has no use cases (no mock fallback)
- Hardened Use Cases tab semantics:
  - `src/features/tabs/UseCasesTab.tsx`
  - clearer practical framing copy
  - explicit "by people" and "by companies" sections always rendered
  - section-level empty states added
  - catalog-level empty state added when no curated items exist
  - search results labeling shifted to practical use-case framing

### Saved hardening (Prompt 11)

- Clarified persistence assumptions in code behavior:
  - `src/hooks/useBookmarks.ts` remains Supabase-backed, user-scoped persistence
- Added explicit loading/error state handling for Saved flow:
  - `src/hooks/useBookmarks.ts` now exposes `loading` and `error`
  - `src/features/tabs/SavedTab.tsx` now renders coherent loading, error, and empty states
  - `src/pages/Index.tsx` wires bookmark loading/error into Saved tab

### Taxonomy hardening (Prompt 12)

- Made taxonomy explicit in use-case contracts:
  - `src/data/useCaseData.ts` now exports taxonomy helpers:
    - `normalizeUseCaseType`
    - `isPersonUseCase`
    - `isCompanyUseCase`
- Applied explicit normalization at data boundaries:
  - `src/hooks/useUseCases.ts` normalizes DB `type`
  - `src/pages/Index.tsx` normalizes search results `type`
- Updated search response contract for taxonomy:
  - `supabase/functions/search-use-cases/index.ts`
  - prompt now requires `type`
  - normalized response now always includes `type`
- Improved taxonomy visibility in UI:
  - `src/features/tabs/UseCasesTab.tsx`
  - search results now grouped by `by people` / `by companies`
  - per-group empty states added for searched results

### Data contract normalization (Prompt 13)

- Introduced explicit mapper pipeline modules:
  - `src/domain/content/time.ts`
  - `src/domain/content/news.ts`
  - `src/domain/content/usecases.ts`
  - `src/domain/content/briefing.ts`
- Moved transformation logic out of hooks/pages:
  - `src/hooks/useNewsData.ts` now uses raw -> normalized -> view-model mappers
  - `src/hooks/useUseCases.ts` now uses raw -> normalized -> view-model mappers
  - `src/hooks/useExecutiveBriefing.ts` now uses normalized briefing mapper
  - `src/pages/Index.tsx` now maps search results through use-case contract mappers
- Result:
  - transformation logic is centralized
  - hook/page code is thinner
  - contracts are more explicit and reusable

### UI consistency pass (Prompt 14)

- Tightened component consistency with editorial style (no redesign):
  - `src/components/NewsCard.tsx`: aligned row footer structure with other cards
  - `src/components/UseCaseCard.tsx`: improved footer alignment consistency across breakpoints
  - `src/components/CommunityCard.tsx`: improved footer alignment consistency across breakpoints
  - `src/components/RefreshButton.tsx`: forced sharp-corner button (`rounded-none`)
  - `src/features/tabs/SavedTab.tsx`: unified loading/error/empty states with section-border treatment
- Outcome:
  - card/list footer behavior is more consistent
  - state blocks (loading/error/empty) have consistent visual framing
  - sharp-corner design language is reinforced

### Semantic token cleanup (Prompt 15)

- Reduced one-off border/separator values across active product surfaces by mapping to semantic tokens:
  - `border-input` for input fields
  - `border-border` for container/button/list borders
  - `bg-border` for separator lines
- Updated:
  - `src/features/tabs/LatestNewsTab.tsx`
  - `src/features/tabs/UseCasesTab.tsx`
  - `src/features/tabs/CommunityTab.tsx`
  - `src/features/tabs/SavedTab.tsx`
  - `src/components/RefreshButton.tsx`
  - `src/components/CommunitySearch.tsx`
  - `src/components/UseCaseSearch.tsx`
  - `src/components/PasswordGate.tsx`
  - `src/pages/Auth.tsx`
- Outcome:
  - active flows now rely more consistently on semantic token classes instead of foreground-opacity border values
  - visual appearance is preserved with lower style-fragmentation risk

### Dead code and stale abstraction removal (Prompt 16)

- Removed unreferenced stale files:
  - `src/App.css`
  - `src/components/NavLink.tsx`
  - `src/components/TldrFeed.tsx`
  - `src/hooks/use-mobile.tsx`
- Removed unused shadcn template component set from `src/components/ui/`:
  - kept only actively referenced UI modules (`toast.tsx`, `toaster.tsx`, `tooltip.tsx`, `sonner.tsx`)
  - deleted unused wrappers/components (buttons, form controls, layout primitives, sidebar wrapper, etc.)
- Outcome:
  - significantly reduced generated-code/template residue
  - lower maintenance surface and less dead abstraction overhead

### Rewrite map (Prompt 17)

- Produced a maintainability and product-fidelity classification map across key source/app/infra files:
  - keep as-is
  - lightly refactor
  - deeply refactor
  - rewrite from scratch
  - delete
- Highest-risk rewrite candidate remains the oversized Daily Brief implementation:
  - `src/components/ExecutiveSummary.tsx`
- Key "delete" candidate identified for next cleanup pass:
  - `src/data/executiveSummaryData.ts` (legacy static dataset, no active imports)

### First-pass execution order (Prompt 18)

- Proposed safest execution sequence:
  1. tighten low-risk contract boundaries and remove remaining stale static data
  2. split high-risk presentation monolith (`ExecutiveSummary`) behind behavior-preserving wrapper
  3. harden bookmark contracts and optimistic mutation rollback behavior
  4. standardize shell/nav source-of-truth and remove duplicated tab declarations
  5. refactor ingestion/search edge functions with explicit validators and smaller modules
  6. replace placeholder tests with product-invariant coverage (access flow, tab integrity, bookmark scoping)
- Key deferrals:
  - do not alter access model order
  - do not re-interpret Daily Brief vs Latest News semantics
  - do not redesign Settings beyond placeholder
- Highest early-danger refactors identified:
  - rewriting `Index.tsx` and `ExecutiveSummary.tsx` together in one pass
  - changing ingest + frontend contracts simultaneously
  - replacing bookmark persistence shape before typed migration plan

### Phase 1 cleanup run (current)

- Separated contracts from stale mock payloads in core data contract files:
  - `src/data/newsData.ts` now contains only contracts/helper (`NewsCategory`, `NewsItem`, `CommunityPost`, `getCategoryColor`)
  - `src/data/useCaseData.ts` now contains only contracts/taxonomy helpers (`UseCaseType`, `UseCasePost`, normalization helpers)
- Removed legacy unreferenced static briefing dataset:
  - deleted `src/data/executiveSummaryData.ts`
- Verification:
  - no remaining references to removed mock exports or deleted briefing data file
  - `npm run build` passes

### Bookmark hardening run (current)

- Hardened bookmark identity and mutation safety in:
  - `src/hooks/useBookmarks.ts`
- Changes:
  - added typed row normalization guard (`toBookmark`) for loaded bookmark records
  - replaced ambiguous toggle matching (`id` only) with identity matching (`id + category`)
  - made delete operations category-aware to avoid cross-category deletion collisions
  - added rollback-safe optimistic updates for both add and remove paths
  - expanded `isBookmarked` to support optional category-aware checks while preserving existing call compatibility
- Verification:
  - `npm run build` passes

### Saved-news normalization run (current)

- Hardened Saved-tab rendering contract for `news` bookmarks in:
  - `src/features/tabs/SavedTab.tsx`
- Changes:
  - added `toSavedNewsItem` normalizer that converts any saved `news` bookmark payload into a safe `NewsItem` view model
  - supports Daily Brief / TLDR bookmark payloads with graceful fallbacks for `summary`, `timeAgo`, `takeaways`, and `category`
  - Saved tab now always passes normalized data into `StoryRow` instead of raw `bookmark.data`
- Verification:
  - `npm run build` passes

### UI governance docs added (current)

- Added AI Radar-specific UI standards and audit docs inspired by external references, without modifying source inspiration files:
  - `docs/ui-standards.md`
  - `docs/ui-audit.md`
- Purpose:
  - establish local UI source-of-truth rules for future refactors
  - keep a severity-ranked live audit to drive UI cleanup order

### Executive Summary decomposition run (current)

- Decomposed Daily Brief implementation into feature-owned components while preserving behavior:
  - added `src/features/briefing/BriefingCard.tsx`
  - added `src/features/briefing/ExecutiveBriefingSection.tsx`
  - added `src/features/briefing/TldrSection.tsx`
  - simplified `src/components/ExecutiveSummary.tsx` to orchestration/sub-tab shell
- Outcome:
  - reduced monolithic surface area and mixed concerns in `ExecutiveSummary`
  - kept existing Daily Brief / TLDR behavior and bookmark interactions
- Verification:
  - `npm run build` passes

### Briefing token/radius consistency pass (current)

- Updated extracted briefing components for semantic token consistency and sharp-corner alignment:
  - `src/features/briefing/BriefingCard.tsx`
    - `border-foreground/20` -> `border-border`
    - `border-foreground/10` -> `border-border`
  - `src/features/briefing/ExecutiveBriefingSection.tsx`
    - section divider lines `bg-foreground/20` -> `bg-border`
    - africa no-update card `border-foreground/10 rounded-lg` -> `border-border rounded-none`
  - `src/features/briefing/TldrSection.tsx`
    - card border `border-foreground/20` -> `border-border`
    - divider line `bg-foreground/20` -> `bg-border`
    - category chips `rounded-lg` -> `rounded-none`
- Scope:
  - styling only; no behavior or data-flow changes
- Verification:
  - `npm run build` passes

### Navigation source-of-truth unification (current)

- Centralized navigation metadata in:
  - `src/features/shell/navigation.ts`
    - added `appNavItems` with shared label/order/icon/enabled metadata
    - kept `appTabs` as enabled tab-derived view for active tab strips
- Refactored consumers to use shared nav model:
  - `src/components/AppSidebar.tsx`
    - removed local duplicated `navItems`
    - now renders from `appNavItems`
  - `src/features/shell/AppShellLayout.tsx`
    - mobile menu now renders from `appNavItems`
    - preserves Settings as disabled placeholder entry
- Outcome:
  - removed nav duplication drift between desktop sidebar and mobile menu
  - made placeholder/disabled nav behavior explicit in one place
- Verification:
  - `npm run build` passes

### Toast consolidation + first invariant tests (current)

- Consolidated to a single toast system (`sonner`):
  - removed Radix toast mount from `src/App.tsx` (`Toaster`)
  - kept Sonner mount (`<Sonner />`)
  - removed unused Radix-toast local pipeline files:
    - `src/components/ui/toaster.tsx`
    - `src/components/ui/toast.tsx`
    - `src/hooks/use-toast.ts`
- Added first invariant tests:
  - `src/features/shell/navigation.test.ts`
    - validates enabled tab order
    - validates Settings remains disabled placeholder
  - `src/features/access/ProtectedAppRoute.test.tsx`
    - validates loading state behavior
    - validates unauthenticated redirect to `/auth`
    - validates authenticated content access
- Verification:
  - `npm run test` passes (all tests green)
  - `npm run build` passes

### Use Cases phase-1 correctness pass (current)

- Addressed immediate correctness and diagnosability issues for Use Cases:
  - strengthened taxonomy normalization in `src/data/useCaseData.ts`
    - now recognizes `company|organization|org|enterprise|business|team` case-insensitively
  - hardened use-case type handling in edge functions:
    - `supabase/functions/search-use-cases/index.ts`
    - `supabase/functions/fetch-daily-news/index.ts`
    - both now use explicit normalization helper (instead of raw `=== "company"` checks)
  - improved search failure visibility in UI:
    - `src/pages/Index.tsx` now tracks `useCaseSearchError`
    - `src/features/tabs/UseCasesTab.tsx` now renders explicit error message when search fails
  - added conservative DB backfill migration for obvious company rows:
    - `supabase/migrations/20260318011000_8b6f2fd1-8f34-4ff2-9a45-5e67f6f2b5a1.sql`
- Verification:
  - `npm run test` passes
  - `npm run build` passes

### Use Cases phase-2 schema + UI pass (current)

- Added schema support for explicit category taxonomy and daily highlight metadata:
  - `supabase/migrations/20260318162000_b70b5ac1-a1b4-4c20-acd7-a080cf12c7bf.sql`
    - adds `use_case_category` enum
    - adds `use_cases.category`
    - adds `use_cases.is_highlighted`, `use_cases.highlighted_date`, `use_cases.highlighted_rank`
    - adds indexes for tab/category and highlight lookup
- Updated generated-style Supabase TS contracts:
  - `src/integrations/supabase/types.ts`
    - `use_cases` row/insert/update now include category + highlight fields
    - adds enum/constants for `use_case_category`
- Removed unsafe casts in use-case mapper now that schema types are explicit:
  - `src/domain/content/usecases.ts`
- Added shared category constants for UI + mapping:
  - `src/data/useCaseData.ts`
    - `USE_CASE_CATEGORIES`
    - `USE_CASE_CATEGORY_LABELS`
- Refactored Use Cases tab UX to match requested behavior:
  - `src/features/tabs/UseCasesTab.tsx`
    - explicit inner tabs: `by people` / `by companies`
    - explicit category filter chips (healthcare, productivity, etc.)
    - default surface now limited to `5 highlighted use cases of the day` (with latest fallback)
    - external search results remain supported and are filtered by active type/category
- Improved card metadata visibility:
  - `src/components/UseCaseCard.tsx`
    - shows category label
    - shows highlight rank when available
- Important product clarification applied:
  - Use Cases search remains external (edge function / online generation), not DB-only search.
- Verification:
  - `npm run test` passes
  - `npm run build` passes

### API key contract update (current)

- Updated edge function secret lookup to support `GEMINI_API_KEY` as the primary key:
  - `supabase/functions/fetch-daily-news/index.ts`
  - `supabase/functions/search-use-cases/index.ts`
  - `supabase/functions/search-community/index.ts`
- Transition compatibility retained:
  - lookup order is `GEMINI_API_KEY` -> `AI_GATEWAY_API_KEY` -> `LOVABLE_API_KEY`
- Fixed an intermediate regression during key migration:
  - removed duplicate `Authorization` header in `fetch-daily-news`
- Verification:
  - `npm run test` passes
  - `npm run build` passes

### Supabase project alignment cleanup (current)

- Aligned local Supabase project ref to match active `.env` project:
  - `supabase/config.toml` now points to `kkcsjbdeeevzpmxpjwhi`
- Aligned frontend env variable naming with generated client contract:
  - added `VITE_SUPABASE_PUBLISHABLE_KEY` to `.env` (matching anon key)
  - existing `VITE_SUPABASE_KEY` kept for backward compatibility with local scripts
- Verification:
  - `npm run build` passes

### Supabase RLS/privilege fix + live verification (current)

- Resolved `permission denied for table use_cases` REST read failure by adding explicit grants:
  - `supabase/migrations/20260318023000_ef39f9af-4acd-4aa8-9b67-2a2db68ff9bf.sql`
    - grants schema usage to `anon`, `authenticated`, `service_role`
    - grants `SELECT` on `public.use_cases` to `anon`, `authenticated`
    - grants full table access on `public.use_cases` to `service_role`
- Applied migration with:
  - `npx supabase db push --include-all`
- Re-ran remote ingestion:
  - `fetch-daily-news` returned success and wrote new rows
- Verified highlighted rows are now queryable via REST:
  - highlights exist for `2026-03-18` with ranks populated
  - current distribution: 1 `person`, 4 `company` highlights (depends on generated type mix for the run)
- Temporary verifier function used during diagnosis was removed:
  - local file deleted
  - remote function deleted

### Community ingest source expansion (current)

- Expanded ingest source mix in `supabase/functions/fetch-daily-news/index.ts`:
  - added GitHub repository candidate fetch (`fetchGitHubCommunityCandidates`)
  - added optional Brave web candidate fetch (`fetchBraveCandidates`)
  - merged these candidates into the indexed catalog used by AI synthesis
  - updated community generation prompt rule to prioritize GitHub-backed candidates when relevant
  - health-check now reports `GITHUB_API_KEY` and `BRAVE_SEARCH_API_KEY` presence
- New env secrets supported:
  - `GITHUB_API_KEY` (or `GITHUB_TOKEN`)
  - `BRAVE_SEARCH_API_KEY` (or `BRAVE_API_KEY`)
- Verification:
  - `npm run build` passes

### Branding icon update (current)

- Added project mark image for favicon and top-left app branding:
  - copied `ui/favicon_news.png` to `public/ai-mark.png`
  - set favicon in `index.html` to `/ai-mark.png`
  - added mark in desktop sidebar header (`src/components/AppSidebar.tsx`)
  - added mark in mobile top bar (`src/features/shell/AppShellLayout.tsx`)
- Verification:
  - `npm run build` passes

### Settings tab unlocked (current)

- Enabled `Settings` as a first-class app tab in navigation:
  - `src/features/shell/navigation.ts`
- Added live Settings surface:
  - `src/features/tabs/SettingsTab.tsx` (new)
  - shows account nickname/email and sign-out action
- Wired Settings rendering into app shell routing:
  - `src/pages/Index.tsx`
- Updated nav invariant tests:
  - `src/features/shell/navigation.test.ts`
- Verification:
  - `npm run test` passes
  - `npm run build` passes

## Key Findings So Far

1. Two-layer access model is implemented as documented:
   - Password Gate first, then Supabase Auth.
2. `Index.tsx` centralization was a structural risk; now reduced by tab/shell extraction.
3. Daily Brief and Latest News are data-distinct, and UX distinction was reinforced in Prompt 9.
4. Navigation integrity mostly holds; one mismatch remains:
   - Settings placeholder is visible on desktop sidebar, but not shown in mobile/top tab nav.
5. Repository still has generated/scaffold residue and weak contracts (`any`) in several data hooks/components.
6. Use Cases surface now avoids mock-data masking and is explicit when curated data is missing.
7. Saved flow now makes auth and persistence failure states explicit instead of silent no-op behavior.
8. People vs companies taxonomy is now explicit in both curated and searched use-case flows.
9. Data transformations are now centralized in domain mappers instead of being scattered across hooks/pages.
10. Core card/list surfaces are now visually more consistent without product redesign.
11. Active shell/tab/auth/search surfaces now use semantic tokens more consistently after Prompt 15.
12. Unused template-generated UI layer was heavily reduced in Prompt 16, with build still passing.
13. Prompt 17 rewrite map now defines where to keep vs refactor vs rewrite without scope changes.
14. Prompt 18 execution order now defines sequence and deferrals to reduce regression risk.
15. Phase 1 cleanup started: stale static data removed from contract files without behavior changes.
16. Bookmark persistence flow is now safer against failed optimistic mutations and id-collision edge cases.
17. Saved `news` section now renders consistently even when bookmarks originate from non-article Daily Brief payloads.
18. Daily Brief implementation is now split into smaller feature-owned components with behavior preserved.
19. Extracted briefing components now align better with semantic border tokens and sharp-corner style.
20. Navigation/tab metadata now has a single source of truth shared across shell and sidebar surfaces.
21. Toast system is now singular (Sonner-only), reducing UI runtime overlap.
22. Baseline invariant tests now exist for access guard and navigation configuration.
23. Use Cases now has stricter type normalization and explicit search error messaging (no silent fail state).
24. Use Cases now supports explicit category taxonomy and daily highlight metadata end-to-end.
25. Use Cases now has explicit people/company inner tabs and category-filtered highlighted sets.
26. Use Cases search remains external per product direction (not local DB search).
27. Edge functions now support `GEMINI_API_KEY` as primary secret input.

## Verification Status

- Dependencies installed locally (`npm install`).
- Build verification passed (`npm run build`).
- Non-blocking warning: main chunk size > 500kB.

## Product Invariants To Preserve

- App name: AI Radar
- Access model: Password Gate first, then Supabase Auth
- Tabs: Daily Brief, Latest News, Community, Use Cases, Saved
- Settings: enabled (nickname/email + sign-out)
- Taxonomy: explicit people vs companies support
- Ingestion center: `fetch-daily-news`

## Open Risks

- Password gate is client-side with hardcoded value (product gate, not strong security boundary).
- Bookmark contracts remain loosely typed (`data: any`).
- Some legacy components still contain one-off foreground-opacity styling (`ExecutiveSummary`, `TldrFeed`, parts of `NewsCard`) and can be tokenized in a follow-up pass.
- `fetch-daily-news` remains a large ingestion function; further decomposition deferred until contract is stable.
- Remaining work for Use Cases: tune ingestion prompt + ranking quality so people/company classification and category assignment are reliably accurate.
- Dedup threshold (0.65 Dice) may need tuning after observing near-match logs from live runs.

## Next Immediate Task

Monitor near-match logs (`[dedup] near-match`) from the next live refresh run to validate the 0.65 Dice threshold. Adjust in `dedup.ts` (DICE_THRESHOLD constant) if too aggressive or too loose.

## Incremental Update (2026-03-18)

- Saved-tab permission issue was fixed via bookmarks grants migration and verified with successful build.
- Community source selector order was updated to show Reddit before GitHub.
- Community default source now loads as Reddit first.
- Community search label was aligned to `Search Reddit & GitHub`.
- Community GitHub cards now auto-generate a clearer display title when the raw title is repo-only (e.g., `owner/repo`), using a concise "what it does" phrase from description.
- `fetch-daily-news` now normalizes GitHub community entries before DB upsert (repo extraction, repo-only title rewrite, description cleanup), so newly ingested rows are readable without frontend-only fixes.
- Supabase edge function deployment completed for `fetch-daily-news` on project `kkcsjbdeeevzpmxpjwhi`.
- GitHub title/description cleanup now strips inline metadata fragments (`Repo:`, `Language:`, `Stars:`, etc.) to prevent duplicated repo mention in Community cards.
- GitHub community descriptions were expanded from short taglines to fuller explanatory text: cards now show cleaned multi-sentence descriptions, and ingest now stores richer GitHub API descriptions (themes + maintenance/stats context).
- Latest News and Community queries now sort by `published_date desc, created_at desc` and no longer hard-filter to only last 24h records.
- Refresh feedback now includes returned ingest counts (`news`, `community`, `use_cases`) so "feed refreshed" has concrete visibility.
- Feed refresh reliability improved: `fetch-daily-news` Gemini calls now retry on transient API failures (429/5xx + network errors) without the over-strict 30s timeout that caused recent refresh failures.
- Use Cases online search ("Find new") was removed from the UI flow; tab is now daily-curated only (cron-fed highlights by people/companies).
- Community GitHub clarity pass: cards now show an explicit `Good for:` line, and ingest enriches GitHub `how_it_helps` with practical adoption guidance (who should use it and what pain point it solves).
- Fixed repetitive Community "How This Helps You": generic helper text is now detected and replaced with repo/pain-point-specific guidance in both ingest (`fetch-daily-news`) and UI fallback rendering for already-stored rows.
- Community bookmark hydration: `useBookmarks.ts` now re-fetches latest `community_posts` on load so saved community cards always show current "How This Helps You" text, not the stale snapshot from save time.

### Deduplication hardening (2026-03-18)

- Extracted dedup logic into a standalone module: `supabase/functions/fetch-daily-news/dedup.ts`
  - `normalizeTitle()` — lowercase, strip punctuation, remove stopwords (~50 words), normalise AI acronyms
  - `titleBigrams()` — word bigram sets for similarity comparison
  - `diceCoefficient()` — Dice coefficient on bigram sets (replaces asymmetric word-overlap)
  - `isSimilarTitle()` — near-duplicate check with configurable threshold (default 0.65) + near-match logging
  - `deduplicateBatch()` — intra-batch dedup: drops later items that match earlier ones in the same run
- Updated `getExistingKeys()`:
  - Now fetches `community_posts.title` (was url-only)
  - All title sets now stored as `normalizeTitle()` output (was `toLowerCase().trim()`)
- Added cross-table dedup for news: `allKnownTitles = newsTitles ∪ communityTitles ∪ briefingTitles`
  - Same story cannot appear as both a news article and a community post or briefing item
- Applied `deduplicateBatch()` to news and use_cases batches before URL validation
  - Same story from multiple sources (NewsAPI + Brave) in one run now deduplicated within the batch
- Added unit test file: `supabase/functions/fetch-daily-news/dedup.test.ts` (13 tests)
- Extended vitest config to include `supabase/functions/**/*.test.ts`
- Verification: `npm run test` passes (26/26), `npm run build` passes

### Session 2026-03-19 changes

- **Refresh error UX**: `src/pages/Index.tsx` now detects 429/quota errors from `fetch-daily-news` and shows "AI quota reached — refresh resets daily at midnight." instead of generic "Failed to refresh feed". Root cause confirmed: Gemini free tier 10k/day limit exhausted.
- **Nickname edit**: Settings tab now has inline edit for nickname
  - `src/hooks/useAuth.tsx` — added `updateDisplayName()` calling `supabase.auth.updateUser`
  - `src/features/tabs/SettingsTab.tsx` — inline edit field with Save/Cancel, Enter/Escape keyboard support, saving toast
- **Community "How This Helps You" overhaul** (`supabase/functions/fetch-daily-news/index.ts`):
  - Removed `inferGithubGoodFor()` and `inferGithubPainPoint()` heuristics that produced identical sentences per category (all RAG repos → same text, all agent repos → same text)
  - Rewrote `buildGithubHowItHelps()` to start with the actual repo name, pull a sentence from the real description, name a specific audience, and end with a concrete adoption tip — unique per item
  - Expanded `isGenericGithubHelp()` to catch the old "Best for teams…" heuristic patterns so stale stored rows get regenerated on next ingest
  - Updated Gemini prompt rule to explicitly require unique, repo-named `how_it_helps` per community item
  - Deployed to Supabase project `kkcsjbdeeevzpmxpjwhi`
- **Verification**: `npm run build` passes

### Session 2026-03-19 continued

- **Daily Brief: 3 fixed tabs** — replaced 2-tab + region dropdown with Executive Briefing / TLDR AI / Africa
  - `src/features/briefing/ExecutiveBriefingSection.tsx` — removed region prop and Africa section; renders global_items + signals_to_watch only
  - `src/features/briefing/AfricaSection.tsx` (new) — renders africa_items with africa_no_update handling
  - `src/components/ExecutiveSummary.tsx` — rewritten to 3 fixed tabs, removed all region selector state/imports
  - `src/pages/Index.tsx` — removed `loadStoredRegion` import; refresh now passes `region: "africa"` directly
  - `src/domain/briefing/regions.ts` (new) — region constants, loadStoredRegion, saveRegion (used by edge function)
- **Use Cases: always show 5** — `src/features/tabs/UseCasesTab.tsx` now pads highlighted items with latest non-highlighted to always reach 5; DB query capped at 50 rows (`src/hooks/useUseCases.ts`)
- **Semantic token cleanup** — replaced remaining foreground-opacity one-offs with semantic tokens:
  - `border-foreground/10` → `border-border` in `ExecutiveSummary.tsx`
  - `border-destructive/30` → `border-destructive` in `SavedTab.tsx`
  - `text-muted-foreground/30` → `text-muted-foreground` in `SavedTab.tsx`
- **Hook extraction** — moved logic out of `Index.tsx` into dedicated hooks:
  - `src/hooks/useFeedRefresh.ts` (new) — full refresh flow: invoke, quota error detection, toast, refetch
  - `src/hooks/useCommunitySearch.ts` (new) — query/results/searching/searched state + search + reset
  - `src/pages/Index.tsx` now orchestration-only (~130 lines, no business logic)
- **Type safety** — discriminated union for bookmark `data` field in `src/hooks/useBookmarks.ts`; `SavedTab.tsx` updated to use typed bookmark data
- **Domain test coverage** — 71 unit tests across regions, briefing, news/community normalizers, time formatting, use-case taxonomy
- **Verification**: `npm run build` passes, all tests green

### Session 2026-03-19 continued (cron + key rotation)

- **Cron job**: daily auto-refresh at 12:00 UTC (7 AM ET) — no more manual trigger
  - `supabase/migrations/20260319120000_cron_daily_refresh.sql` — enables pg_cron + pg_net, schedules `ai-radar-daily-refresh`
  - `supabase/functions/fetch-daily-news/config.toml` — `verify_jwt = false` so cron can call without auth header
  - Migration pushed, function redeployed
- **Key rotation**: Gemini API key rotated and pushed to Supabase secrets; `SUPABASE_SERVICE_ROLE_KEY` auto-injected by Supabase (no manual secret needed)

### UI audit + font update (2026-03-19)

- **Font system**: body text switched from Inter Tight to Lexend (`src/index.css`, `tailwind.config.ts` `sans` family); titles/display elements (`font-display`) switched to Segoe UI with system-ui / -apple-system fallback
- **Mobile responsiveness fixes**:
  - Settings nickname input: `w-48` → `w-full sm:w-48` (no longer overflows on phones)
  - Main tab strip: wrapped in relative container with `sm:hidden` gradient fade on right edge as overflow hint
  - Daily Brief sub-tab strip (`ExecutiveSummary`): added `overflow-x-auto no-scrollbar` (was missing)
  - Card footers (`UseCaseCard`, `CommunityCard`): added `flex-wrap min-w-0` to left content row for xs screens
- **Spacing normalisation**:
  - `CommunitySearch` form: removed `mb-6` (double-stacking with parent `space-y-8` → 56px gap, now 32px)
  - `CommunityTab` h2: removed redundant `mb-6`
  - `CategoryFilter`: removed built-in `mb-6`; spacing now owned by `LatestNewsTab`'s new `space-y-6 sm:space-y-8` wrapper
  - `LatestNewsTab`: added `space-y-6 sm:space-y-8` wrapper, removed stacked `mb-6` from section header
- **Consistency**: removed misleading `rounded-lg` from LatestNewsTab load-more button

### GitHub deployment (2026-03-19)

- Initialised git repo; added `.env` to `.gitignore` (was missing — secrets protected)
- Removed Lovable OG image and `@Lovable` Twitter handle from `index.html`; replaced with `/ai-mark.png` and `@MVIntelligence`; removed stale TODO comment
- Added `public/_redirects` (`/* /index.html 200`) for Cloudflare Pages SPA routing
- Fixed blank-page deployment issue: correct env var name is `VITE_SUPABASE_PUBLISHABLE_KEY` (not `VITE_SUPABASE_ANON_KEY`)
- Repo: `https://github.com/gigibymv/airadar.git`

### RLS audit + security hardening (2026-03-19)

- Full RLS audit: all 8 tables correctly configured
  - Public content tables: public read, service_role write only
  - `profiles` + `bookmarks`: each user can only access their own rows
- Closed gap: `supabase/migrations/20260319130000_rls_grants_user_tables.sql`
  - Explicit `GRANT`/`REVOKE` for `profiles` and `bookmarks` (previously relied on implicit Supabase defaults)
  - `anon` role explicitly blocked from both user tables
  - Migration pushed to Supabase project `kkcsjbdeeevzpmxpjwhi`
- Standing rule: never log customer emails, tokens, or payment data during debugging

## Next Immediate Task

Monitor near-match logs (`[dedup] near-match`) from the next live refresh run to validate the 0.65 Dice threshold. Adjust in `dedup.ts` (DICE_THRESHOLD constant) if too aggressive or too loose.
