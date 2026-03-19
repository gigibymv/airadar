import { useState } from "react";
import { ArrowUp, MessageSquare, Star, ArrowRight, Bookmark } from "lucide-react";
import { type CommunityPost } from "@/data/newsData";

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function clip(value: string, max: number) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trim()}…`;
}

function stripGithubInlineMeta(description: string) {
  const normalized = cleanText(description);
  if (!normalized) return "";
  return cleanText(
    normalized
    .replace(/\bRepo:\s*[^.?!]+[.?!]?/gi, " ")
    .replace(/\bLanguage:\s*[^.?!]+[.?!]?/gi, " ")
    .replace(/\bStars:\s*[^.?!]+[.?!]?/gi, " ")
    .replace(/\bForks:\s*[^.?!]+[.?!]?/gi, " ")
    .replace(/\bOpen issues:\s*[^.?!]+[.?!]?/gi, " ")
  );
}

function extractGithubWhatItDoes(description: string) {
  const withoutInlineMeta = stripGithubInlineMeta(description);
  if (!withoutInlineMeta) return "";

  const segments = withoutInlineMeta
    .split(/(?<=[.!?])\s+/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  const firstUseful = segments.find((segment) => {
    const lower = segment.toLowerCase();
    return (
      !lower.startsWith("repo:") &&
      !lower.startsWith("language:") &&
      !lower.startsWith("stars:") &&
      !lower.startsWith("forks:") &&
      !lower.startsWith("open issues:")
    );
  });

  return firstUseful || segments[0] || "";
}

function getGithubDisplayDescription(post: CommunityPost) {
  const cleaned = stripGithubInlineMeta(post.description);
  if (!cleaned) return post.description;
  if (cleaned.length >= 90) return clip(cleaned, 320);

  const repo = cleanText(post.repo || "this repository");
  return clip(
    `${cleaned} This project provides practical implementation details, code examples, and setup guidance in ${repo}.`,
    320
  );
}

function inferGithubPainPoint(text: string) {
  const normalized = text.toLowerCase();
  if (/\b(rag|retrieval|vector|embedding|knowledge)\b/.test(normalized)) {
    return "Grounds AI responses in internal knowledge instead of generic answers.";
  }
  if (/\b(agent|multi-agent|orchestrat|workflow|automation)\b/.test(normalized)) {
    return "Automates multi-step tasks across tools and APIs.";
  }
  if (/\b(eval|evaluation|benchmark|testing|guardrail|safety)\b/.test(normalized)) {
    return "Adds repeatable quality and safety checks before release.";
  }
  if (/\bchat|copilot|assistant|ui|frontend|sdk\b/.test(normalized)) {
    return "Ships a user-facing AI assistant directly in your product.";
  }
  if (/\b(vision|image|video|ocr|multimodal)\b/.test(normalized)) {
    return "Processes visual inputs alongside text workflows.";
  }
  return "Provides a faster implementation path than building AI foundations from scratch.";
}

function isGenericGithubHelp(help: string) {
  const normalized = cleanText(help).toLowerCase();
  if (!normalized) return true;
  if (normalized.length < 55) return true;
  return (
    normalized.includes("useful for teams tracking practical ai/agent tooling") ||
    normalized.includes("practical value") ||
    normalized.includes("what problem it solves and who benefits") ||
    normalized.includes("best for teams adopting practical open-source ai building blocks")
  );
}

function getGithubDisplayHelp(post: CommunityPost) {
  const existing = cleanText(post.howItHelps || "");
  if (!isGenericGithubHelp(existing)) return clip(existing, 300);

  const description = stripGithubInlineMeta(post.description);
  const valueLine = inferGithubPainPoint(`${description} ${post.repo || ""}`);
  const repoHint = post.repo
    ? `Start with ${cleanText(post.repo)} and adapt modules to your stack.`
    : "Use it as a reference implementation and adapt to your stack.";
  return clip(`${valueLine} ${repoHint}`, 300);
}

function looksLikeRepoOnlyTitle(title: string, repo?: string) {
  const normalizedTitle = cleanText(title).toLowerCase();
  const normalizedRepo = cleanText(repo || "").toLowerCase();
  if (!normalizedTitle) return true;
  if (!normalizedRepo) return false;

  return (
    normalizedTitle === normalizedRepo ||
    normalizedTitle.startsWith(`${normalizedRepo} (`) ||
    normalizedTitle === normalizedRepo.split("/").pop()
  );
}

function getGithubDisplayTitle(post: CommunityPost) {
  const fallbackTitle = cleanText(post.title);
  const repo = cleanText(post.repo || "");
  const whatItDoes = extractGithubWhatItDoes(post.description);

  if (!looksLikeRepoOnlyTitle(fallbackTitle, repo)) return fallbackTitle;
  if (!repo) return fallbackTitle;
  if (!whatItDoes) return fallbackTitle;

  return clip(`${repo} - ${whatItDoes}`, 120);
}

export function CommunityCard({ post, index, isBookmarked, onToggleBookmark }: { post: CommunityPost; index: number; isBookmarked?: boolean; onToggleBookmark?: () => void }) {
  const [expanded, setExpanded] = useState(true);
  const isGitHub = post.source === "github";
  const displayTitle = isGitHub ? getGithubDisplayTitle(post) : post.title;
  const displayDescription = isGitHub ? getGithubDisplayDescription(post) : post.description;
  const displayHelp = isGitHub ? getGithubDisplayHelp(post) : post.howItHelps;

  return (
    <article
      className="border-t border-border pt-4 opacity-0 animate-fade-in cursor-pointer"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
        <span className="font-semibold text-primary uppercase tracking-[0.1em]">
          {post.source === "github" ? "GitHub" : "Reddit"}
        </span>
        <span>·</span>
        <span>{post.source === "github" ? post.repo : post.subreddit}</span>
        <span>·</span>
        <span>{post.timeAgo}</span>
      </div>

      <h4 className="font-display text-[18px] sm:text-[20px] font-bold leading-[1.2] tracking-tight text-foreground mb-3">
        {displayTitle}
      </h4>

      <p className="text-[13px] leading-[1.7] text-muted-foreground mb-3">
        {displayDescription}
      </p>

      {expanded && (
        <div className="border-l-2 border-takeaway pl-3 py-1 mb-3 animate-fade-in">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] mb-1 text-takeaway">
            How This Helps You
          </p>
          <p className="text-[12px] leading-[1.6] text-foreground/80">
            {displayHelp}
          </p>
        </div>
      )}

      <div className="flex items-start sm:items-center justify-between gap-3 pt-3 border-t border-border">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap min-w-0">
          <span className="font-semibold text-foreground">{post.author}</span>
          <span className="flex items-center gap-1 font-semibold">
            {isGitHub ? <Star className="h-3 w-3 text-primary" /> : <ArrowUp className="h-3 w-3 text-primary" />}
            {isGitHub ? post.stars?.toLocaleString() : post.upvotes?.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />{post.comments}
          </span>
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
          <span className="text-[11px] font-semibold text-takeaway">{expanded ? "collapse" : "Takeaways"}</span>
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
