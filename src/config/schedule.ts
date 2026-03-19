/** Cron schedule for the daily feed refresh (pg_cron syntax, UTC). */
export const REFRESH_CRON = "0 12 * * *";

/** Human-readable label shown in the UI. Matches REFRESH_CRON (12:00 UTC = 7 AM ET). */
export const REFRESH_SCHEDULE_LABEL = "Updated daily at 7 AM ET";
