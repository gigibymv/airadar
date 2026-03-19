import { type ExecutiveBriefing } from "@/hooks/useExecutiveBriefing";
import { BriefingCard } from "@/features/briefing/BriefingCard";

interface AfricaSectionProps {
  briefing: ExecutiveBriefing | null;
  isBookmarked: (id: string) => boolean;
  onToggleBookmark: (item: {
    id: string;
    category: "news";
    title: string;
    url: string;
    source: string;
    data: unknown;
  }) => void;
}

export function AfricaSection({
  briefing,
  isBookmarked,
  onToggleBookmark,
}: AfricaSectionProps) {
  if (briefing?.africa_no_update) {
    return (
      <p className="text-[13px] text-muted-foreground italic py-12 text-center">
        No new AI developments in Africa today. Check back tomorrow.
      </p>
    );
  }

  if (!briefing?.africa_items || briefing.africa_items.length === 0) {
    return (
      <p className="text-[13px] text-muted-foreground italic py-12 text-center">
        No Africa briefing yet. Hit refresh to generate today's brief.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {briefing.africa_items.map((item, i) => {
        const itemId = `briefing-africa-${i}`;
        return (
          <BriefingCard
            key={i}
            item={item}
            index={i}
            isBookmarked={isBookmarked(itemId)}
            onToggleBookmark={() =>
              onToggleBookmark({
                id: itemId,
                category: "news",
                title: item.title,
                url: item.source_urls[0] || "#",
                source: "Daily Brief",
                data: item,
              })
            }
          />
        );
      })}
    </div>
  );
}
