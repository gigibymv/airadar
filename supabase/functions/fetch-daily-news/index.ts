import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.1";
import { normalizeTitle, isSimilarTitle, deduplicateBatch } from "./dedup.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const NEWS_API_KEY = Deno.env.get("NEWS_API_KEY");
const GITHUB_API_KEY = Deno.env.get("GITHUB_API_KEY") ?? Deno.env.get("GITHUB_TOKEN");
const BRAVE_SEARCH_API_KEY =
  Deno.env.get("BRAVE_SEARCH_API_KEY") ?? Deno.env.get("BRAVE_API_KEY");

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function normalizeUseCaseType(value: unknown): "person" | "company" {
  if (typeof value !== "string") return "person";
  const normalized = value.trim().toLowerCase();

  if (
    normalized === "company" ||
    normalized === "organization" ||
    normalized === "org" ||
    normalized === "enterprise" ||
    normalized === "business" ||
    normalized === "team"
  ) {
    return "company";
  }

  return "person";
}

function hasFirstPersonSignal(text: string): boolean {
  return /\b(i|my|me|we|our)\b/i.test(text);
}

function looksOrganizationLike(author: unknown, text: string): boolean {
  const authorText = typeof author === "string" ? author : "";
  const combined = `${authorText} ${text}`.toLowerCase();
  return /\b(inc|corp|llc|ltd|company|startup|enterprise|team|official|press|ai labs?)\b/.test(combined);
}

function classifyUseCaseType(input: {
  type: unknown;
  title?: unknown;
  summary?: unknown;
  author?: unknown;
  source?: unknown;
}): "person" | "company" {
  const base = normalizeUseCaseType(input.type);
  const title = typeof input.title === "string" ? input.title : "";
  const summary = typeof input.summary === "string" ? input.summary : "";
  const source = typeof input.source === "string" ? input.source.toLowerCase() : "";
  const combined = `${title} ${summary}`;
  const firstPerson = hasFirstPersonSignal(combined);
  const orgLike = looksOrganizationLike(input.author, combined);

  if (base === "person") {
    // Person use cases must read like an individual's workflow, not company press.
    if (!firstPerson || orgLike) return "company";
    return "person";
  }

  // Allow explicit first-person workflows from user-centric sources to be classified as person.
  if ((source === "reddit" || source === "linkedin" || source === "github") && firstPerson && !orgLike) {
    return "person";
  }

  return "company";
}

function normalizeUseCaseCategory(value: unknown): string {
  if (typeof value !== "string") return "productivity";
  const normalized = value.trim().toLowerCase().replace(/[_\s]+/g, "-");
  if (!normalized) return "productivity";

  if (normalized === "healthcare" || normalized === "health-care") return "healthcare";
  if (normalized === "finance" || normalized === "financial") return "finance";
  if (normalized === "marketing" || normalized === "growth") return "marketing";
  if (normalized === "customer-support" || normalized === "support" || normalized === "customer-service") {
    return "customer-support";
  }
  if (normalized === "operations" || normalized === "ops") return "operations";
  if (normalized === "engineering" || normalized === "software-engineering") return "engineering";
  if (normalized === "education" || normalized === "edtech") return "education";
  if (normalized === "legal" || normalized === "compliance") return "legal";
  if (normalized === "hr" || normalized === "human-resources" || normalized === "recruiting") return "hr";
  if (normalized === "other") return "other";
  return "productivity";
}

// ── Regional Tech RSS Feeds ───────────────────────────────────────────

type BriefingRegion = "africa" | "se-asia" | "europe" | "latam" | "middle-east";

const VALID_REGIONS: readonly BriefingRegion[] = ["africa", "se-asia", "europe", "latam", "middle-east"];

function isValidRegion(value: unknown): value is BriefingRegion {
  return VALID_REGIONS.includes(value as BriefingRegion);
}

const REGION_LABELS: Record<BriefingRegion, string> = {
  "africa": "Africa",
  "se-asia": "SE Asia",
  "europe": "Europe",
  "latam": "LATAM",
  "middle-east": "Middle East",
};

const AFRICA_RSS_FEEDS = [
  { name: "TechCabal", url: "https://techcabal.com/feed/" },
  { name: "Disrupt Africa", url: "https://disrupt-africa.com/feed/" },
  { name: "TechPoint Africa", url: "https://techpoint.africa/feed/" },
  { name: "IT News Africa", url: "https://itnewsafrica.com/feed/" },
  { name: "Ventureburn", url: "https://ventureburn.com/feed/" },
  { name: "CIO East Africa", url: "https://www.cioafrica.co/feed/" },
  { name: "Techloy", url: "https://techloy.com/feed/" },
  { name: "Benjamins Dada", url: "https://www.benjamindada.com/rss/" },
];

const REGION_RSS_FEEDS: Record<BriefingRegion, { name: string; url: string }[]> = {
  "africa": AFRICA_RSS_FEEDS,
  "se-asia": [
    { name: "KrASIA", url: "https://kr.asia/feed" },
    { name: "Tech in Asia", url: "https://www.techinasia.com/feed" },
    { name: "e27", url: "https://e27.co/feed/" },
  ],
  "europe": [
    { name: "Sifted", url: "https://sifted.eu/articles/feed/" },
    { name: "The Next Web", url: "https://thenextweb.com/feed/" },
  ],
  "latam": [
    { name: "Contxto", url: "https://contxto.com/en/feed/" },
  ],
  "middle-east": [
    { name: "Wamda", url: "https://www.wamda.com/feed" },
    { name: "Magnitt", url: "https://magnitt.com/news/feed" },
  ],
};

interface RSSArticle {
  title: string;
  url: string;
  publishedAt: string;
  description: string;
  source: { name: string };
}

interface CandidateArticle {
  title: string;
  url: string;
  publishedAt: string;
  description: string;
  source: { name: string };
  repo?: string;
  author?: string;
  stars?: number;
  subreddit?: string;
}

const MIN_GITHUB_COMMUNITY_PER_RUN = 3;
const MIN_REDDIT_COMMUNITY_PER_RUN = 3;

const AI_KEYWORDS = /\b(artificial intelligence|AI|machine learning|ML|deep learning|neural network|LLM|GPT|generative ai|NLP|natural language processing|computer vision|transformer|diffusion model|reinforcement learning|chatbot|copilot|foundation model|fine.?tun|AI model|AI startup|AI regulation|AI policy|AI infrastructure|data center|compute|GPU|AI research|AI talent|AI adoption|AI ethics)\b/i;

function cleanText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim();
}

