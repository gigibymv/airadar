-- Enable required extensions
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Remove existing job if present (idempotent re-runs)
select cron.unschedule('ai-radar-daily-refresh')
where exists (
  select 1 from cron.job where jobname = 'ai-radar-daily-refresh'
);

-- Schedule daily refresh at 12:00 UTC (7 AM ET / EST, 8 AM EDT in summer).
-- fetch-daily-news has verify_jwt = false so no auth header is needed.
select cron.schedule(
  'ai-radar-daily-refresh',
  '0 12 * * *',
  $$
  select
    net.http_post(
      url     := 'https://kkcsjbdeeevzpmxpjwhi.supabase.co/functions/v1/fetch-daily-news',
      headers := '{"Content-Type":"application/json"}'::jsonb,
      body    := '{"mode":"append","region":"africa"}'::jsonb
    ) as request_id;
  $$
);
