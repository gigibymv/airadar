-- Daily fetch-daily-news automation at 3:00 AM America/New_York.
-- Uses an hourly cron with timezone gate so DST transitions are handled automatically.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM cron.job
    WHERE jobname = 'fetch-daily-news-7am-boston'
  ) THEN
    PERFORM cron.unschedule('fetch-daily-news-7am-boston');
  END IF;
END
$$;

SELECT cron.schedule(
  'fetch-daily-news-7am-boston',
  '0 * * * *',
  $job$
  SELECT CASE
    WHEN to_char((now() AT TIME ZONE 'America/New_York'), 'HH24:MI') = '03:00' THEN
      net.http_post(
        url := 'https://kkcsjbdeeevzpmxpjwhi.supabase.co/functions/v1/fetch-daily-news',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrY3NqYmRlZWV2enBteHBqd2hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MTE0OTMsImV4cCI6MjA4OTM4NzQ5M30.8q4HLRmPct9YxkVt9XUYomwHzJZHucWk8tVcYn9bYj0',
          'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrY3NqYmRlZWV2enBteHBqd2hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MTE0OTMsImV4cCI6MjA4OTM4NzQ5M30.8q4HLRmPct9YxkVt9XUYomwHzJZHucWk8tVcYn9bYj0'
        ),
        body := '{"mode":"append"}'::jsonb
      )
    ELSE
      NULL::bigint
  END;
  $job$
);
