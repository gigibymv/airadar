import { type ExecutiveBriefing } from "@/hooks/useExecutiveBriefing";
import { BriefingCard } from "@/features/briefing/BriefingCard";

interface ExecutiveBriefingSectionProps {
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

export function ExecutiveBriefingSection({
  briefing,
  isBookmarked,
  onToggleBookmark,
}: ExecutiveBriefingSectionProps) {
  return (
    <>
      <div>
        <div className="flex items-center gap-4 mb-6">
          <h3 className="font-display text-[22px] sm:text-[26px] font-normal text-foreground italic shrink-0">
            Global AI
          </h3>
          <div className="flex-1 h-px bg-border" />
        </div>

        {briefing?.global_items && briefing.global_items.length > 0 ? (
          <div className="space-y-8">
            {briefing.global_items.map((item, i) => {
              const itemId = `briefing-global-${i}`;
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
        ) : (
          <p className="text-[13px] text-muted-foreground italic py-12 text-center">
            No briefing yet. Hit refresh to generate today's executive briefing.
          </p>
        )}
      </div>

      {briefing?.signals_to_watch && briefing.signals_to_watch.length > 0 && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <h3 className="font-display text-[22px] sm:text-[26px] font-normal text-foreground italic shrink-0">
              Signal to Watch
            </h3>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="border-l-2 border-primary pl-4 space-y-2">
            {briefing.signals_to_watch.map((signal, i) => (
              <p key={i} className="text-[14px] leading-[1.7] text-foreground/80">
                • {signal}
              </p>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
