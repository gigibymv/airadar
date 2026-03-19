CREATE TABLE public.use_cases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  summary text NOT NULL,
  tools_used text[] NOT NULL DEFAULT '{}',
  productivity_gain text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT 'reddit',
  author text NOT NULL DEFAULT 'Anonymous',
  url text NOT NULL,
  upvotes integer,
  likes integer,
  stars integer,
  comments integer DEFAULT 0,
  published_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.use_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read use cases" ON public.use_cases FOR SELECT TO public USING (true);
CREATE POLICY "Service role can manage use cases" ON public.use_cases FOR ALL TO public USING (auth.role() = 'service_role'::text);

ALTER PUBLICATION supabase_realtime ADD TABLE public.use_cases;