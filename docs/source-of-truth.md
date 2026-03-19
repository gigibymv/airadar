# AI Radar — Source of Truth

> What must always be true. Validate against this before any change.

## Authentication

- [ ] Password Gate protects the entire app. Password: `gigi`. Stored in `sessionStorage`.
- [ ] Supabase Auth required for dashboard access. Email + password only.
- [ ] `ProtectedRoute` wraps the Index page — unauthenticated users redirect to `/auth`.
- [ ] Profiles are auto-created on signup via database trigger.

## Data Ownership & Security

- [ ] `bookmarks` table: RLS enforces `auth.uid() = user_id` on SELECT, INSERT, DELETE.
- [ ] `profiles` table: RLS enforces `auth.uid() = id` on SELECT, UPDATE.
- [ ] All content tables (`news_articles`, `tldr_items`, `executive_briefings`, `community_posts`, `use_cases`, `pipeline_runs`) are **public read**, **service-role write only**.
- [ ] No user can modify shared content from the client.

## Navigation

- [ ] 5 tabs exist: Daily Brief, Latest News, Community, Use Cases, Saved.
- [ ] Settings tab is visible but disabled (greyed out).
- [ ] Sidebar visible on `lg:` breakpoint and up. Mobile uses hamburger menu.
- [ ] Tab navigation is duplicated: sidebar (desktop) + inline tabs (all viewports).

## Use Cases Tab

- [ ] Two sections when not searching: **"by people"** (shown first) and **"by companies"**.
- [ ] `use_cases.type` column: enum `person | company`, default `person`.
- [ ] Pipeline classifies type automatically during ingestion.
- [ ] AI-powered search via `search-use-cases` Edge Function.

## Daily Brief Tab

- [ ] Two sub-sections: "Executive Briefing" and "TLDR AI".
- [ ] Executive Briefing shows: Global AI items, African AI items, Signals to Watch.
- [ ] TLDR AI shows items filterable by category: headlines, research, tools, launches.

## News Tab

- [ ] Filterable by category: LLMs, Robotics, Research, Industry, Policy.
- [ ] Searchable via text input.
- [ ] Shows first 10 items with "Load more" for the rest.

## Community Tab

- [ ] Sources: GitHub and Reddit.
- [ ] AI-powered search via `search-community` Edge Function.

## Bookmarks

- [ ] Users can bookmark items from any tab (news, use cases, community, TLDR, briefing).
- [ ] Saved tab shows bookmarks grouped by category.
- [ ] Bookmark state is per-user, stored in `bookmarks` table.

## Pipeline

- [ ] Single Edge Function `fetch-daily-news` populates all content tables.
- [ ] Uses Lovable AI Gateway (Gemini model).
- [ ] Supports `append` mode (adds new content alongside existing).
- [ ] Logs every run to `pipeline_runs` with status, duration, counts.

## Design System

- [ ] Font: Inter Tight (all weights, italic variants).
- [ ] Border radius: 0px (sharp corners throughout).
- [ ] Color palette: warm neutral background (`40 8% 92%`), near-black foreground.
- [ ] Primary accent: blue (`225 85% 50%`).
- [ ] All colors defined as HSL CSS variables in `index.css`.
- [ ] No direct color classes in components — always use semantic tokens.
