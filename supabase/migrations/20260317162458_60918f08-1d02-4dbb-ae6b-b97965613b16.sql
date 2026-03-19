
-- Create enum for use case type
CREATE TYPE public.use_case_type AS ENUM ('person', 'company');

-- Add type column to use_cases, default to 'person' for existing data
ALTER TABLE public.use_cases ADD COLUMN type public.use_case_type NOT NULL DEFAULT 'person';
