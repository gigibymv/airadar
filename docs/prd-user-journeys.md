# AI Radar — PRD: User Journeys

## 1. First-Time Access

```
User visits app
  → Password Gate screen (shared password: "gigi")
  → Enters password
  → Redirected to /auth (signup form)
  → Creates account (email + password + display name)
  → Auto-confirmed, redirected to dashboard
  → Lands on "Daily Brief" tab
```

## 2. Returning User Login

```
User visits app
  → Password Gate (checks sessionStorage — skipped if already passed this session)
  → /auth login form (email + password)
  → Authenticated, redirected to dashboard
  → Lands on "Daily Brief" tab with greeting: "Hey [displayName]"
```

## 3. Daily Brief Consumption

```
User lands on "Daily Brief" tab
  → Sees two sub-tabs: "Executive Briefing" | "TLDR AI"
  
Executive Briefing:
  → Global AI section: bullet-point briefing items with source + implications
  → African AI section: regional updates (or "No major updates" notice)
  → Signals to Watch: emerging trends to monitor
  → Can expand/collapse strategic implications per item
  → Can bookmark any briefing item

TLDR AI:
  → Category filter: headlines, research, tools, launches
  → Scannable cards with title, summary, read time
  → "Read more" links to original source
  → Can bookmark any TLDR item
```

## 4. News Browsing

```
User navigates to "Latest News" tab
  → Sees category filter pills: LLMs, Robotics, Research, Industry, Policy
  → Selects a category (or views all)
  → Scans list of news items (title + source + summary)
  → Uses search bar to filter by keyword
  → First 10 items shown, "Load more" for older items
  → Clicks article to open source URL
  → Bookmarks interesting articles
  → Clicks "Refresh" to trigger pipeline for fresh content
```

## 5. Use Cases Exploration

```
User navigates to "Use Cases" tab
  → Sees hero header: "Real AI use cases from real people"
  
Default view (no search):
  → "by people" section: individual AI workflows and hacks
  → "by companies" section: enterprise/at-scale deployments
  → Each card shows: title, author, source, summary, tools used, productivity gain
  → Can bookmark any use case

Search mode:
  → Types a pain point or workflow in AI search bar
  → Clicks "Search" or presses Enter
  → AI-powered search returns relevant use cases from the web
  → Results displayed in "search results" section
  → Clearing search returns to curated view
```

## 6. Community Browsing

```
User navigates to "Community" tab
  → Sees community posts from GitHub and Reddit
  
Default view:
  → List of curated community posts
  → Each shows: title, author, source, description, engagement metrics
  → Can bookmark posts

Search mode:
  → Types query in AI search bar
  → AI-powered search finds relevant community discussions
  → Results replace default view
  → Clearing search returns to curated posts
```

## 7. Saved Items

```
User navigates to "Saved" tab
  → Sees all bookmarked items grouped by category:
    - News
    - Use Cases
    - Community
    - TLDR
    - Briefing
  → Each saved item shows title, source, save date
  → Can click to open original URL
  → Can remove bookmark (toggle off)
```

## 8. Refresh / Pipeline Trigger

```
User clicks "Refresh" button (available on News, Use Cases tabs)
  → Spinner appears on button
  → Edge Function `fetch-daily-news` is invoked
  → AI generates fresh content via Lovable AI Gateway
  → New items inserted into database
  → UI refetches and displays updated content
  → Toast notification: "Feed refreshed with latest articles"
  → On error: toast "Failed to refresh feed"
```

## 9. Sign Out

```
User clicks logout icon in sidebar (desktop) or navigates to user section
  → Supabase auth session cleared
  → Redirected to /auth login page
  → Password Gate session persists (no need to re-enter shared password)
```

## 10. Edge Cases

| Scenario | Behavior |
|----------|----------|
| No news articles yet | "No stories in this category today." |
| Search returns no results | "No use cases found for this pain point." |
| Pipeline fails | Toast error, content unchanged |
| User not authenticated | Redirect to /auth |
| Password Gate failed | Error flash, stays on gate screen |
| Mobile viewport | Sidebar hidden, hamburger menu, collapsible search |
