# AI Radar — Task Board

## Current objective

Use Codex to audit and improve the AI Radar codebase while preserving product truth.

## Phase 1 — Repo audit

- [ ] Identify stack, framework, routing model, and deployment assumptions
- [ ] Identify auth implementation and confirm Password Gate vs Supabase Auth separation
- [ ] Identify navigation implementation and confirm all core tabs exist
- [ ] Identify data-fetching paths for Daily Brief, Latest News, Community, Use Cases, and Saved
- [ ] Identify whether `fetch-daily-news` already exists and how it is wired
- [ ] Identify mock data, hardcoded assumptions, and generated-code smells
- [ ] Identify files that are safe to keep, files that need refactor, and files that should be rewritten

## Phase 2 — Product alignment

- [ ] Verify Daily Brief is not just Latest News with a renamed heading
- [ ] Verify Use Cases has its own content logic
- [ ] Verify Saved is user-scoped
- [ ] Verify taxonomy supports by people and by companies
- [ ] Verify Settings is non-functional placeholder unless product scope changed

## Phase 3 — Architecture hardening

- [ ] Separate access concerns from page rendering
- [ ] Separate domain mapping from UI templates
- [ ] Consolidate duplicated fetching logic
- [ ] Introduce clearer feature boundaries
- [ ] Standardize semantic styling tokens and editorial component patterns

## Phase 4 — Codex operating hygiene

- [ ] Keep `AGENTS.md` concise and accurate
- [ ] Update `memory.md` when product truth changes
- [ ] Update architecture docs when structural decisions are made
- [ ] Remove stale instructions that no longer match the repo

## Notes

Use this file as a live checklist.
When a task is completed, mark it explicitly.
When a task is reframed, replace it instead of letting stale tasks accumulate.