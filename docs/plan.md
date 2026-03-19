# AI Radar — Project Plan

> Persistent context document. Update as decisions are made.

## 1. Product Vision

AI Radar is a **daily AI intelligence briefing platform** for professionals who need to stay current on AI developments without information overload. It curates, summarises, and organises AI news, community discussions, and real-world use cases into a single, scannable dashboard.

## 2. Architecture Overview

| Layer | Stack |
|-------|-------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | Lovable Cloud (Supabase) — Postgres, Edge Functions, Auth, RLS |
| AI Pipeline | Edge Function `fetch-daily-news` → Lovable AI Gateway (Gemini) → DB |
| Search | Edge Functions `search-use-cases`, `search-community` → AI-powered semantic search |

## 3. Data Model (current)

| Table | Purpose | RLS |
|-------|---------|-----|
| `profiles` | User display name / email | Per-user (auth.uid = id) |
| `bookmarks` | Saved items per user | Per-user (auth.uid = user_id) |
| `news_articles` | Curated AI news | Public read, service-role write |
| `tldr_items` | TLDR AI digest items | Public read, service-role write |
| `executive_briefings` | Daily exec briefing (global + Africa) | Public read, service-role write |
| `community_posts` | GitHub/Reddit community highlights | Public read, service-role write |
| `use_cases` | Real-world AI use cases | Public read, service-role write |
| `pipeline_runs` | Pipeline execution logs | Public read, service-role write |

### Key enums
- `news_category`: LLMs, Robotics, Research, Industry, Policy
- `tldr_category`: headlines, research, tools, launches
- `community_source`: github, reddit
- `use_case_type`: person, company

## 4. Authentication Flow

1. **Password Gate** — shared password (`gigi`) stored in `sessionStorage`. Grants access to the app shell.
2. **Supabase Auth** — individual email/password signup + login. Auto-confirm is enabled. `ProtectedRoute` guards the dashboard.

## 5. Tabs / Sections

| Tab | Content |
|-----|---------|
| **Daily Brief** | Executive Briefing (Global AI, African AI, Signals to Watch) + TLDR AI digest |
| **Latest News** | Filterable news feed by category, searchable, with load-more |
| **Community** | GitHub/Reddit posts with AI-powered search |
| **Use Cases** | Split into **"by people"** (personal workflows) and **"by companies"** (enterprise deployments). AI-powered search. |
| **Saved** | User's bookmarked items across all categories |

## 6. Pipeline

The `fetch-daily-news` Edge Function:
- Calls Lovable AI Gateway (Gemini) to generate curated content
- Populates `news_articles`, `tldr_items`, `executive_briefings`, `community_posts`, `use_cases`
- Classifies use cases as `person` or `company` automatically
- Logs runs to `pipeline_runs`

## 7. Decisions Log

| Date | Decision |
|------|----------|
| 2026-03-17 | Use cases split into "by people" / "by companies" sections |
| 2026-03-17 | Added `use_case_type` enum + `type` column to `use_cases` table |
| 2026-03-17 | Pipeline auto-classifies use case type during ingestion |

## 8. Open Items / Next Steps

- [ ] Populate company-type use cases (currently all default to `person`)
- [ ] Settings tab (currently disabled)
- [ ] Dark mode toggle
- [ ] Read/unread tracking per user
- [ ] User preferences (preferred categories, notification settings)
