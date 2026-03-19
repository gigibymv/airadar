import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  normalizeNewsArticle,
  normalizeCommunityPost,
  normalizeTldrItem,
  toNewsItemViewModel,
  toCommunityPostViewModel,
  toTldrItemViewModel,
} from "@/domain/content/news";

const NOW = new Date("2026-03-18T12:00:00Z");

// Minimal raw row factories — only fields used by the mappers
function makeRawArticle(overrides = {}) {
  return {
    id: "art-1",
    title: "Test Article",
    summary: "A summary",
    takeaways: ["Point one", "Point two"],
    source: "TechCrunch",
    url: "https://example.com/article",
    category: "LLMs",
    created_at: new Date(NOW.getTime() - 60 * 60_000).toISOString(), // 1h ago
    is_breaking: false,
    ...overrides,
  };
}

function makeRawCommunityPost(overrides = {}) {
  return {
    id: "post-1",
    title: "Cool Repo",
    source: "github",
    subreddit: null,
    repo: "owner/repo",
    description: "Does something useful",
    how_it_helps: "Helps with X",
    author: "dev42",
    created_at: new Date(NOW.getTime() - 30 * 60_000).toISOString(), // 30m ago
    upvotes: null,
    stars: 120,
    comments: 5,
    url: "https://github.com/owner/repo",
    ...overrides,
  };
}

function makeRawTldrItem(overrides = {}) {
  return {
    id: "tldr-1",
    title: "Quick Summary",
    summary: "A short read",
    url: "https://example.com/tldr",
    read_time: "2 min",
    category: "tools",
    ...overrides,
  };
}

describe("normalizeNewsArticle", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(NOW); });
  afterEach(() => { vi.useRealTimers(); });

  it("maps all fields correctly", () => {
    const result = normalizeNewsArticle(makeRawArticle());
    expect(result.id).toBe("art-1");
    expect(result.title).toBe("Test Article");
    expect(result.summary).toBe("A summary");
    expect(result.takeaways).toEqual(["Point one", "Point two"]);
    expect(result.source).toBe("TechCrunch");
    expect(result.url).toBe("https://example.com/article");
    expect(result.isBreaking).toBe(false);
  });

  it("decodes HTML entities in title, summary, source, and takeaways", () => {
    const result = normalizeNewsArticle(
      makeRawArticle({
        title: "AI &amp; ML",
        summary: "Less &lt;noise&gt;",
        source: "Tech &amp; Co",
        takeaways: ["Step &amp; repeat", "Use &lt;code&gt;"],
      })
    );
    expect(result.title).toBe("AI & ML");
    expect(result.summary).toBe("Less <noise>");
    expect(result.source).toBe("Tech & Co");
    expect(result.takeaways).toEqual(["Step & repeat", "Use <code>"]);
  });

  it("handles null takeaways gracefully", () => {
    const result = normalizeNewsArticle(makeRawArticle({ takeaways: null }));
    expect(result.takeaways).toEqual([]);
  });

  it("normalizes known categories", () => {
    const categories = ["LLMs", "Robotics", "Research", "Industry", "Policy"];
    for (const cat of categories) {
      const result = normalizeNewsArticle(makeRawArticle({ category: cat }));
      expect(result.category).toBe(cat);
    }
  });

  it('defaults unknown category to "LLMs"', () => {
    const result = normalizeNewsArticle(makeRawArticle({ category: "Unknown" }));
    expect(result.category).toBe("LLMs");
  });
});

describe("toNewsItemViewModel", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(NOW); });
  afterEach(() => { vi.useRealTimers(); });

  it("produces a view model with timeAgo derived from createdAt", () => {
    const normalized = normalizeNewsArticle(makeRawArticle());
    const vm = toNewsItemViewModel(normalized);
    expect(vm.timeAgo).toBe("1h ago");
    expect(vm.id).toBe("art-1");
    expect(vm.title).toBe("Test Article");
  });
});

