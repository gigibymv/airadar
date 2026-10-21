# Daily cloud health check

Owner: `.github/workflows/ai-radar-health.yml`. Runs once daily at 09:30
America/New_York on GitHub-hosted Ubuntu, independently of MV's Mac, and can
also be started manually from the repository's Actions tab.

The monitor uses no GitHub secrets, Supabase management credentials or Gemini
keys. It calls the existing public health mode of `fetch-daily-news` and checks
the homepage, referenced JavaScript/CSS, pipeline status and actual latest row
timestamps for all five content tables. The health response now includes
`content_freshness`; database read errors fail the check instead of returning
a misleading healthy response. This adds only operational timestamps to the
existing public health surface.

The monitor detects failed/stuck collections, missing daily 12:00 UTC ingestion
after a 20-minute grace period, and data older than 26 hours. A running collection
younger than 15 minutes defers action. Failed checks are confirmed by a second
read. A collection started in the last 60 minutes blocks a recovery attempt.

On a confirmed data incident, at most one append-mode collection with region
`africa` is requested. The existing configured free-tier providers remain in
use. An ambiguous POST timeout is followed by status reads, never a duplicate
POST. Recovery is claimed only after a new successful pipeline run, actual data
progress and successful public site checks. No full refresh, direct editorial
data changes, code rewrites, deployment, key rotation or paid fallback is
performed by this cloud monitor. Persistent incidents fail the workflow for
human diagnosis. Code repairs require a separate authorized engineering run.

Results and failures are visible in GitHub Actions and its run summary. Email
or mobile delivery follows the account's GitHub Actions notification settings;
this implementation does not change those preferences or claim email delivery
has been tested.

GitHub-hosted standard runners are free for this public repository. GitHub can
delay/drop scheduled runs during high load, and disables public-repository
schedules after 60 days without repository activity. Check the Actions workflow
state after inactivity; this is a bounded monitor, not a zero-downtime guarantee.
Do not add automated keepalive commits or a second overlapping monitor.

Validation commands:

```sh
python3 -m unittest discover -s scripts -p 'test_ai_radar_health.py'
python3 scripts/ai_radar_health.py --check-only
```

The obsolete local heartbeat `ai-radar-contr-le-et-r-paration` should be paused
after the cloud workflow's first successful execution. The ingestion cron
schedules themselves remain unchanged.
