# AI Radar — Target Architecture

## 1. System overview

AI Radar is an authenticated content intelligence application with:
- gated access
- user auth
- editorial content surfaces
- saved/bookmarked content
- ingestion and normalization of AI news

The architecture should cleanly separate:
- access control
- application shell
- data ingestion
- domain models
- UI rendering

## 2. Major layers

### A. Access layer
Responsibilities:
- Password Gate before app entry
- Supabase Auth for user identity and user-bound features
- route/session protection
- explicit state transitions between gate, auth, and app shell

This layer must not be mixed casually into page components.

### B. App shell
Responsibilities:
- top-level layout
- tab navigation
- loading / empty / error shell states
- shared search, filters, and navigation primitives if present

Tabs:
- Daily Brief
- Latest News
- Community
- Use Cases
- Saved
- Settings placeholder only

### C. Domain layer
Core domain objects likely include:
- Article / News Item
- Person
- Company
- Topic / Theme
- Use Case
- Saved Item / Bookmark
- User

Relationships should stay explicit. Do not overload one entity to represent multiple editorial roles.

### D. Data layer
Responsibilities:
- fetch from Supabase or API routes
- normalize payloads
- handle filtering, ordering, and grouping
- keep view models separate from raw records when complexity grows

### E. Ingestion layer
Responsibilities:
- run `fetch-daily-news`
- validate and normalize feed output
- deduplicate
- classify entities and themes
- persist data safely

## 3. Product-specific architectural expectations

### Daily Brief
Purpose:
- curated, editorially meaningful digest
- higher signal, more structured than Latest News

Should not be implemented as a trivial alias of Latest News.

### Latest News
Purpose:
- freshest stream
- more feed-like than Daily Brief

### Community
Purpose:
- community-related signals, commentary, or ecosystem activity

### Use Cases
Purpose:
- practical applications of AI
- should not be modeled as generic news unless the product docs explicitly allow that

### Saved
Purpose:
- user-specific stored items
- depends on authenticated identity

## 4. Access flow

Recommended high-level sequence:
1. user hits app
2. Password Gate evaluated
3. user passes gate
4. Supabase Auth evaluated
5. authenticated session enters shell
6. tab-specific data loads

Avoid mixing all of this into a single monolithic page.

## 5. Suggested code organization

Example target structure:
- `app/` or `src/app/`
  - route/layout files
  - page entrypoints
- `components/`
  - shell
  - navigation
  - cards/lists
  - feature-specific UI
- `features/`
  - daily-brief
  - latest-news
  - community
  - use-cases
  - saved
  - auth
  - password-gate
- `lib/`
  - api clients
  - supabase
  - utilities
  - constants
- `domain/`
  - types
  - mappers
  - validators
- `scripts/` or backend functions
  - fetch-daily-news
  - normalization helpers

Exact structure can vary, but separation of concerns must remain clear.

## 6. Data modeling guidance

Keep distinct:
- raw ingest record
- normalized stored record
- UI presentation model

Support explicit grouping/filtering by:
- people
- companies

Do not hide taxonomy decisions inside presentation code.

## 7. Styling and design system

The design language should feel editorial:
- square / low-radius surfaces
- strong typography hierarchy
- restrained visual noise
- semantic tokens, not arbitrary hardcoded colors
- consistency across cards, lists, chips, and section headers

## 8. Anti-patterns

Avoid:
- one giant page owning all logic
- duplicated fetching logic across tabs
- mixing auth logic into low-level presentational components
- hardcoded mock structures pretending to be stable domain models
- “temporary” shortcuts that redefine product behavior