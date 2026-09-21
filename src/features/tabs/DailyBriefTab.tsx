import { ExecutiveSummary } from "@/components/ExecutiveSummary";

export function DailyBriefTab({ showBookmarkControls = true }: { showBookmarkControls?: boolean }) {
  return <ExecutiveSummary showBookmarkControls={showBookmarkControls} />;
}
