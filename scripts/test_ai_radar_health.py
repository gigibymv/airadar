import copy
import unittest
from datetime import datetime, timedelta, timezone
from unittest.mock import Mock

from ai_radar_health import TABLES, assess, monitor


def health(now, status="success", hours=1):
    when = (now - timedelta(hours=hours)).isoformat()
    return {"status": "ok", "last_runs": [{"status": status, "started_at": when, "finished_at": when}],
            "content_freshness": {table: when for table in TABLES}}


def observation(data, issues=None, retry=False, pending=False):
    return {"health": data, "issues": issues or [], "retry": retry, "pending": pending}


class MonitorRules(unittest.TestCase):
    def setUp(self):
        self.now = datetime(2026, 10, 21, 20, tzinfo=timezone.utc)

    def test_fresh_success_is_healthy(self):
        self.assertEqual(assess(health(self.now), self.now), ([], False, False))

    def test_failure_after_success_is_detected(self):
        data = health(self.now, "failed", 2)
        data["last_runs"].append(health(self.now, hours=3)["last_runs"][0])
        issues, retry, _ = assess(data, self.now)
        self.assertIn("Latest collection is failed", issues)
        self.assertTrue(retry)

    def test_missing_scheduled_run_is_detected_before_26_hours(self):
        issues, _, _ = assess(health(self.now, hours=23), self.now)
        self.assertTrue(any("12:00 UTC" in issue for issue in issues))

    def test_26_hour_stale_data_is_detected(self):
        issues, retry, _ = assess(health(self.now, hours=27), self.now)
        self.assertEqual(sum("Stale or empty" in issue for issue in issues), 5)
        self.assertTrue(retry)

    def test_recent_collection_defers_without_retry(self):
        self.assertEqual(assess(health(self.now, "running", 0.1), self.now), ([], False, True))

    def test_retry_cooldown_is_enforced(self):
        issues, retry, _ = assess(health(self.now, "failed", 0.5), self.now)
        self.assertTrue(issues)
        self.assertFalse(retry)

    def test_future_timestamp_is_not_treated_as_healthy_or_pending(self):
        with self.assertRaisesRegex(ValueError, "future"):
            assess(health(self.now, "running", -1), self.now)

    def test_missing_freshness_contract_fails(self):
        data = health(self.now)
        del data["content_freshness"]
        with self.assertRaises(ValueError):
            assess(data, self.now)

    def test_healthy_check_never_calls_ingestion(self):
        recover = Mock()
        self.assertEqual(monitor(inspect_fn=lambda: observation(health(self.now)), recover_fn=recover)["status"], "healthy")
        recover.assert_not_called()

    def test_transient_issue_is_rechecked_without_repair(self):
        recover = Mock()
        inspect = Mock(side_effect=[observation(health(self.now), ["transient"], True), observation(health(self.now))])
        monitor(inspect_fn=inspect, recover_fn=recover, sleep_fn=lambda _: None)
        recover.assert_not_called()

    def test_check_only_never_repairs(self):
        recover = Mock()
        with self.assertRaises(RuntimeError):
            monitor(True, lambda: observation(health(self.now), ["failed"], True), recover, lambda _: None)
        recover.assert_not_called()

    def test_single_repair_requires_new_success_and_data_progress(self):
        now = datetime.now(timezone.utc)
        before = observation(health(now, "failed", 2), ["failed"], True)
        after = observation(health(now + timedelta(seconds=2), hours=0))
        inspect = Mock(side_effect=[before, before, after])
        recover = Mock()
        self.assertEqual(monitor(False, inspect, recover, lambda _: None)["status"], "recovered")
        recover.assert_called_once()

    def test_timeout_does_not_submit_a_second_recovery(self):
        now = datetime.now(timezone.utc)
        before = observation(health(now, "failed", 2), ["failed"], True)
        after = observation(health(now + timedelta(seconds=2), hours=0))
        recover = Mock(side_effect=TimeoutError)
        self.assertTrue(monitor(False, Mock(side_effect=[before, before, after]), recover, lambda _: None)["repaired"])
        recover.assert_called_once()

    def test_no_data_progress_never_claims_recovery(self):
        now = datetime.now(timezone.utc)
        before = observation(health(now, "failed", 2), ["failed"], True)
        data = health(now + timedelta(seconds=2), hours=0)
        data["content_freshness"] = copy.deepcopy(before["health"]["content_freshness"])
        after = observation(data)
        recover = Mock()
        with self.assertRaisesRegex(RuntimeError, "not verified"):
            monitor(False, Mock(side_effect=[before, before, after, after, after, after]), recover, lambda _: None)
        recover.assert_called_once()


if __name__ == "__main__":
    unittest.main()
