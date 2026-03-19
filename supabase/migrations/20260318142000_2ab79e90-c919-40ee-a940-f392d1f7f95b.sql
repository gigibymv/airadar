-- Hard dedupe by canonical item URL across all ingest surfaces.
-- 1) Remove existing duplicate rows (keep most recent)
-- 2) Enforce unique URL at DB level

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY url ORDER BY created_at DESC, id DESC) AS rn
  FROM public.news_articles
)
DELETE FROM public.news_articles n
USING ranked r
WHERE n.id = r.id
  AND r.rn > 1;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY url ORDER BY created_at DESC, id DESC) AS rn
  FROM public.tldr_items
)
DELETE FROM public.tldr_items t
USING ranked r
WHERE t.id = r.id
  AND r.rn > 1;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY url ORDER BY created_at DESC, id DESC) AS rn
  FROM public.community_posts
)
DELETE FROM public.community_posts c
USING ranked r
WHERE c.id = r.id
  AND r.rn > 1;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY url ORDER BY created_at DESC, id DESC) AS rn
  FROM public.use_cases
)
DELETE FROM public.use_cases u
USING ranked r
WHERE u.id = r.id
  AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS news_articles_url_unique_idx
  ON public.news_articles (url);

CREATE UNIQUE INDEX IF NOT EXISTS tldr_items_url_unique_idx
  ON public.tldr_items (url);

CREATE UNIQUE INDEX IF NOT EXISTS community_posts_url_unique_idx
  ON public.community_posts (url);

CREATE UNIQUE INDEX IF NOT EXISTS use_cases_url_unique_idx
  ON public.use_cases (url);