function clipText(value: string, max = 180): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trim()}…`;
}

function repoFromGithubUrl(url: unknown): string | null {
  if (typeof url !== "string") return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "github.com") return null;
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return `${parts[0]}/${parts[1]}`;
  } catch {
    return null;
  }
}

function extractGithubCoreDescription(description: unknown): string {
  const normalized = cleanText(description);
  if (!normalized) return "";
  const withoutInlineMeta = normalized
    .replace(/\bRepo:\s*[^.?!]+[.?!]?/gi, " ")
    .replace(/\bLanguage:\s*[^.?!]+[.?!]?/gi, " ")
    .replace(/\bStars:\s*[^.?!]+[.?!]?/gi, " ")
    .replace(/\bForks:\s*[^.?!]+[.?!]?/gi, " ")
    .replace(/\bOpen issues:\s*[^.?!]+[.?!]?/gi, " ");
  const parts = cleanText(withoutInlineMeta)
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const useful = parts.find((part) => {
    const lower = part.toLowerCase();
    return (
      !lower.startsWith("repo:") &&
      !lower.startsWith("language:") &&
      !lower.startsWith("stars:") &&
      !lower.startsWith("forks:") &&
      !lower.startsWith("open issues:")
    );
  });

  return useful || parts[0] || "";
}

function titleLooksRepoOnly(title: unknown, repo: string | null): boolean {
  const normalizedTitle = cleanText(title).toLowerCase();
  const normalizedRepo = cleanText(repo).toLowerCase();
  if (!normalizedTitle) return true;
  if (!normalizedRepo) return false;

  const repoName = normalizedRepo.split("/").pop() || normalizedRepo;
  return (
    normalizedTitle === normalizedRepo ||
    normalizedTitle === repoName ||
    normalizedTitle.startsWith(`${normalizedRepo} (`)
  );
}

function isGenericGithubHelp(help: string): boolean {
  const normalized = cleanText(help).toLowerCase();
  if (!normalized) return true;
  if (normalized.length < 55) return true;
  // Catch previously hardcoded heuristic phrases and other known generic patterns
  return (
    normalized.startsWith("best for teams") ||
    normalized.startsWith("useful for teams tracking") ||
    normalized.includes("useful for teams tracking practical ai/agent tooling") ||
    normalized.includes("practical value") ||
    normalized.includes("what problem it solves and who benefits") ||
    normalized.includes("best for teams adopting practical open-source ai building blocks") ||
    normalized.includes("faster implementation path than building ai foundations")
  );
}

function buildGithubHowItHelps(repo: string | null, description: string, language: string | null, existingHelp: string): string {
  if (!isGenericGithubHelp(existingHelp)) {
    return clipText(existingHelp, 320);
  }

  // Use the short repo name (e.g. "owner/repo" → "repo") as the subject
  const repoShort = repo
    ? (repo.includes("/") ? repo.split("/")[1] : repo).replace(/-/g, " ")
    : null;
  const subject = repoShort ? repoShort.charAt(0).toUpperCase() + repoShort.slice(1) : null;

  // Extract the most descriptive sentence from the description
  const sentences = description
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30 && s.length < 180);
  const coreSentence = sentences[0] || description.slice(0, 120);

  const text = `${repo || ""} ${description}`.toLowerCase();
  const lang = (language || "").toLowerCase();

  let who: string;
  let outcome: string;
  let hint: string;

  if (/\b(rag|retrieval|vector|embedding|knowledge)\b/.test(text)) {
    who = "ML and backend teams building knowledge-grounded assistants";
    outcome = "replaces generic model output with responses cited from your own docs or data.";
    hint = repo ? `Drop ${subject || repo} into your pipeline and connect your vector store.` : "Connect your vector store and deploy as a retrieval layer.";
  } else if (/\b(agent|multi-agent|orchestrat|workflow)\b/.test(text)) {
    who = "engineering teams automating multi-step AI workflows";
    outcome = "handles tool calling, state management, and agent coordination so you don't build that plumbing yourself.";
    hint = repo ? `Use ${subject || repo} as the orchestration layer and wire in your own tools and APIs.` : "Wire your own tools and APIs into the orchestration layer.";
  } else if (/\b(eval|evaluation|benchmark|testing|guardrail|safety)\b/.test(text)) {
    who = "teams shipping AI features to production";
    outcome = "gives you repeatable quality and safety checks before each release, replacing ad-hoc manual spot-checks.";
    hint = repo ? `Integrate ${subject || repo} into your CI pipeline to catch regressions automatically.` : "Integrate into your CI pipeline to catch regressions automatically.";
  } else if (/\b(fine.?tun|train|lora|qlora|finetun)\b/.test(text)) {
    who = "teams adapting foundation models to specific domains or tasks";
    outcome = "reduces compute cost and time to adapt a base model compared to full retraining.";
    hint = repo ? `Start with ${subject || repo} and supply your own dataset for domain-specific tuning.` : "Supply your own dataset and run targeted fine-tuning.";
  } else if (/\bchat|copilot|assistant|ui|frontend|sdk\b/.test(text)) {
    who = "product and frontend teams";
    outcome = "cuts the time to ship a user-facing AI assistant from weeks to days.";
    hint = repo ? `Use ${subject || repo} as your UI layer and plug in your preferred model and backend.` : "Plug in your preferred model and backend to get a working UI fast.";
  } else if (/\b(vision|image|video|ocr|multimodal)\b/.test(text)) {
    who = "teams processing visual data alongside text";
    outcome = "adds image, video, or document understanding to your existing AI workflows without a custom model stack.";
    hint = repo ? `Use ${subject || repo} to handle the multimodal input layer in your pipeline.` : "Drop it in as the multimodal input layer in your pipeline.";
  } else if (/\b(deploy|infra|serving|inference|api.*gateway|proxy)\b/.test(text)) {
    who = "platform and MLOps teams";
    outcome = "simplifies model serving, routing, and scaling without vendor lock-in.";
    hint = repo ? `Deploy ${subject || repo} in front of your model endpoints to manage traffic and costs.` : "Deploy in front of your model endpoints to manage traffic and costs.";
  } else if (lang === "python") {
    who = "Python ML and backend teams";
    outcome = "provides a reusable, well-tested foundation so you're not writing boilerplate AI glue code from scratch.";
    hint = repo ? `Install ${subject || repo} and extend with your own logic.` : "Install and extend with your own logic.";
  } else if (lang === "typescript" || lang === "javascript") {
    who = "TypeScript and JavaScript teams";
    outcome = "integrates AI capabilities directly into your existing Node or browser stack without a Python dependency.";
    hint = repo ? `Add ${subject || repo} to your project and call its API from your existing app code.` : "Add it to your project and call its API from your existing app code.";
  } else {
    who = "teams looking for a production-ready AI component";
    outcome = "saves implementation time by providing a tested, maintained building block instead of a from-scratch build.";
    hint = repo ? `Start with ${subject || repo} and adapt it to your stack.` : "Fork and adapt to your stack.";
  }

  const lead = subject
    ? `${subject} is useful for ${who} — ${coreSentence.replace(/\.$/, "").toLowerCase()}.`
    : `Useful for ${who} — ${coreSentence.replace(/\.$/, "").toLowerCase()}.`;

  return clipText(`${lead} It ${outcome} ${hint}`, 340);
}

function formatGithubCommunityEntry(entry: any): any {
  const repo = cleanText(entry.repo) || repoFromGithubUrl(entry.url);
  const coreDescription =
    extractGithubCoreDescription(entry.description) ||
    "Open-source AI project with practical implementation value.";
  const languageMatch = cleanText(entry.description).match(/\blanguage:\s*([a-z0-9+#.\-]+)/i);
  const language = languageMatch?.[1] || null;
  const normalizedTitle = cleanText(entry.title);
  // Trust the AI-generated title if it looks like a real headline (not just the repo path).
  // Only fall back to repo-based title construction when the AI returned a bare repo path.
  const title = titleLooksRepoOnly(normalizedTitle, repo)
    ? clipText(`${repo || "GitHub project"} — ${coreDescription}`, 140)
    : clipText(normalizedTitle, 140);
  const existingHelp = cleanText(entry.how_it_helps);
  const howItHelps = buildGithubHowItHelps(repo, coreDescription, language, existingHelp);

  return {
    ...entry,
    source: "github",
    repo: repo || null,
    title,
    description: clipText(cleanText(entry.description) || coreDescription, 320),
    how_it_helps: howItHelps,
  };
}

function formatRedditCommunityEntry(candidate: CandidateArticle): any {
  const subreddit = candidate.subreddit || "r/artificial";
  const title = clipText(cleanText(candidate.title), 140);
  const selftext = cleanText(candidate.description || "");
  const description = selftext.length > 80
    ? clipText(selftext, 320)
    : clipText(`${title} — community discussion in ${subreddit} covering practical AI/ML insights, developer experiences, and emerging patterns.`, 320);

  const subredditHelpMap: Record<string, string> = {
    "r/MachineLearning": "Useful for researchers and engineers tracking cutting-edge ML papers, experiments, and technical debates from the ML community.",
    "r/LocalLLaMA": "Useful for engineers running local LLMs — covers hardware setups, quantization tips, model comparisons, and open-source deployments.",
    "r/artificial": "Useful for practitioners monitoring broad AI trends, policy discussions, and community sentiment around emerging AI developments.",
    "r/ChatGPT": "Useful for product teams and developers tracking real-world prompting techniques, use cases, and user experiences with frontier models.",
  };

  const howItHelps = subredditHelpMap[subreddit] ||
    `Useful for practitioners following community discussions around AI tools, techniques, and industry developments in ${subreddit}.`;

  return {
    title,
    source: "reddit",
    subreddit,
    repo: null,
    description,
    how_it_helps: howItHelps,
    author: candidate.author || "Anonymous",
    url: candidate.url,
    upvotes: null,
    stars: null,
    comments: 0,
  };
}

function isAIRelevant(title: string, description: string): boolean {
  return AI_KEYWORDS.test(title) || AI_KEYWORDS.test(description);
}

function extractRSSItems(xml: string, sourceName: string): RSSArticle[] {
  const items: RSSArticle[] = [];
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1] || block.match(/<title>(.*?)<\/title>/)?.[1] || "";
    const link = block.match(/<link>(.*?)<\/link>/)?.[1] || "";
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
    const desc = block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]>/)?.[1] ||
                 block.match(/<description>([\s\S]*?)<\/description>/)?.[1] || "";
    const cleanDesc = desc.replace(/<[^>]*>/g, "").trim().substring(0, 400);

    if (!title || !link) continue;
    if (pubDate) {
      const articleDate = new Date(pubDate);
      if (articleDate < twoDaysAgo) continue;
    }
    // Pre-filter: only keep AI/ML-relevant articles
    if (!isAIRelevant(title, cleanDesc)) continue;

    items.push({
      title: title.trim(),
      url: link.trim(),
      publishedAt: pubDate ? new Date(pubDate).toISOString() : now.toISOString(),
      description: cleanDesc,
      source: { name: sourceName },
    });
  }

  // Also try Atom <entry> format
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  while ((match = entryRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = block.match(/<title[^>]*>(.*?)<\/title>/)?.[1] || "";
    const link = block.match(/<link[^>]*href="(.*?)"/)?.[1] || "";
    const pubDate = block.match(/<published>(.*?)<\/published>/)?.[1] ||
                    block.match(/<updated>(.*?)<\/updated>/)?.[1] || "";
    const desc = block.match(/<summary[^>]*>([\s\S]*?)<\/summary>/)?.[1] ||
                 block.match(/<content[^>]*>([\s\S]*?)<\/content>/)?.[1] || "";
    const cleanDesc = desc.replace(/<[^>]*>/g, "").replace(/<!\[CDATA\[|\]\]>/g, "").trim().substring(0, 400);

    if (!title || !link) continue;
    if (pubDate) {
      const articleDate = new Date(pubDate);
      if (articleDate < twoDaysAgo) continue;
    }
    // Pre-filter: only keep AI/ML-relevant articles
    if (!isAIRelevant(title, cleanDesc)) continue;

    items.push({
      title: title.trim(),
      url: link.trim(),
      publishedAt: pubDate ? new Date(pubDate).toISOString() : now.toISOString(),
      description: cleanDesc,
      source: { name: sourceName },
    });
  }

  return items;
}

async function fetchAfricaRSSArticles(region: BriefingRegion = "africa"): Promise<RSSArticle[]> {
  const feeds = REGION_RSS_FEEDS[region] ?? [];
  if (feeds.length === 0) return [];
  const results = await Promise.allSettled(
    feeds.map(async (feed) => {
      try {
        const response = await fetch(feed.url, {
          headers: { "User-Agent": "MV-Intelligence/1.0" },
          signal: AbortSignal.timeout(8000),
        });
        if (!response.ok) return [];
        const xml = await response.text();
        return extractRSSItems(xml, feed.name);
      } catch {
        console.warn(`RSS fetch failed for ${feed.name}`);
        return [];
      }
    })
  );

  const allArticles: RSSArticle[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allArticles.push(...result.value);
    }
  }

  const deduped = Array.from(
    new Map(allArticles.map((a) => [a.url, a])).values()
  );
  deduped.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  console.log(`Africa RSS: fetched ${deduped.length} articles from ${AFRICA_RSS_FEEDS.length} feeds`);
  return deduped.slice(0, 30);
}

async function fetchGitHubCommunityCandidates(): Promise<CandidateArticle[]> {
  try {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const searchUrl = new URL("https://api.github.com/search/repositories");
    searchUrl.searchParams.set(
      "q",
      `((ai OR llm OR agent OR generative) in:name,description,readme) pushed:>=${twoWeeksAgo} stars:>=100`
    );
    searchUrl.searchParams.set("sort", "updated");
    searchUrl.searchParams.set("order", "desc");
    searchUrl.searchParams.set("per_page", "20");

    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "AI-Radar/1.0",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (GITHUB_API_KEY) headers.Authorization = `Bearer ${GITHUB_API_KEY}`;

    const response = await fetch(searchUrl.toString(), {
      headers,
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) {
      const body = await response.text();
      console.warn(`GitHub search failed [${response.status}]: ${body.slice(0, 220)}`);
      return [];
    }

    const payload = await response.json();
    const items = Array.isArray(payload?.items) ? payload.items : [];

    // Detect CJK (Chinese/Japanese/Korean) characters
    const hasCJK = (text: string) => /[\u3000-\u9fff\uf900-\ufaff\ufe30-\ufe4f\uff00-\uffef]/.test(text);

    const candidates: CandidateArticle[] = items
      .filter((repo: any) => typeof repo?.html_url === "string" && typeof repo?.name === "string")
      .filter((repo: any) => {
        // Skip repos with CJK in name, description, or topics
        const desc = repo?.description || "";
        const name = repo?.name || "";
        const topicsText = (repo?.topics ?? []).join(" ");
        return !hasCJK(name) && !hasCJK(desc) && !hasCJK(topicsText);
      })
      .map((repo: any) => {
        const stars = Number(repo?.stargazers_count || 0);
        const forks = Number(repo?.forks_count || 0);
        const language = typeof repo?.language === "string" ? repo.language : "n/a";
        const owner = repo?.owner?.login || "unknown";
        const topics = Array.isArray(repo?.topics) ? repo.topics.filter((t: unknown) => typeof t === "string").slice(0, 4) : [];
        const baseDescription = cleanText(repo?.description) || "Open-source AI project.";
        const topicSentence = topics.length ? `Key themes: ${topics.join(", ")}.` : "";
        const statsSentence = `Maintained by ${owner}, primarily ${language}, with ${stars.toLocaleString()} stars and ${forks.toLocaleString()} forks.`;
        const description = [baseDescription, topicSentence, statsSentence]
          .filter(Boolean)
          .join(" ");

        return {
          title: `${owner}/${repo.name} (${stars.toLocaleString()} stars)`,
          url: repo.html_url,
          publishedAt: repo?.pushed_at || repo?.updated_at || new Date().toISOString(),
          description: description.slice(0, 500),
          source: { name: "GitHub API" },
          repo: `${owner}/${repo.name}`,
          author: owner,
          stars,
        };
      })
      // Sort by stars descending so highest-starred repos are picked first
      .sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));

    console.log(`GitHub API: fetched ${candidates.length} candidates`);
    return candidates;
  } catch (error) {
    console.warn("GitHub candidate fetch failed:", error);
    return [];
  }
}

async function fetchRedditCandidates(): Promise<CandidateArticle[]> {
  const subreddits = [
    { path: "r/artificial", label: "r/artificial" },
    { path: "r/MachineLearning", label: "r/MachineLearning" },
    { path: "r/LocalLLaMA", label: "r/LocalLLaMA" },
    { path: "r/ChatGPT", label: "r/ChatGPT" },
  ];

  const results: CandidateArticle[] = [];

  await Promise.allSettled(
    subreddits.map(async ({ path, label }) => {
      try {
        // Use RSS feeds — less blocked by Reddit than JSON API from cloud IPs
        const resp = await fetch(`https://www.reddit.com/${path}/hot.rss?limit=10`, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; AI-Radar/1.0; RSS reader)",
            Accept: "application/rss+xml, application/xml, text/xml",
          },
          signal: AbortSignal.timeout(12000),
        });
        if (!resp.ok) {
          console.warn(`Reddit RSS ${path} failed [${resp.status}]`);
          return;
        }
        const xml = await resp.text();

        // Reddit feeds are Atom XML — parse <entry> blocks
        const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
        let match;
        while ((match = entryRegex.exec(xml)) !== null) {
          const block = match[1];
          const titleRaw = block.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] || "";
          // Atom uses <link href="URL" /> for the permalink
          const url = block.match(/<link[^>]+href="([^"]+)"/)?.[1]?.replace(/&amp;/g, "&") || "";
          const contentRaw = block.match(/<content[^>]*>([\s\S]*?)<\/content>/)?.[1] || "";
          const published = block.match(/<published>(.*?)<\/published>/)?.[1] || "";
          const authorRaw = block.match(/<name>(.*?)<\/name>/)?.[1] || "Anonymous";

          const title = cleanText(
            titleRaw.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#\d+;/g, " ")
          );
          if (!title || !url || !url.includes("reddit.com/r/")) continue;
          if (title.toLowerCase().includes("[deleted]") || title.toLowerCase().includes("[removed]")) continue;
          // Skip AutoModerator stickied threads
          if (authorRaw.includes("AutoModerator")) continue;
          if (!isAIRelevant(title, contentRaw)) continue;

          // Decode HTML entities in content and strip tags
          const descText = cleanText(
            contentRaw
              .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"')
              .replace(/&#\d+;/g, " ").replace(/<[^>]*>/g, " ")
          );
          const description = descText.length > 80
            ? clipText(descText, 400)
            : `Community discussion in ${label} — ${title}`;

          results.push({
            title: clipText(title, 140),
            url,
            publishedAt: published ? new Date(published).toISOString() : new Date().toISOString(),
            description,
            source: { name: label },
            author: cleanText(authorRaw.replace("/u/", "")),
            subreddit: label,
          });
        }
      } catch (err) {
        console.warn(`Reddit RSS fetch failed for ${path}:`, err);
      }
    })
  );

  console.log(`Reddit RSS: fetched ${results.length} candidates`);
  return results;
}

