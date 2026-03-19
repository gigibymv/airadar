# AI Radar — Codex Operating Guide

Use this repository to build and refine **AI Radar**, an authenticated editorial intelligence product for tracking AI news, signals, and use cases.

This file is the entrypoint for Codex. Keep it short. Treat the documents below as the governing references:

- `memory.md` — persistent project state and non-negotiable product truths
- `ARCHITECTURE.md` — target system structure and responsibilities
- `IMPLEMENTATION_RULES.md` — implementation constraints and coding rules
- `TASKS.md` — active work queue and execution order

## Product truth

If implementation conflicts with product docs, follow the product docs.

Core invariants:
- App name: **AI Radar**
- Access model: **Password Gate first**, then **Supabase Auth**
- Navigation: **Daily Brief**, **Latest News**, **Community**, **Use Cases**, **Saved**
- **Settings** is visible but disabled / not implemented
- Content grouping must support **by people** and **by companies**
- News ingestion pipeline is centered on `fetch-daily-news`
- UI should follow an editorial system with **sharp corners**, clean hierarchy, and semantic design tokens

## Working mode

When making changes:
1. Read `memory.md` first
2. Read only the most relevant section of `ARCHITECTURE.md`
3. Follow `IMPLEMENTATION_RULES.md`
4. Update `TASKS.md` when a task is completed or reframed

## Expected behavior

Codex should:
- preserve product invariants
- prefer small, reversible changes
- avoid silent architectural drift
- document meaningful decisions in code comments only when necessary
- not invent features outside the documented scope

## Do not do this

- do not replace the access model with auth-only
- do not add Settings flows before core tabs are stable
- do not collapse editorial distinctions between Daily Brief and Latest News
- do not mix “people” and “companies” into one ambiguous taxonomy
- do not introduce rounded consumer-app styling if it conflicts with the editorial design language