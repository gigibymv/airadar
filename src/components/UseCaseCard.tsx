import { useState } from "react";
import { ArrowUp, Star, Heart, ArrowRight, Zap, Wrench, Bookmark, Lightbulb, ListChecks } from "lucide-react";
import { type UseCasePost, USE_CASE_CATEGORY_LABELS } from "@/data/useCaseData";

function sourceLabel(source: string) {
  if (source === "reddit") return "Reddit";
  if (source === "linkedin") return "LinkedIn";
  return "GitHub";
}

function sourceSub(post: UseCasePost) {
  if (post.source === "reddit") return post.subreddit;
  if (post.source === "linkedin") return post.profileTitle;
  return post.repo;
}

function engagementInfo(post: UseCasePost) {
  if (post.source === "reddit") return { icon: <ArrowUp className="h-3 w-3 text-primary" />, count: post.upvotes?.toLocaleString() };
  if (post.source === "linkedin") return { icon: <Heart className="h-3 w-3 text-primary" />, count: post.likes?.toLocaleString() };
  return { icon: <Star className="h-3 w-3 text-primary" />, count: post.stars?.toLocaleString() };
}

export function UseCaseCard({ post, index, isBookmarked, onToggleBookmark }: { post: UseCasePost; index: number; isBookmarked?: boolean; onToggleBookmark?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const engagement = engagementInfo(post);

  return (
    <article
      className="border-t border-border pt-4 opacity-0 animate-fade-in cursor-pointer"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
        <span>{post.timeAgo}</span>
        <span>·</span>
        <span className="uppercase tracking-[0.08em]">
          {USE_CASE_CATEGORY_LABELS[post.category]}
        </span>
        {post.isHighlighted && typeof post.highlightedRank === "number" && (
          <>
            <span>·</span>
            <span className="font-semibold text-takeaway uppercase tracking-[0.08em]">
              Highlight #{post.highlightedRank}
            </span>
          </>
        )}
      </div>

      <h4 className="font-display text-[18px] sm:text-[20px] font-bold leading-[1.2] tracking-tight text-foreground mb-3">
        {post.title}
      </h4>

      {/* Expanded details */}
      {expanded && (
        <div className="space-y-3 mb-3 animate-fade-in">
          {/* Takeaways */}
          <div className="border-l-2 border-takeaway pl-3 py-1">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="h-3.5 w-3.5 text-takeaway" />
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-takeaway">Takeaways</p>
            </div>
            <p className="text-[13px] leading-[1.6] font-medium text-foreground/80">
              {post.productivityGain}
            </p>
          </div>

          {/* How It Helps You */}
          {post.howItHelpsYou && (
            <div className="border-l-2 border-accent pl-3 py-1">
              <div className="flex items-center gap-1.5 mb-1">
                <Lightbulb className="h-3.5 w-3.5 text-accent-foreground" />
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-accent-foreground">How This Helps You</p>
              </div>
              <p className="text-[13px] leading-[1.7] text-foreground/80">
                {post.howItHelpsYou}
              </p>
            </div>
          )}

          {/* Implementation Steps */}
          {post.implementationSteps && post.implementationSteps.length > 0 && (
            <div className="border-l-2 border-border pl-3 py-1">
              <div className="flex items-center gap-1.5 mb-1">
                <ListChecks className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">How to Replicate</p>
              </div>
              <ol className="space-y-1">
                {post.implementationSteps.map((step, i) => (
                  <li key={i} className="text-[13px] leading-[1.6] text-foreground/80">
                    <span className="text-takeaway font-semibold mr-1.5">{i + 1}.</span>{step}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      <p className="text-[13px] leading-[1.7] text-muted-foreground mb-3">
        {post.summary}
      </p>

      {/* Tools */}
      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        <Wrench className="h-3 w-3 text-muted-foreground shrink-0" />
        {post.toolsUsed.map((tool, i) => (
          <span key={tool} className="text-[10px] text-muted-foreground">
            {tool}{i < post.toolsUsed.length - 1 ? " ·" : ""}
          </span>
        ))}
      </div>

      <div className="flex items-start sm:items-center justify-between gap-3 pt-3 border-t border-border">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap min-w-0">
          <span className="font-semibold text-foreground">{post.author}</span>
          <span className="flex items-center gap-1 font-semibold">{engagement.icon}{engagement.count}</span>
          <span className="text-[11px] font-semibold text-takeaway">{expanded ? "collapse" : "Takeaways"}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {onToggleBookmark && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleBookmark(); }}
              className="p-1 text-muted-foreground hover:text-primary transition-colors"
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark"}
            >
              <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? "fill-primary text-primary" : ""}`} />
            </button>
          )}
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-foreground hover:text-primary transition-colors"
          >
            read more
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}
