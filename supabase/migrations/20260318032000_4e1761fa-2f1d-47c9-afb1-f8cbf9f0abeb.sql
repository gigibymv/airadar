-- Ensure API roles can read core dashboard tables (RLS policies still apply).
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT ON TABLE public.news_articles TO anon, authenticated;
GRANT SELECT ON TABLE public.tldr_items TO anon, authenticated;
GRANT SELECT ON TABLE public.community_posts TO anon, authenticated;
GRANT SELECT ON TABLE public.executive_briefings TO anon, authenticated;
GRANT SELECT ON TABLE public.use_cases TO anon, authenticated;
GRANT SELECT ON TABLE public.pipeline_runs TO anon, authenticated;

GRANT ALL ON TABLE public.news_articles TO service_role;
GRANT ALL ON TABLE public.tldr_items TO service_role;
GRANT ALL ON TABLE public.community_posts TO service_role;
GRANT ALL ON TABLE public.executive_briefings TO service_role;
GRANT ALL ON TABLE public.use_cases TO service_role;
GRANT ALL ON TABLE public.pipeline_runs TO service_role;
