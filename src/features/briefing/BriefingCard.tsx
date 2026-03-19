import { useState } from "react";
import { ExternalLink, ArrowRight, Bookmark } from "lucide-react";
import { type BriefingItem } from "@/hooks/useExecutiveBriefing";

function parseIntoBullets(text: string): string[] {
  const parts = text
    .split(/(?:•|—|\n|(?<=\.)\s+(?=[A-Z]))/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 1 ? parts : [text];
}

interface BriefingCardProps {
  item: BriefingItem;
  index: number;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

export function BriefingCard({
  item,
  index,
  isBookmarked,
  onToggleBookmark,
}: BriefingCardProps) {
  const [showImplications, setShowImplications] = useState(false);
  const bullets = parseIntoBullets(item.strategic_implications);

  return (
    <article
      className="border-t border-border pt-6 opacity-0 animate-fade-in cursor-pointer"
      style={{ animationDelay: `${index * 80}ms` }}
      onClick={() => setShowImplications(!showImplications)}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="text-[24px] sm:text-[32px] font-display font-normal italic leading-none text-foreground/15 select-none shrink-0">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="font-display text-[18px] sm:text-[20px] font-bold leading-[1.2] tracking-tight text-foreground">
            {item.title}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 ml-9 sm:ml-11">
          {item.earliest_source_date && (
            <span className="text-[11px] text-muted-foreground">
              {item.earliest_source_date}
            </span>
          )}
          {(() => {
            const seen = new Set<string>();
            const unique: { source: string; url: string }[] = [];
            item.sources.forEach((source, i) => {
              const url = item.source_urls[i] || "";
              const key = url || source;
              if (!seen.has(key)) {
                seen.add(key);
                unique.push({ source, url });
              }
            });
            return unique.slice(0, 3).map((s, i) => (
              <a
                key={i}
                href={s.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
              >
                {s.source}
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            ));
          })()}
        </div>

        <div className="ml-9 sm:ml-11 space-y-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">
              Summary
            </p>
            <p className="text-[14px] leading-[1.7] text-foreground/90">{item.summary}</p>
          </div>

          {item.concept_explained && (
            <div className="border-l-2 border-accent pl-3 py-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-foreground mb-1">
                Concept Explained
              </p>
              <p className="text-[14px] leading-[1.7] text-foreground/80">
                {item.concept_explained}
              </p>
            </div>
          )}

          {showImplications && (
            <div className="border-l-2 border-takeaway pl-3 py-1 animate-fade-in">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] mb-2 text-takeaway">
                Takeaways
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1">
                    Strategic Implications
                  </p>
                  <ul className="space-y-1.5">
                    {bullets.map((bullet, i) => (
                      <li
                        key={i}
                        className="text-[14px] leading-[1.7] text-foreground/80 flex items-start gap-2"
                      >
                        <span className="text-takeaway mt-[3px] shrink-0">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1">
                    Why It Matters Now
                  </p>
                  <p className="text-[14px] leading-[1.7] text-foreground font-medium">
                    {item.why_it_matters_now}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between ml-9 sm:ml-11 pt-3 border-t border-border">
          <span className="text-[11px] font-semibold text-takeaway">
            {showImplications ? "collapse" : "Takeaways"}
          </span>
          <div className="flex items-center gap-3">
            {onToggleBookmark && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark();
                }}
                className="p-1 text-muted-foreground hover:text-primary transition-colors"
                aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
              >
                <Bookmark
                  className={`h-3.5 w-3.5 ${isBookmarked ? "fill-primary text-primary" : ""}`}
                />
              </button>
            )}
            {item.source_urls[0] && (
              <a
                href={item.source_urls[0]}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-foreground hover:text-primary transition-colors"
              >
                read more
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
