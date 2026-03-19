-- Ensure API roles can read public use_cases (RLS still enforces row visibility).
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT ON TABLE public.use_cases TO anon, authenticated;
GRANT ALL ON TABLE public.use_cases TO service_role;