async function fetchBraveCandidates(): Promise<CandidateArticle[]> {
  if (!BRAVE_SEARCH_API_KEY) return [];

  try {
    const query = [
      "open source AI agent framework",
      "github",
      "llm",
      "released OR launched OR update",
    ].join(" ");

    const url = new URL("https://api.search.brave.com/res/v1/web/search");
    url.searchParams.set("q", query);
    url.searchParams.set("count", "10");
    url.searchParams.set("freshness", "pw");

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "X-Subscription-Token": BRAVE_SEARCH_API_KEY,
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) {
      const body = await response.text();
      console.warn(`Brave search failed [${response.status}]: ${body.slice(0, 220)}`);
      return [];
    }

    const payload = await response.json();
    const results = Array.isArray(payload?.web?.results) ? payload.web.results : [];
    const candidates: CandidateArticle[] = results
      .filter((item: any) => typeof item?.url === "string" && typeof item?.title === "string")
      .map((item: any) => ({
        title: item.title,
        url: item.url,
        publishedAt: new Date().toISOString(),
        description: (item.description || "").toString().slice(0, 500),
        source: { name: "Brave Search" },
      }));

    console.log(`Brave search: fetched ${candidates.length} candidates`);
    return candidates;
  } catch (error) {
    console.warn("Brave candidate fetch failed:", error);
    return [];
  }
}

