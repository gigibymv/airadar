DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'use_case_category'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.use_case_category AS ENUM (
      'productivity',
      'healthcare',
      'finance',
      'marketing',
      'customer-support',
      'operations',
      'engineering',
      'education',
      'legal',
      'hr',
      'other'
    );
  END IF;
END
$$;

ALTER TABLE public.use_cases
  ADD COLUMN IF NOT EXISTS category public.use_case_category NOT NULL DEFAULT 'productivity',
  ADD COLUMN IF NOT EXISTS is_highlighted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS highlighted_date date,
  ADD COLUMN IF NOT EXISTS highlighted_rank integer;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'use_cases_highlighted_rank_check'
  ) THEN
    ALTER TABLE public.use_cases
      ADD CONSTRAINT use_cases_highlighted_rank_check
      CHECK (highlighted_rank IS NULL OR highlighted_rank BETWEEN 1 AND 5);
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS use_cases_type_category_created_idx
  ON public.use_cases (type, category, created_at DESC);

CREATE INDEX IF NOT EXISTS use_cases_highlight_lookup_idx
  ON public.use_cases (highlighted_date, type, highlighted_rank)
  WHERE is_highlighted = true;
