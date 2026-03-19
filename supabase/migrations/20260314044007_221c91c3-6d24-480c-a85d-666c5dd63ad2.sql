
CREATE TABLE public.pipeline_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  mode text NOT NULL DEFAULT 'append',
  status text NOT NULL DEFAULT 'running',
  counts jsonb,
  error_message text,
  duration_ms integer
);

ALTER TABLE public.pipeline_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read pipeline runs"
  ON public.pipeline_runs FOR SELECT TO public USING (true);

CREATE POLICY "Service role can manage pipeline runs"
  ON public.pipeline_runs FOR ALL TO public
  USING (auth.role() = 'service_role'::text);

-- Retain only last 90 days of runs
CREATE OR REPLACE FUNCTION public.cleanup_old_pipeline_runs()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.pipeline_runs WHERE started_at < now() - interval '90 days';
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_cleanup_pipeline_runs
  AFTER INSERT ON public.pipeline_runs
  FOR EACH STATEMENT EXECUTE FUNCTION public.cleanup_old_pipeline_runs();
