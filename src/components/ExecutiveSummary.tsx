import { useState } from "react";
import { useExecutiveBriefing } from "@/hooks/useExecutiveBriefing";
import { useBookmarks } from "@/hooks/useBookmarks";
import { ExecutiveBriefingSection } from "@/features/briefing/ExecutiveBriefingSection";
import { TldrSection } from "@/features/briefing/TldrSection";
import { AfricaSection } from "@/features/briefing/AfricaSection";
import { format } from "date-fns";
import { REFRESH_SCHEDULE_LABEL } from "@/config/schedule";

type BriefTab = "briefing" | "tldr" | "africa";

export function ExecutiveSummary() {
  const [activeSubTab, setActiveSubTab] = useState<BriefTab>("briefing");
  const { data: briefing } = useExecutiveBriefing();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const subTabs: { key: BriefTab; label: string }[] = [
    { key: "briefing", label: "Executive Briefing" },
    { key: "tldr", label: "TLDR AI" },
    { key: "africa", label: "Africa" },
  ];

  return (
    <div className="space-y-8 sm:space-y-10">
      <div>
        <p className="text-[12px] text-muted-foreground mb-1">{format(new Date(), "MMMM d, yyyy")} · {REFRESH_SCHEDULE_LABEL}</p>
        <h2 className="font-display text-[28px] sm:text-[36px] font-bold tracking-tight text-foreground leading-[1.1]">
          Daily Brief
        </h2>
      </div>

      <div className="flex gap-4 border-b border-border -mb-4 overflow-x-auto no-scrollbar">
        {subTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSubTab(tab.key)}
            className={`pb-3 text-[13px] font-display font-semibold transition-colors whitespace-nowrap -mb-px ${
              activeSubTab === tab.key
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === "briefing" && (
        <ExecutiveBriefingSection
          briefing={briefing}
          isBookmarked={isBookmarked}
          onToggleBookmark={toggleBookmark}
        />
      )}

      {activeSubTab === "tldr" && <TldrSection />}

      {activeSubTab === "africa" && (
        <AfricaSection
          briefing={briefing}
          isBookmarked={isBookmarked}
          onToggleBookmark={toggleBookmark}
        />
      )}
    </div>
  );
}
