# AI Radar — Project Memory

## Current identity

This project is **AI Radar**, not a to-do app.

AI Radar is an authenticated editorial intelligence product focused on AI news, market signals, use cases, and saved items.

## Non-negotiable product truths

- There is a **two-layer access model**:
  1. Password Gate
  2. Supabase Auth

- Primary navigation includes:
  - Daily Brief
  - Latest News
  - Community
  - Use Cases
  - Saved

- Settings exists as a UI placeholder but is **not active product scope**

- News and entities need to support separation:
  - by people
  - by companies

- Backend / ingestion expectations include a pipeline centered on:
  - `fetch-daily-news`

- Product tone and UI style are editorial, structured, and sharp rather than playful or consumer-rounded

## Delivery priorities

1. Preserve product scope fidelity
2. Preserve information architecture
3. Preserve clear editorial hierarchy
4. Keep implementation maintainable for iterative agent work
5. Avoid speculative feature creep

## Known risks

- Generated code may flatten distinctions between tabs
- Generated code may blur auth and gating concerns
- Generated code may overuse generic components without preserving editorial hierarchy
- Generated code may produce inconsistent data contracts between ingest, storage, and UI

## Rules for future sessions

When auditing or changing the repo:
- assume product docs are canonical unless explicitly superseded
- call out drift clearly
- separate facts from guesses
- prefer explicit contracts over implied behavior
- do not rename core concepts casually

## Key terms to preserve

- AI Radar
- Password Gate
- Supabase Auth
- Daily Brief
- Latest News
- Community
- Use Cases
- Saved
- by people
- by companies
- fetch-daily-news