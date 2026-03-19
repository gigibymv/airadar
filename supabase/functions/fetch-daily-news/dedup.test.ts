import { describe, it, expect } from "vitest";
import {
  normalizeTitle,
  titleBigrams,
  diceCoefficient,
  isSimilarTitle,
  deduplicateBatch,
} from "./dedup";

describe("normalizeTitle", () => {
  it("lowercases and trims", () => {
    expect(normalizeTitle("  OpenAI  ")).toBe("openai");
  });

  it("strips punctuation", () => {
    const result = normalizeTitle("OpenAI's GPT-5: A New Era!");
    // Apostrophe and hyphen become spaces — words split, not merged
    expect(result).toContain("openai");
    expect(result).toContain("gpt");
    expect(result).not.toContain("'");
    expect(result).not.toContain("!");
    expect(result).not.toContain(":");
    expect(result).not.toContain("-");
  });

  it("removes stopwords", () => {
    const result = normalizeTitle("The Future of AI in the World");
    expect(result).not.toContain("the");
    expect(result).not.toContain("of");
    expect(result).not.toContain("in");
    expect(result).toContain("future");
    expect(result).toContain("ai");
    expect(result).toContain("world");
  });

  it("normalises AI acronym variants", () => {
    expect(normalizeTitle("LLMs are here")).toContain("llm");
    expect(normalizeTitle("LLMs are here")).not.toContain("llms");
  });

  it("handles empty string", () => {
    expect(normalizeTitle("")).toBe("");
  });

  it("handles single word", () => {
    expect(normalizeTitle("AI")).toBe("ai");
  });
});

describe("diceCoefficient", () => {
  it("returns 1.0 for identical sets", () => {
    const s = new Set(["a b", "b c", "c d"]);
    expect(diceCoefficient(s, s)).toBe(1.0);
  });

  it("returns 0.0 for completely different sets", () => {
    const a = new Set(["hello world"]);
    const b = new Set(["foo bar"]);
    expect(diceCoefficient(a, b)).toBe(0.0);
  });

  it("returns 1.0 for two empty sets", () => {
    expect(diceCoefficient(new Set(), new Set())).toBe(1.0);
  });

  it("returns 0.0 when one set is empty", () => {
    expect(diceCoefficient(new Set(["a b"]), new Set())).toBe(0.0);
  });

  it("returns a partial score for partial overlap", () => {
    const a = new Set(["openai gpt", "gpt model"]);
    const b = new Set(["openai gpt", "gpt launched"]);
    const score = diceCoefficient(a, b);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });
});

describe("isSimilarTitle", () => {
  it("detects exact match after normalisation", () => {
    const existing = new Set(["google launches gemini flash"]);
    expect(isSimilarTitle("Google Launches Gemini Flash", existing)).toBe(true);
  });

  it("detects same story with minor wording differences", () => {
    // Enough shared bigrams (≥ 0.65 Dice) despite one word change and one addition
    const existing = new Set([
      normalizeTitle("Anthropic Launches Claude 3.7 Sonnet with Extended Thinking"),
    ]);
    expect(
      isSimilarTitle(
        "Anthropic Releases Claude 3.7 Sonnet Extended Thinking Feature",
        existing,
      ),
    ).toBe(true);
  });

  it("does NOT match clearly different stories", () => {
    const existing = new Set([normalizeTitle("Google Cloud Opens New Data Center in Singapore")]);
    expect(isSimilarTitle("Meta Releases Llama 4 Open Source Model", existing)).toBe(false);
  });

  it("returns false for empty title", () => {
    const existing = new Set(["some title here"]);
    expect(isSimilarTitle("", existing)).toBe(false);
  });

  it("returns false against empty set", () => {
    expect(isSimilarTitle("Anthropic Launches Claude 4", new Set())).toBe(false);
  });

  it("handles single-word titles without crashing", () => {
    const existing = new Set([normalizeTitle("AI")]);
    expect(isSimilarTitle("AI", existing)).toBe(true);
  });
});

describe("deduplicateBatch", () => {
  it("keeps all items when no duplicates", () => {
    const items = [
      { title: "OpenAI Launches GPT-5", url: "https://a.com/1" },
      { title: "Meta Releases Llama 4", url: "https://b.com/2" },
    ];
    expect(deduplicateBatch(items, "test")).toHaveLength(2);
  });

  it("removes intra-batch near-duplicates, keeping first", () => {
    const items = [
      { title: "Anthropic Launches Claude 3.7 Sonnet with Extended Thinking", url: "https://a.com/1" },
      { title: "Anthropic Releases Claude 3.7 Sonnet Extended Thinking Feature", url: "https://b.com/2" },
      { title: "Meta Releases Llama 4 Open Source", url: "https://c.com/3" },
    ];
    const result = deduplicateBatch(items, "test");
    expect(result).toHaveLength(2);
    expect(result[0].url).toBe("https://a.com/1");
    expect(result[1].url).toBe("https://c.com/3");
  });

  it("returns empty array for empty input", () => {
    expect(deduplicateBatch([], "test")).toHaveLength(0);
  });
});