describe("normalizeCommunityPost", () => {
  it("maps GitHub post fields correctly", () => {
    const result = normalizeCommunityPost(makeRawCommunityPost());
    expect(result.id).toBe("post-1");
    expect(result.source).toBe("github");
    expect(result.repo).toBe("owner/repo");
    expect(result.subreddit).toBeUndefined();
    expect(result.stars).toBe(120);
    expect(result.upvotes).toBeUndefined();
  });

  it("maps Reddit post fields correctly", () => {
    const result = normalizeCommunityPost(
      makeRawCommunityPost({
        source: "reddit",
        subreddit: "r/MachineLearning",
        repo: null,
        upvotes: 450,
        stars: null,
      })
    );
    expect(result.source).toBe("reddit");
    expect(result.subreddit).toBe("r/MachineLearning");
    expect(result.repo).toBeUndefined();
    expect(result.upvotes).toBe(450);
    expect(result.stars).toBeUndefined();
  });

  it('defaults unknown source to "github"', () => {
    const result = normalizeCommunityPost(makeRawCommunityPost({ source: "twitter" }));
    expect(result.source).toBe("github");
  });

  it("decodes HTML entities in title, description, how_it_helps, author", () => {
    const result = normalizeCommunityPost(
      makeRawCommunityPost({
        title: "Repo &amp; Tools",
        description: "Does &lt;stuff&gt;",
        how_it_helps: "Saves &gt;50% time",
        author: "dev &amp; co",
      })
    );
    expect(result.title).toBe("Repo & Tools");
    expect(result.description).toBe("Does <stuff>");
    expect(result.howItHelps).toBe("Saves >50% time");
    expect(result.author).toBe("dev & co");
  });

  it("maps zero upvotes/stars to undefined", () => {
    const result = normalizeCommunityPost(
      makeRawCommunityPost({ upvotes: 0, stars: 0 })
    );
    expect(result.upvotes).toBeUndefined();
    expect(result.stars).toBeUndefined();
  });
});

describe("toCommunityPostViewModel", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(NOW); });
  afterEach(() => { vi.useRealTimers(); });

  it("adds timeAgo to the view model", () => {
    const normalized = normalizeCommunityPost(makeRawCommunityPost());
    const vm = toCommunityPostViewModel(normalized);
    expect(vm.timeAgo).toBe("30m ago");
    expect(vm.id).toBe("post-1");
  });
});

describe("normalizeTldrItem", () => {
  it("maps fields correctly", () => {
    const result = normalizeTldrItem(makeRawTldrItem());
    expect(result.id).toBe("tldr-1");
    expect(result.title).toBe("Quick Summary");
    expect(result.summary).toBe("A short read");
    expect(result.url).toBe("https://example.com/tldr");
    expect(result.readTime).toBe("2 min");
    expect(result.category).toBe("tools");
  });

  it("normalizes known tldr categories", () => {
    const categories = ["research", "tools", "launches", "headlines"];
    for (const cat of categories) {
      const result = normalizeTldrItem(makeRawTldrItem({ category: cat }));
      expect(result.category).toBe(cat);
    }
  });

  it('defaults unknown tldr category to "headlines"', () => {
    const result = normalizeTldrItem(makeRawTldrItem({ category: "misc" }));
    expect(result.category).toBe("headlines");
  });

  it("decodes HTML entities", () => {
    const result = normalizeTldrItem(
      makeRawTldrItem({ title: "AI &amp; the future", summary: "Less &lt;fluff&gt;" })
    );
    expect(result.title).toBe("AI & the future");
    expect(result.summary).toBe("Less <fluff>");
  });
});

describe("toTldrItemViewModel", () => {
  it("passes through all fields from normalized item", () => {
    const normalized = normalizeTldrItem(makeRawTldrItem());
    const vm = toTldrItemViewModel(normalized);
    expect(vm.id).toBe("tldr-1");
    expect(vm.title).toBe("Quick Summary");
    expect(vm.readTime).toBe("2 min");
    expect(vm.category).toBe("tools");
  });
});
