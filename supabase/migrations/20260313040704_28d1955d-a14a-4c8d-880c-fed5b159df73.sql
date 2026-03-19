
CREATE TABLE public.executive_briefings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  published_date date NOT NULL DEFAULT CURRENT_DATE,
  global_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  africa_items jsonb DEFAULT NULL,
  africa_no_update boolean NOT NULL DEFAULT false,
  signals_to_watch jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(published_date)
);

ALTER TABLE public.executive_briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read briefings" ON public.executive_briefings FOR SELECT TO public USING (true);
CREATE POLICY "Service role can manage briefings" ON public.executive_briefings FOR ALL TO public USING (auth.role() = 'service_role');

CREATE TRIGGER update_executive_briefings_updated_at
  BEFORE UPDATE ON public.executive_briefings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
