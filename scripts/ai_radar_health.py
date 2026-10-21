"""Daily cloud monitor. Public health reads; at most one append-mode recovery.

No API keys, paid AI calls, database writes, or deployments are performed by
this script. Recovery calls the existing ingestion endpoint with its existing
free-tier configuration. Never retries the recovery POST itself.
"""
import argparse
import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

SITE = "https://airadar.pages.dev/"
FUNCTION = "https://kkcsjbdeeevzpmxpjwhi.supabase.co/functions/v1/fetch-daily-news"
TABLES = ("news_articles", "tldr_items", "community_posts", "use_cases", "executive_briefings")


def parse_time(value):
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        raise ValueError("Timestamp must include timezone")
    return parsed


def age_minutes(value, now):
    return (now - parse_time(value)).total_seconds() / 60


def assess(health, now):
    """Return confirmed data issues, recovery eligibility, and pending state."""
    if health.get("status") != "ok":
        raise ValueError("Health endpoint did not report ok")
    runs = health.get("last_runs")
    fresh = health.get("content_freshness")
    if not isinstance(runs, list) or not isinstance(fresh, dict) or set(fresh) != set(TABLES):
        raise ValueError("Health response lacks pipeline or content freshness data")
    ordered = sorted(runs, key=lambda run: parse_time(run["started_at"]), reverse=True)
    latest = ordered[0] if ordered else None
    if any(age_minutes(run["started_at"], now) < -5 for run in ordered):
        raise ValueError("Unexpected future pipeline timestamp")
    if any(value and age_minutes(value, now) < -5 for value in fresh.values()):
        raise ValueError("Unexpected future content timestamp")
    if latest and latest.get("status") == "running" and age_minutes(latest["started_at"], now) < 15:
        return [], False, True
    issues = []
    success = next((run for run in ordered if run.get("status") == "success"), None)
    if not success or age_minutes(success.get("finished_at") or success["started_at"], now) > 26 * 60:
        issues.append("No successful collection in the last 26 hours")
    expected = now.replace(hour=12, minute=0, second=0, microsecond=0)
    if now < expected + timedelta(minutes=20):
        expected -= timedelta(days=1)
    if success and parse_time(success["started_at"]) < expected:
        issues.append("No successful collection since the latest daily 12:00 UTC schedule")
    if latest and latest.get("status") != "success":
        issues.append("Latest collection is " + str(latest.get("status")))
    for table in TABLES:
        if not fresh[table] or age_minutes(fresh[table], now) > 26 * 60:
            issues.append("Stale or empty content: " + table)
    eligible = bool(issues) and (not latest or age_minutes(latest["started_at"], now) >= 60)
    return issues, eligible, False


def post(mode, timeout=25):
    payload = {"mode": mode}
    if mode == "append":
        payload["region"] = "africa"
    request = Request(FUNCTION, data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"})
    with urlopen(request, timeout=timeout) as response:
        return json.load(response)


def curl(url):
    result = subprocess.run(
        ["curl", "--fail", "--silent", "--show-error", "--location", "--max-time", "20", url],
        capture_output=True, timeout=25,
    )
    if result.returncode:
        raise RuntimeError("Public resource unavailable: " + urlparse(url).path)
    return result.stdout.decode(errors="replace")


def check_site():
    html = curl(SITE)
    if "AI Radar" not in html:
        raise RuntimeError("Unexpected public page")
    assets = re.findall(r'(?:src|href)="(/assets/[^"<>]+\.(?:js|css))"', html)
    if not any(asset.endswith(".js") for asset in assets) or not any(asset.endswith(".css") for asset in assets):
        raise RuntimeError("Public page lacks expected JS/CSS assets")
    for asset in assets:
        # Only fetch same-origin assets, never a URL supplied by third-party content.
        if asset.startswith("/assets/") and ".." not in asset:
            curl(urljoin(SITE, asset))


def inspect():
    problems = []
    try:
        check_site()
    except Exception as error:
        problems.append(str(error))
    health = post("health")
    data_issues, eligible, pending = assess(health, datetime.now(timezone.utc))
    return {"health": health, "issues": problems + data_issues,
            "retry": eligible and not problems, "pending": pending}


def monitor(check_only=False, inspect_fn=inspect, recover_fn=None, sleep_fn=time.sleep):
    recover_fn = recover_fn or (lambda: post("append", timeout=180))
    def observe():
        try:
            return inspect_fn()
        except Exception:
            sleep_fn(20)
            return inspect_fn()

    first = observe()
    if not first["issues"]:
        return {"status": "collection_in_progress" if first["pending"] else "healthy", "repaired": False}
    sleep_fn(20)
    confirmed = observe()
    if not confirmed["issues"]:
        return {"status": "healthy_after_recheck", "repaired": False}
    if check_only or not confirmed["retry"]:
        raise RuntimeError("; ".join(confirmed["issues"]) + "; automatic recovery not permitted by safety rules")
    # This is the only recovery POST. A timeout has an unknown outcome: inspect
    # pipeline_runs afterwards rather than submitting a second collection.
    before = confirmed["health"]["content_freshness"]
    started = datetime.now(timezone.utc)
    try:
        recover_fn()
    except Exception:
        pass
    for attempt in range(4):
        sleep_fn(20)
        after = observe()
        if not after["issues"] and not after["pending"]:
            last = max(after["health"]["last_runs"], key=lambda run: parse_time(run["started_at"]))
            advanced = any(after["health"]["content_freshness"][table] != before[table] for table in TABLES)
            if last["status"] == "success" and parse_time(last["started_at"]) >= started and advanced:
                return {"status": "recovered", "repaired": True}
        if not after["pending"] and after["issues"] and attempt == 3:
            raise RuntimeError("Recovery did not restore data freshness: " + "; ".join(after["issues"]))
    raise RuntimeError("Recovery not verified; inspect the latest pipeline run before another attempt")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check-only", action="store_true", help="Never start a recovery collection")
    args = parser.parse_args()
    try:
        result = monitor(check_only=args.check_only)
        code = 0
    except Exception as error:
        result = {"status": "failed", "error": str(error)[:500], "needs_attention": True}
        code = 1
    print(json.dumps(result))
    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with Path(summary).open("a") as report:
            report.write("## AI Radar daily check\n\n```json\n" + json.dumps(result, indent=2) + "\n```\n")
    return code


if __name__ == "__main__":
    sys.exit(main())