// ── NewsAPI.org (Global) + Africa RSS ─────────────────────────────────

async function fetchAllArticles(region: BriefingRegion = "africa"): Promise<{ context: string; africaCount: number }> {
  if (!NEWS_API_KEY) throw new Error("NEWS_API_KEY is not configured");

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const fromDate = yesterday.toISOString().split("T")[0];

  const globalUrl = new URL("https://newsapi.org/v2/everything");
  globalUrl.searchParams.set("q", '"artificial intelligence" OR "AI model" OR "machine learning" OR "LLM" OR "GPT" OR "generative AI"');
  globalUrl.searchParams.set("from", fromDate);
  globalUrl.searchParams.set("sortBy", "publishedAt");
  globalUrl.searchParams.set("language", "en");
  globalUrl.searchParams.set("pageSize", "50");
  globalUrl.searchParams.set("apiKey", NEWS_API_KEY);

  const [globalResponse, africaRSSArticles, githubCandidates, redditCandidates, braveCandidates] = await Promise.all([
    fetch(globalUrl.toString()),
    fetchAfricaRSSArticles(region),
    fetchGitHubCommunityCandidates(),
    fetchRedditCandidates(),
    fetchBraveCandidates(),
  ]);

  if (!globalResponse.ok) {
    const errText = await globalResponse.text();
    throw new Error(`NewsAPI global error [${globalResponse.status}]: ${errText}`);
  }

  const globalData = await globalResponse.json();

  const blockedDomains = [
    "pypi.org", "npmjs.com", "github.com", "stackoverflow.com",
    "arxiv.org", "medium.com", "youtube.com", "twitter.com", "x.com",
  ];
  const isBlockedSource = (a: any) => {
    try {
      const host = new URL(a?.url || "").hostname.replace("www.", "");
      return blockedDomains.some((d) => host === d || host.endsWith(`.${d}`));
    } catch { return false; }
  };

  const globalArticles = (globalData.articles || []).filter(
    (a: any) => a?.title && a.title !== "[Removed]" && !isBlockedSource(a)
  );
  const globalDeduped = Array.from(
    new Map(globalArticles.filter((a: any) => a?.url).map((a: any) => [a.url, a])).values()
  ).slice(0, 45);

  const githubDeduped = Array.from(
    new Map(githubCandidates.map((a) => [a.url, a])).values()
  ).slice(0, 20);

  const redditDeduped = Array.from(
    new Map(redditCandidates.map((a) => [a.url, a])).values()
  ).slice(0, 15);

  const braveDeduped = Array.from(
    new Map(braveCandidates.map((a) => [a.url, a])).values()
  ).slice(0, 10);

  const formatArticle = (a: any, i: number) =>
    `[${i + 1}] ${a.title}\nSource: ${a.source?.name || "Unknown"}\nURL: ${a.url}\nPublished: ${a.publishedAt}\nDescription: ${(a.description || "").substring(0, 300)}`;

  const context = [
    "## AFRICA AI CANDIDATES (from African publications — AI/ML stories only)",
    ...(africaRSSArticles.length
      ? africaRSSArticles.map(formatArticle)
      : ["No Africa articles found in RSS feeds for this period."]),
    "",
    "## GLOBAL AI CANDIDATES (from NewsAPI)",
    ...globalDeduped.map(formatArticle),
    "",
    "## GITHUB COMMUNITY CANDIDATES (from GitHub API)",
    ...(githubDeduped.length
      ? githubDeduped.map(formatArticle)
      : ["No GitHub candidates fetched for this period."]),
    "",
    "## REDDIT COMMUNITY CANDIDATES (from Reddit hot posts — r/artificial, r/MachineLearning, r/LocalLLaMA, r/ChatGPT)",
    ...(redditDeduped.length
      ? redditDeduped.map(formatArticle)
      : ["No Reddit candidates fetched for this period."]),
    "",
    "## WEB DISCOVERY CANDIDATES (from Brave Search)",
    ...(braveDeduped.length
      ? braveDeduped.map(formatArticle)
      : ["No Brave search candidates fetched for this period."]),
  ].join("\n\n");

  return {
    context,
    africaCount: africaRSSArticles.length,
  };
}

// ── TLDR AI Newsletter Scraper ────────────────────────────────────────

interface TldrScrapedItem {
  title: string;
  summary: string;
  url: string;
  read_time: string;
  category: "headlines" | "research" | "tools" | "launches";
}

async function fetchTldrFromNewsletter(): Promise<TldrScrapedItem[]> {
  try {
    const response = await fetch("https://tldr.tech/api/latest/ai", {
      headers: { "User-Agent": "MV-Intelligence/1.0" },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      console.warn(`TLDR fetch failed: ${response.status}`);
      return [];
    }
    const html = await response.text();

    const items: TldrScrapedItem[] = [];
    // Parse HTML: <article class="mt-3"><a class="font-bold" href="URL"><h3>Title (X minute read)</h3></a><div class="newsletter-html">Summary</div></article>
    const articleRegex = /<article[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>\s*<h3>(.+?)<\/h3>\s*<\/a>\s*<div class="newsletter-html">([\s\S]*?)<\/div>\s*<\/article>/g;
    let match;
    while ((match = articleRegex.exec(html)) !== null) {
      let url = match[1].replace(/&amp;/g, "&").trim();
      const rawTitle = match[2].trim();
      const rawSummary = match[3].replace(/<[^>]*>/g, "").trim();

      // Skip sponsor entries
      if (rawTitle.toLowerCase().includes("(sponsor)")) continue;

      // Extract read time from title like "Title (X minute read)"
      const readTimeMatch = rawTitle.match(/\((\d+)\s*minute\s*read\)\s*$/);
      const title = rawTitle.replace(/\s*\(\d+\s*minute\s*read\)\s*$/, "").trim();
      const readTime = readTimeMatch ? `${readTimeMatch[1]} min` : "2 min";

      // Remove TLDR tracking params
      url = url.replace(/[?&]utm_source=tldrai/, "").replace(/[?&]s=\d+/, "").replace(/[?&]$/, "").replace(/\?$/, "");

      // Auto-categorize
      const combined = (title + " " + rawSummary).toLowerCase();
      let category: TldrScrapedItem["category"] = "headlines";
      if (/paper|arxiv|study|research|findings|experiment|recall|controlled/.test(combined)) {
        category = "research";
      } else if (/launch|releas|introduc|announc|deploy|new\s+(model|chip|product|version|feature|plugin)/.test(combined)) {
        category = "launches";
      } else if (/tool|framework|sdk|library|cli|repo|open.?source|plugin|marketplace/.test(combined)) {
        category = "tools";
      }

      items.push({ title, summary: rawSummary.substring(0, 500), url, read_time: readTime, category });
    }

    console.log(`TLDR newsletter: scraped ${items.length} items from tldr.tech/ai`);
    return items;
  } catch (err) {
    console.warn("TLDR newsletter scrape failed:", err);
    return [];
  }
}

// ── Gemini API ────────────────────────────────────────────────────────

function shouldRetryAiStatus(status: number): boolean {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callAI(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

  const maxAttempts = 4;
  let lastErrorMessage = "AI call failed after retries";

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let response: Response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
          GEMINI_API_KEY
        )}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
            },
          }),
        }
      );
    } catch (error) {
      const err = error instanceof Error ? error.message : String(error);
      lastErrorMessage = `AI request error: ${err}`;
      if (attempt < maxAttempts) {
        const backoffMs = 1000 * attempt + Math.floor(Math.random() * 400);
        console.warn(`${lastErrorMessage} | retrying in ${backoffMs}ms (attempt ${attempt + 1}/${maxAttempts})`);
        await sleep(backoffMs);
        continue;
      }
      throw new Error(lastErrorMessage);
    }

    if (!response.ok) {
      const errText = await response.text();
      const message = `AI call failed [${response.status}]: ${errText}`;
      lastErrorMessage = message;
      if (shouldRetryAiStatus(response.status) && attempt < maxAttempts) {
        const backoffMs = 1000 * attempt + Math.floor(Math.random() * 400);
        console.warn(`${message} | retrying in ${backoffMs}ms (attempt ${attempt + 1}/${maxAttempts})`);
        await sleep(backoffMs);
        continue;
      }
      throw new Error(message);
    }

    const data = await response.json();
    const content = data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part?.text || "")
      .join("")
      .trim();
    if (!content) {
      lastErrorMessage = "No content returned from AI";
      if (attempt < maxAttempts) {
        const backoffMs = 1000 * attempt + Math.floor(Math.random() * 400);
        console.warn(`${lastErrorMessage} | retrying in ${backoffMs}ms (attempt ${attempt + 1}/${maxAttempts})`);
        await sleep(backoffMs);
        continue;
      }
      throw new Error(lastErrorMessage);
    }
    return content;
  }

  throw new Error(lastErrorMessage);
}

function parseJSON(content: string): any {
  let jsonStr = content;
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) jsonStr = jsonMatch[1];
  return JSON.parse(jsonStr.trim());
}

function buildAfricaFallbackFromContext(newsContext: string) {
  const sectionMatch = newsContext.match(/## AFRICA AI CANDIDATES([\s\S]*?)## GLOBAL AI CANDIDATES/);
  if (!sectionMatch) return null;

  const firstArticleMatch = sectionMatch[1].match(/\[\d+\]\s*(.*?)\nSource:\s*(.*?)\nURL:\s*(.*?)\nPublished:[\s\S]*?Description:\s*(.*?)(?:\n\n\[\d+\]|$)/s);
  if (!firstArticleMatch) return null;

  const [, title, source, url, description] = firstArticleMatch;

  return {
    title: title.trim(),
    sources: [source.trim()],
    source_urls: [url.trim()],
    summary: (description || "").trim() || "A notable AI development with direct relevance to African markets was identified in today's feed.",
    strategic_implications: "This development signals active AI movement in African ecosystems and should be monitored for policy, research, and competitive shifts.",
    concept_explained: null,
    why_it_matters_now: "It offers an immediate signal of AI momentum in Africa and deserves executive attention.",
  };
}


async function fetchNewsData(newsContext: string, today: string, hour: number, tldrItems: TldrScrapedItem[]) {
  // Build a numbered URL catalog — AI must reference by index
  const allSourceArticles: { index: number; title: string; url: string; source: string; summary: string }[] = [];

  // Parse articles from context
  const articleRegex = /\[(\d+)\]\s*(.*?)\nSource:\s*(.*?)\nURL:\s*(.*?)\nPublished:[\s\S]*?Description:\s*(.*?)(?=\n\n\[|\n\n##|$)/g;
  let m;
  while ((m = articleRegex.exec(newsContext)) !== null) {
    allSourceArticles.push({
      index: allSourceArticles.length,
      title: m[2].trim(),
      url: m[4].trim(),
      source: m[3].trim(),
      summary: m[5].trim(),
    });
  }

  // Add TLDR items to the catalog
  for (const t of tldrItems) {
    allSourceArticles.push({
      index: allSourceArticles.length,
      title: t.title,
      url: t.url,
      source: "TLDR AI",
      summary: t.summary,
    });
  }

  // Build the indexed catalog string
  const indexedCatalog = allSourceArticles.map((a) =>
    `[${a.index}] ${a.title}\nSource: ${a.source}\nURL: ${a.url}\nSummary: ${a.summary}`
  ).join("\n\n");

  // Build a lookup map for validation
  const validUrlSet = new Set(allSourceArticles.map((a) => a.url));

  const prompt = `You are an AI news curator. Today is ${today}, current hour: ${hour}:00 UTC.

Here is the INDEXED CATALOG of verified articles. Each item has an index number [N]:

${indexedCatalog}

Based on ONLY these articles, generate a JSON object (raw JSON only, no markdown):

{
  "news": [
    {
      "title": "headline",
      "summary": "2-3 sentence summary",
      "takeaways": ["insight 1", "insight 2", "insight 3", "insight 4"],
      "source": "publication name from the article",
      "url_index": 5,
      "category": "LLMs|Robotics|Research|Industry|Policy",
      "is_breaking": false
    }
  ],
  "community": [
    {
      "title": "For GitHub repos: a concise journalistic headline (8-12 words) that synthesizes what the project does and why it matters — do NOT use the repo path or owner/repo format, and do NOT copy the first sentence of the description. For Reddit posts: the original post title.",
      "source": "github|reddit",
      "subreddit": "r/SubName or null",
      "repo": "owner/repo or null",
      "description": "2-4 sentences: what it does, core components/architecture, and typical implementation pattern",
      "how_it_helps": "2-3 sentences: exactly who should use it, what pain point it solves, and the expected practical outcome",
      "author": "Author or project owner",
      "url_index": 12,
      "upvotes": null,
      "stars": null,
      "comments": 0
    }
  ],
  "use_cases": [
    {
      "title": "Compelling title describing a real AI use case",
      "summary": "3-5 sentence description of the workflow: what was built, how AI fits in, step-by-step process",
      "tools_used": ["Tool1", "Tool2"],
      "productivity_gain": "Specific measurable result, e.g. '4 hours saved per week'",
      "source": "reddit|linkedin|github",
      "author": "Author name",
      "url_index": 8,
      "type": "person|company",
      "category": "productivity|healthcare|finance|marketing|customer-support|operations|engineering|education|legal|hr|other"
    }
  ]
}

RULES:
- Generate 5 news articles from the MOST important stories.
- Generate 6 community posts: exactly 3 from GITHUB COMMUNITY CANDIDATES (source must be "github") and exactly 3 from REDDIT COMMUNITY CANDIDATES (source must be "reddit"). If fewer than 3 Reddit candidates exist, use what is available and fill the rest with GitHub. Use url_index to reference the source.
- For GitHub community items: title MUST be a journalist-style headline (8-12 words) summarising what the project does and why it matters — never the repo path, never "owner/repo", never a copy of the first description sentence. description must explain what the tool actually does (architecture, approach, key feature). how_it_helps MUST start with the tool/repo name, name a specific audience (e.g. "ML teams building RAG pipelines", "frontend devs shipping chat UIs"), describe the concrete pain it solves for that audience, and end with one adoption tip. Every how_it_helps must be unique — never reuse phrasing across items.
- Generate 10 use cases total: aim for 5 "person" + 5 "company" whenever evidence exists.
- Person use cases must clearly be first-person workflow stories (e.g. "I use AI to...", "my process", "we built this in our small team") and should not read like company PR.
- Company use cases must be organizational deployments or enterprise rollouts.
- Use url_index to reference the source. For each use case, set "type" and "category" accurately.
- Mark the single biggest story as is_breaking: true.
- CRITICAL: Use "url_index" (an integer) to reference articles from the catalog. Do NOT include a "url" field. The system will resolve the URL from the index.
- Every url_index MUST correspond to a valid [N] from the catalog above.
- Do NOT invent any URLs. If you cannot find a suitable article, generate FEWER items.
- NOTE: TLDR items are NOT generated here — they are scraped directly from tldr.tech/ai newsletter.`;

  const raw = parseJSON(await callAI(prompt));

  // Resolve url_index → actual URL, dropping any with invalid indexes
  const resolveUrl = (item: any) => {
    const idx = item.url_index;
    if (typeof idx === "number" && idx >= 0 && idx < allSourceArticles.length) {
      return {
        ...item,
        url: allSourceArticles[idx].url,
        _source_title: allSourceArticles[idx].title,
        _source_name: allSourceArticles[idx].source,
      };
    }
    // If AI included a url field directly, check it's in our set
    if (item.url && validUrlSet.has(item.url)) {
      return item;
    }
    console.warn(`Dropped item with invalid url_index=${idx}: "${item.title}"`);
    return null;
  };

  if (raw.news) {
    raw.news = raw.news
      .map(resolveUrl)
      .filter(Boolean)
      .map((item: any) => ({
        ...item,
        title: item._source_title || item.title,
        source: item._source_name || item.source,
      }));
  }
  if (raw.community) raw.community = raw.community.map(resolveUrl).filter(Boolean);
  if (raw.use_cases) raw.use_cases = raw.use_cases.map(resolveUrl).filter(Boolean);

  return raw;
}

// ── Executive Briefing generation ─────────────────────────────────────

async function fetchExecutiveBriefing(newsContext: string, today: string, hour: number, africaArticlesCount: number, region: BriefingRegion = "africa") {
  const regionLabel = REGION_LABELS[region];
  const prompt = `You are MV Intelligence, a strategy-grade AI briefing service. Today is ${today}, ${hour}:00 UTC.

${regionLabel}-specific article candidates in this pull: ${africaArticlesCount}.

Here are the latest verified AI articles from NewsAPI.org:

${newsContext}

Generate a JSON object (raw JSON only, no markdown) with an executive briefing following STRICT rules:

{
  "global_items": [
    {
      "title": "Headline — clear, factual, no clickbait",
      "sources": ["Source 1", "Source 2", "Source 3"],
      "source_urls": ["exact-url-1-from-above", "exact-url-2-from-above", "exact-url-3-from-above"],
      "earliest_source_date": "YYYY-MM-DD from the earliest publishedAt date among the sources used",
      "summary": "Clear factual synthesis in 3-5 sentences. No filler. No dramatic language.",
      "strategic_implications": "Business, regulatory, competitive or geopolitical impact. Full sentences. Concise strategic analysis.",
      "concept_explained": "If technical, explain the core concept in simple executive terms (Feynman style). Null if not technical.",
      "why_it_matters_now": "One sharp sentence on immediate relevance."
    }
  ],
  "africa_items": [
    {
      "title": "Headline",
      "sources": ["Source 1", "Source 2", "Source 3"],
      "source_urls": ["exact-url-1", "exact-url-2", "exact-url-3"],
      "earliest_source_date": "YYYY-MM-DD from the earliest publishedAt date among the sources used",
      "summary": "Clear factual synthesis in 3-5 sentences.",
      "strategic_implications": "Impact analysis.",
      "concept_explained": "Simple explanation if technical, null otherwise.",
      "why_it_matters_now": "One sharp sentence."
    }
  ],
  "africa_no_update": false,
  "signals_to_watch": [
    "Short bullet: early regulatory move / talent migration / capital shift / infrastructure signal / research breakthrough not yet commercialized"
  ]
}

SELECTION CRITERIA — Only include items that materially affect:
- Markets, Regulation, Frontier research, Major capital allocation, Infrastructure shifts, Competitive positioning

VERIFICATION PROTOCOL:
- Use ONLY articles from the NewsAPI data above. These are verified, real articles.
- Copy source URLs EXACTLY from the articles above. Do NOT fabricate or modify URLs.
- Each item should have at most 3 UNIQUE, DISTINCT sources. Never repeat the same source domain.
- GLOBAL items should preferably reference 2-3 independent sources from different domains.
- ${regionLabel} items require at least ONE reputable source (single-source is allowed).
- Do NOT include multiple URLs from the same domain (e.g. multiple pypi.org links). Pick the most relevant one per domain.
- NEVER use package registries (pypi.org, npmjs.com), code repos (github.com), or social media as sources. Only use legitimate news outlets, research blogs, and industry publications.

GLOBAL AI: Up to 5 items. If fewer than 5 meet threshold, publish fewer.

${regionLabel.toUpperCase()} AI: Up to 5 items. Focus STRICTLY on: AI model development, AI policy & regulation, AI research, AI infrastructure (compute, data centers, cloud for AI), AI adoption in enterprises, AI talent & education, AI startups & funding for AI companies. Do NOT include general fintech, digital transformation, smart cities, or connectivity stories unless they are specifically about AI/ML technology.
CRITICAL: Even when africaArticlesCount is 0, analyze the GLOBAL articles for ${regionLabel}-relevant implications. Major global AI developments ALWAYS have implications for ${regionLabel} markets (e.g. new model releases affect ${regionLabel} developers, AI regulation precedents affect ${regionLabel} policymakers, cloud infrastructure expansions reach ${regionLabel} data centers). Extract at least 1-2 items by analyzing how global developments specifically impact ${regionLabel} economies, talent, policy, or adoption.
If africaArticlesCount > 0, you MUST include those ${regionLabel}-specific articles.
Only set africa_no_update to true if there are genuinely zero implications for ${regionLabel} in any article — this should be extremely rare.

SIGNALS TO WATCH: 1-2 short bullets on emerging trends visible in today's articles.

STYLE: Write like a sharp strategy consultant. Full sentences. No emojis. No conversational tone. No filler. Precision over volume.`;

  return parseJSON(await callAI(prompt));
}

// ── Database operations ───────────────────────────────────────────────

// ── Fetch existing titles/URLs for deduplication ─────────────────────

async function getExistingKeys(): Promise<{ newsTitles: Set<string>; newsUrls: Set<string>; tldrUrls: Set<string>; tldrTitles: Set<string>; communityUrls: Set<string>; communityTitles: Set<string>; useCaseUrls: Set<string>; useCaseTitles: Set<string>; briefingTitles: Set<string> }> {
  const [newsRes, tldrRes, communityRes, useCaseRes, briefingRes] = await Promise.all([
    supabaseAdmin.from("news_articles").select("title, url"),
    supabaseAdmin.from("tldr_items").select("title, url"),
    supabaseAdmin.from("community_posts").select("title, url"),
    supabaseAdmin.from("use_cases").select("title, url"),
    supabaseAdmin.from("executive_briefings").select("global_items, africa_items"),
  ]);

  const newsTitles = new Set((newsRes.data || []).map((r: any) => normalizeTitle(r.title)));
  const newsUrls = new Set((newsRes.data || []).map((r: any) => r.url));
  const tldrUrls = new Set((tldrRes.data || []).map((r: any) => r.url));
  const tldrTitles = new Set((tldrRes.data || []).map((r: any) => r.title.toLowerCase().trim()));
  const communityUrls = new Set((communityRes.data || []).map((r: any) => r.url));
  const communityTitles = new Set((communityRes.data || []).map((r: any) => normalizeTitle(r.title)));
  const useCaseUrls = new Set((useCaseRes.data || []).map((r: any) => r.url));
  const useCaseTitles = new Set((useCaseRes.data || []).map((r: any) => normalizeTitle(r.title)));

  const briefingTitles = new Set<string>();
  for (const row of briefingRes.data || []) {
    for (const item of (row.global_items as any[]) || []) {
      if (item?.title) briefingTitles.add(normalizeTitle(item.title));
    }
    for (const item of (row.africa_items as any[]) || []) {
      if (item?.title) briefingTitles.add(normalizeTitle(item.title));
    }
  }

  return { newsTitles, newsUrls, tldrUrls, tldrTitles, communityUrls, communityTitles, useCaseUrls, useCaseTitles, briefingTitles };
}

// ── URL Validation ────────────────────────────────────────────────────

async function validateUrl(url: string): Promise<boolean> {
  try {
    const parsed = new URL(url);
    // Basic structural checks for known platforms
    if (parsed.hostname.includes("reddit.com")) {
      const redditMatch = url.match(/\/comments\/([a-z0-9]+)\//);
      if (redditMatch) {
        const postId = redditMatch[1];
        if (/^\d+$/.test(postId)) return false;
        if (postId.length < 5 || postId.length > 8) return false;
      }
    }
    if (parsed.hostname === "github.com") {
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts.length < 2) return false;
      // Use GitHub API to verify repo exists
      try {
        const apiResp = await fetch(`https://api.github.com/repos/${parts[0]}/${parts[1]}`, {
          headers: { "User-Agent": "MV-Intelligence/1.0", "Accept": "application/vnd.github.v3+json" },
          signal: AbortSignal.timeout(5000),
        });
        if (apiResp.status === 404) {
          console.warn(`GitHub repo not found: ${parts[0]}/${parts[1]}`);
          return false;
        }
      } catch {
        // If API call fails, fall through to HEAD check
      }
    }
    // HEAD request to verify URL is reachable
    const resp = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": "MV-Intelligence/1.0 (link-checker)" },
      signal: AbortSignal.timeout(6000),
      redirect: "follow",
    });
    if (resp.status === 404 || resp.status === 410) return false;
    if (resp.status === 405) {
      const getResp = await fetch(url, {
        method: "GET",
        headers: { "User-Agent": "MV-Intelligence/1.0 (link-checker)" },
        signal: AbortSignal.timeout(6000),
        redirect: "follow",
      });
      const body = await getResp.text();
      if (getResp.status === 404 || getResp.status === 410) return false;
      // Check for soft 404s
      const lower = body.toLowerCase();
      if (lower.includes("page not found") || lower.includes("404") && lower.includes("not found")) return false;
      return getResp.status >= 200 && getResp.status < 400;
    }
    return resp.status >= 200 && resp.status < 400;
  } catch {
    return false;
  }
}

async function filterValidUrls<T extends { url: string; title: string }>(items: T[], label: string): Promise<T[]> {
  const results = await Promise.allSettled(
    items.map(async (item) => {
      const valid = await validateUrl(item.url);
      if (!valid) console.warn(`${label} — invalid URL dropped: "${item.title}" → ${item.url}`);
      return { item, valid };
    })
  );
  return results
    .filter((r): r is PromiseFulfilledResult<{ item: T; valid: boolean }> => r.status === "fulfilled" && r.value.valid)
    .map((r) => r.value.item);
}

async function insertToday(newsData: any, briefingData: any, fullRefresh: boolean) {
  const today = new Date().toISOString().split("T")[0];

  if (fullRefresh) {
    console.log("Full refresh — clearing today's data before insert");
    await supabaseAdmin.from("news_articles").delete().eq("published_date", today);
    await supabaseAdmin.from("tldr_items").delete().eq("published_date", today);
    await supabaseAdmin.from("community_posts").delete().eq("published_date", today);
    await supabaseAdmin.from("use_cases").delete().eq("published_date", today);
    await supabaseAdmin.from("executive_briefings").delete().eq("published_date", today);
  } else {
    // Append mode: only clear briefing (always refresh), keep news/tldr/community/use_cases stacked
    console.log("Append mode — stacking news, refreshing briefing only");
    await supabaseAdmin.from("executive_briefings").delete().eq("published_date", today);
  }

  // Fetch existing data for deduplication
  // For full refresh: we cleared today's data, but still need to check against older days
  // to avoid re-inserting stale TLDR items when the newsletter hasn't updated yet
  const existing = fullRefresh
    ? await getExistingKeys()
    : await getExistingKeys();

  // Cross-table title superset: news is checked against news + community + briefing titles
  const allKnownTitles = new Set<string>([
    ...existing.newsTitles,
    ...existing.communityTitles,
    ...existing.briefingTitles,
  ]);

  const refreshDailyUseCaseHighlights = async () => {
    // Reset current day's assigned highlights before recomputing.
    await supabaseAdmin
      .from("use_cases")
      .update({ is_highlighted: false, highlighted_date: null, highlighted_rank: null })
      .eq("highlighted_date", today);

    for (const type of ["person", "company"] as const) {
      const { data: topRows, error: selectError } = await supabaseAdmin
        .from("use_cases")
        .select("id")
        .eq("type", type)
        .lte("published_date", today)
        .order("published_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5);

      if (selectError) {
        console.error(`Use case highlight select error (${type}):`, selectError);
        continue;
      }

      if (!topRows?.length) continue;

      for (let i = 0; i < topRows.length; i++) {
        const row = topRows[i];
        const { error: updateError } = await supabaseAdmin
          .from("use_cases")
          .update({
            is_highlighted: true,
            highlighted_date: today,
            highlighted_rank: i + 1,
          })
          .eq("id", row.id);

        if (updateError) {
          console.error(`Use case highlight update error (${type}, rank ${i + 1}):`, updateError);
        }
      }
    }
  };

  if (newsData.news?.length) {
    const dbDeduped = newsData.news.filter((n: any) =>
      !existing.newsUrls.has(n.url) && !isSimilarTitle(n.title, allKnownTitles)
    );
    const deduped = deduplicateBatch(dbDeduped, "News");
    const validated = await filterValidUrls(deduped, "News");
    console.log(`News: ${newsData.news.length} generated, ${deduped.length} deduped, ${validated.length} valid`);
    if (validated.length > 0) {
      const { error } = await supabaseAdmin
        .from("news_articles")
        .upsert(
          validated.map((n: any) => ({
            title: n.title, summary: n.summary, takeaways: n.takeaways,
            source: n.source, url: n.url, category: n.category,
            is_breaking: n.is_breaking || false, published_date: today,
          })),
          { onConflict: "url" }
        );
      if (error) console.error("News insert error:", error);
    }
  }

  if (newsData.tldr?.length) {
    const deduped = newsData.tldr.filter((t: any) => !existing.tldrUrls.has(t.url) && !existing.tldrTitles.has(t.title.toLowerCase().trim()));
    console.log(`TLDR: ${newsData.tldr.length} scraped, ${deduped.length} new after dedup (by URL + title)`);
    if (deduped.length > 0) {
      const { error } = await supabaseAdmin
        .from("tldr_items")
        .upsert(
          deduped.map((t: any) => ({
            title: t.title, summary: t.summary, url: t.url,
            read_time: t.read_time, category: t.category, published_date: today,
          })),
          { onConflict: "url", ignoreDuplicates: true }
        );
      if (error) console.error("TLDR insert error:", error);
    }
  }

  if (newsData.community?.length) {
    // GitHub posts replace previous ones entirely — always show today's top repos.
    await supabaseAdmin.from("community_posts").delete().eq("source", "github");
    console.log("Community: cleared all previous GitHub posts before inserting today's batch");

    const deduped = newsData.community.filter((c: any) => !existing.communityUrls.has(c.url));
    const validated = await filterValidUrls(deduped, "Community");
    const validatedGithubCount = validated.filter((c: any) =>
      ["github"].includes(c.source) || c.url?.includes("github.com")
    ).length;

    const githubFallbacks = await fetchGitHubCommunityCandidates();
    const fallbackMapped = githubFallbacks
      .filter((item) => !existing.communityUrls.has(item.url))
      .filter((item) => !validated.some((c: any) => c.url === item.url))
      .slice(0, 6)
      .map((item) => ({
        title: item.title,
        source: "github",
        subreddit: null,
        repo: item.repo || null,
        description: item.description,
        how_it_helps:
          "Useful for teams tracking practical AI/agent tooling and active open-source implementation patterns.",
        author: item.author || "GitHub",
        url: item.url,
        upvotes: null,
        stars: item.stars ?? null,
        comments: 0,
      }))
      .map((item) => formatGithubCommunityEntry(item));

    let enrichedCommunity = [...validated, ...fallbackMapped].flatMap((item: any) => {
      // Derive source from URL — never assume "reddit" as a fallback.
      const url: string = item.url || "";
      const source: string =
        item.source === "github" || url.includes("github.com")
          ? "github"
          : item.source === "reddit" || url.includes("reddit.com")
          ? "reddit"
          : ""; // unknown — will be filtered out below
      if (!source) {
        console.warn(`[community] skipping item with unresolvable source: ${url}`);
        return [];
      }
      if (source === "github") return [formatGithubCommunityEntry({ ...item, source })];
      return [{ ...item, source }];
    });

    // Enforce a minimum GitHub presence in the final batch.
    const currentGithub = enrichedCommunity.filter((c: any) =>
      c.source === "github" || c.url?.includes("github.com")
    ).length;
    if (currentGithub < MIN_GITHUB_COMMUNITY_PER_RUN) {
      console.warn(
        `Community GitHub minimum not met: ${currentGithub}/${MIN_GITHUB_COMMUNITY_PER_RUN}`
      );
    }

    // Enforce a minimum Reddit presence — fetch directly without Gemini if needed.
    const currentReddit = enrichedCommunity.filter((c: any) =>
      c.source === "reddit" || c.url?.includes("reddit.com")
    ).length;
    if (currentReddit < MIN_REDDIT_COMMUNITY_PER_RUN) {
      const needed = MIN_REDDIT_COMMUNITY_PER_RUN - currentReddit;
      const redditFallbacks = await fetchRedditCandidates();
      const redditFormatted = redditFallbacks
        .filter((item) => !existing.communityUrls.has(item.url))
        .filter((item) => !enrichedCommunity.some((c: any) => c.url === item.url))
        .slice(0, needed)
        .map((item) => formatRedditCommunityEntry(item));
      if (redditFormatted.length > 0) {
        enrichedCommunity = [...enrichedCommunity, ...redditFormatted];
        console.log(`Reddit fallback: added ${redditFormatted.length} direct Reddit posts`);
      } else {
        console.warn(`Reddit fallback: no candidates available (Reddit fetch may have failed)`);
      }
    }

    // Hard dedupe by URL before insert.
    enrichedCommunity = Array.from(
      new Map(enrichedCommunity.map((item: any) => [item.url, item])).values()
    );

    console.log(
      `Community: ${newsData.community.length} generated, ${deduped.length} deduped, ${validated.length} valid, ${fallbackMapped.length} github-direct, ${enrichedCommunity.length} final`
    );

    if (enrichedCommunity.length > 0) {
      const { error } = await supabaseAdmin
        .from("community_posts")
        .upsert(
          enrichedCommunity.map((c: any) => ({
            title: c.title, source: c.source, subreddit: c.subreddit || null,
            repo: c.repo || null, description: c.description,
            how_it_helps: c.how_it_helps, author: c.author || "Anonymous", url: c.url,
            upvotes: c.upvotes || null, stars: c.stars || null,
            comments: c.comments || 0, published_date: today,
          })),
          { onConflict: "url", ignoreDuplicates: true }
        );
      if (error) console.error("Community insert error:", error);
    }
  }

  if (newsData.use_cases?.length) {
    const dbDeduped = newsData.use_cases.filter((u: any) =>
      !existing.useCaseUrls.has(u.url) && !isSimilarTitle(u.title, existing.useCaseTitles)
    );
    const deduped = deduplicateBatch(dbDeduped, "Use cases");
    const validated = await filterValidUrls(deduped, "Use cases");
    console.log(`Use cases: ${newsData.use_cases.length} generated, ${deduped.length} deduped, ${validated.length} valid`);
    if (validated.length > 0) {
      const { error } = await supabaseAdmin
        .from("use_cases")
        .upsert(
          validated.map((u: any) => ({
            title: u.title, summary: u.summary,
            tools_used: u.tools_used || [], productivity_gain: u.productivity_gain || "",
            source: ["reddit", "linkedin", "github"].includes(u.source) ? u.source : "reddit",
            author: u.author || "Anonymous", url: u.url,
            type: classifyUseCaseType({
              type: u.type,
              title: u.title,
              summary: u.summary,
              author: u.author,
              source: u.source,
            }),
            category: normalizeUseCaseCategory(u.category),
            published_date: today,
          })),
          { onConflict: "url", ignoreDuplicates: true }
        );
      if (error) console.error("Use cases insert error:", error);
    }

    // Always recompute today's highlighted slots from latest rows.
    await refreshDailyUseCaseHighlights();
  }

  // Deduplicate briefing items against existing briefing titles
  if (briefingData.global_items?.length) {
    briefingData.global_items = briefingData.global_items.filter(
      (item: any) => !isSimilarTitle(item.title || "", existing.briefingTitles)
    );
    // Validate briefing source URLs
    for (const item of briefingData.global_items) {
      if (item.source_urls?.length) {
        const validatedUrls: string[] = [];
        const validatedSources: string[] = [];
        for (let i = 0; i < item.source_urls.length; i++) {
          const isValid = await validateUrl(item.source_urls[i]);
          if (isValid) {
            validatedUrls.push(item.source_urls[i]);
            validatedSources.push(item.sources[i]);
          } else {
            console.warn(`Briefing global — invalid source URL dropped: ${item.source_urls[i]}`);
          }
        }
        item.source_urls = validatedUrls;
        item.sources = validatedSources;
      }
    }
    // Remove briefing items with zero valid sources
    briefingData.global_items = briefingData.global_items.filter((item: any) => item.source_urls?.length > 0);
    console.log(`Briefing global items after dedup + validation: ${briefingData.global_items.length}`);
  }
  if (briefingData.africa_items?.length) {
    briefingData.africa_items = briefingData.africa_items.filter(
      (item: any) => !isSimilarTitle(item.title || "", existing.briefingTitles)
    );
    for (const item of briefingData.africa_items) {
      if (item.source_urls?.length) {
        const validatedUrls: string[] = [];
        const validatedSources: string[] = [];
        for (let i = 0; i < item.source_urls.length; i++) {
          const isValid = await validateUrl(item.source_urls[i]);
          if (isValid) {
            validatedUrls.push(item.source_urls[i]);
            validatedSources.push(item.sources[i]);
          } else {
            console.warn(`Briefing africa — invalid source URL dropped: ${item.source_urls[i]}`);
          }
        }
        item.source_urls = validatedUrls;
        item.sources = validatedSources;
      }
    }
    briefingData.africa_items = briefingData.africa_items.filter((item: any) => item.source_urls?.length > 0);
    console.log(`Briefing africa items after dedup + validation: ${briefingData.africa_items.length}`);
  }

  const { error: briefingError } = await supabaseAdmin.from("executive_briefings").insert({
    published_date: today,
    global_items: briefingData.global_items || [],
    africa_items: briefingData.africa_no_update ? null : (briefingData.africa_items || null),
    africa_no_update: briefingData.africa_no_update || false,
    signals_to_watch: briefingData.signals_to_watch || [],
  });
  if (briefingError) console.error("Briefing insert error:", briefingError);
}

// ── Main handler ──────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let runId: string | null = null;

  try {
    let mode = "append";
    let isHealthCheck = false;
    let region: BriefingRegion = "africa";
    try {
      const body = await req.json();
      if (body?.mode === "full") mode = "full";
      if (body?.mode === "health") isHealthCheck = true;
      if (isValidRegion(body?.region)) region = body.region;
    } catch { /* no body = append mode */ }

    // ── Health Check ──
    if (isHealthCheck) {
      const { data: lastRuns } = await supabaseAdmin
        .from("pipeline_runs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(5);

      return new Response(
        JSON.stringify({
          status: "ok",
          timestamp: new Date().toISOString(),
          last_runs: lastRuns || [],
          secrets_configured: {
            NEWS_API_KEY: !!NEWS_API_KEY,
            GEMINI_API_KEY: !!GEMINI_API_KEY,
            GITHUB_API_KEY: !!GITHUB_API_KEY,
            BRAVE_SEARCH_API_KEY: !!BRAVE_SEARCH_API_KEY,
            SUPABASE_SERVICE_ROLE_KEY: !!SUPABASE_SERVICE_ROLE_KEY,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log pipeline start
    const { data: runRow } = await supabaseAdmin
      .from("pipeline_runs")
      .insert({ mode, status: "running" })
      .select("id")
      .single();
    runId = runRow?.id || null;

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const hour = now.getUTCHours();

    console.log(`Mode: ${mode} | Fetching Global (NewsAPI) + Africa (RSS) + TLDR newsletter...`);

    // Fetch all sources — NewsAPI failure is gracefully degraded
    let newsContext = "";
    let africaCount = 0;
    let tldrItems: TldrScrapedItem[] = [];

    const results = await Promise.allSettled([
      fetchAllArticles(region),
      fetchTldrFromNewsletter(),
    ]);

    if (results[0].status === "fulfilled") {
      newsContext = results[0].value.context;
      africaCount = results[0].value.africaCount;
    } else {
      console.error("NewsAPI + RSS fetch failed (graceful degradation):", results[0].reason);
      // If NewsAPI fails, try RSS-only context
      try {
        const africaArticles = await fetchAfricaRSSArticles();
        africaCount = africaArticles.length;
        newsContext = africaArticles.length
          ? africaArticles.map((a, i) => `[${i + 1}] ${a.title}\nSource: ${a.source.name}\nURL: ${a.url}\nPublished: ${a.publishedAt}\nDescription: ${a.description}`).join("\n\n")
          : "";
      } catch { /* total failure — proceed with TLDR only */ }
    }

    if (results[1].status === "fulfilled") {
      tldrItems = results[1].value;
    } else {
      console.error("TLDR scrape failed:", results[1].reason);
    }

    // If we have zero context and zero TLDR, skip AI calls but still log success
    if (!newsContext && tldrItems.length === 0) {
      console.warn("No data from any source — skipping AI generation");
      const counts = { news: 0, tldr: 0, community: 0, use_cases: 0, briefing_global: 0, briefing_africa: 0 };
      if (runId) {
        await supabaseAdmin.from("pipeline_runs").update({
          status: "skipped", finished_at: new Date().toISOString(),
          duration_ms: Date.now() - startTime, counts,
          error_message: "No data from any source",
        }).eq("id", runId);
      }
      return new Response(JSON.stringify({ success: true, skipped: true, counts }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Context gathered: ${newsContext.length} chars · Africa RSS: ${africaCount} · TLDR scraped: ${tldrItems.length}`);

    // Generate news data and executive briefing in parallel
    const [newsData, briefingData] = await Promise.all([
      fetchNewsData(newsContext, today, hour, tldrItems),
      fetchExecutiveBriefing(newsContext, today, hour, africaCount, region),
    ]);

    // Attach scraped TLDR items (not AI-generated)
    newsData.tldr = tldrItems;

    if (africaCount > 0 && (!briefingData.africa_items?.length || briefingData.africa_no_update)) {
      const fallbackAfricaItem = buildAfricaFallbackFromContext(newsContext);
      if (fallbackAfricaItem) {
        briefingData.africa_items = [fallbackAfricaItem];
        briefingData.africa_no_update = false;
      }
    }

    const counts = {
      news: newsData.news?.length || 0,
      tldr: newsData.tldr?.length || 0,
      community: newsData.community?.length || 0,
      use_cases: newsData.use_cases?.length || 0,
      briefing_global: briefingData.global_items?.length || 0,
      briefing_africa: briefingData.africa_items?.length || 0,
    };

    console.log(`Generated: ${counts.news} news, ${counts.tldr} TLDR (scraped), ${counts.community} community, ${counts.use_cases} use cases`);
    console.log(`Briefing: ${counts.briefing_global} global, ${counts.briefing_africa} africa`);

    await insertToday(newsData, briefingData, mode === "full");
    console.log("Database updated successfully");

    // Log success
    if (runId) {
      await supabaseAdmin.from("pipeline_runs").update({
        status: "success", finished_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime, counts,
      }).eq("id", runId);
    }

    return new Response(
      JSON.stringify({ success: true, source: "newsapi.org", counts }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error fetching news:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";

    // Log failure
    if (runId) {
      await supabaseAdmin.from("pipeline_runs").update({
        status: "failed", finished_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime, error_message: msg,
      }).eq("id", runId);
    }

    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
