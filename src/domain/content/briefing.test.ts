import { describe, it, expect } from "vitest";
import { toExecutiveBriefingViewModel } from "@/domain/content/briefing";

function makeRawBriefing(overrides = {}) {
  return {
    id: "brief-1",
    published_date: "2026-03-18",
    global_items: [
      {
        title: "AI breakthrough",
        sources: ["Reuters"],
        source_urls: ["https://reuters.com/1"],
        earliest_source_date: "2026-03-18",
        summary: "Something happened",
        strategic_implications: "Big deal",
        concept_explained: "What it means",
        why_it_matters_now: "Because reasons",
      },
    ],
    africa_items: null,
    africa_no_update: true,
    signals_to_watch: ["signal one", "signal two"],
    ...overrides,
  };
}

describe("toExecutiveBriefingViewModel", () => {
  it("maps all top-level fields", () => {
    const result = toExecutiveBriefingViewModel(makeRawBriefing());
    expect(result.id).toBe("brief-1");
    expect(result.published_date).toBe("2026-03-18");
    expect(result.africa_no_update).toBe(true);
    expect(result.africa_items).toBeNull();
    expect(result.signals_to_watch).toEqual(["signal one", "signal two"]);
  });

  it("maps global_items correctly", () => {
    const result = toExecutiveBriefingViewModel(makeRawBriefing());
    expect(result.global_items).toHaveLength(1);
    const item = result.global_items[0];
    expect(item.title).toBe("AI breakthrough");
    expect(item.sources).toEqual(["Reuters"]);
    expect(item.source_urls).toEqual(["https://reuters.com/1"]);
    expect(item.earliest_source_date).toBe("2026-03-18");
    expect(item.summary).toBe("Something happened");
    expect(item.strategic_implications).toBe("Big deal");
    expect(item.concept_explained).toBe("What it means");
    expect(item.why_it_matters_now).toBe("Because reasons");
  });

  it("decodes HTML entities in briefing item fields", () => {
    const result = toExecutiveBriefingViewModel(
      makeRawBriefing({
        global_items: [
          {
            title: "AI &amp; ML",
            sources: ["Tech &amp; Co"],
            source_urls: [],
            earliest_source_date: null,
            summary: "Less &lt;noise&gt;",
            strategic_implications: "Big &amp; bold",
            concept_explained: null,
            why_it_matters_now: "Because &lt;reasons&gt;",
          },
        ],
      })
    );
    const item = result.global_items[0];
    expect(item.title).toBe("AI & ML");
    expect(item.sources).toEqual(["Tech & Co"]);
    expect(item.summary).toBe("Less <noise>");
    expect(item.strategic_implications).toBe("Big & bold");
    expect(item.why_it_matters_now).toBe("Because <reasons>");
  });

  it("maps africa_items when present", () => {
    const result = toExecutiveBriefingViewModel(
      makeRawBriefing({
        africa_items: [
          {
            title: "Africa update",
            sources: [],
            source_urls: [],
            earliest_source_date: null,
            summary: "Local news",
            strategic_implications: "Regional impact",
            concept_explained: null,
            why_it_matters_now: "Timely",
          },
        ],
        africa_no_update: false,
      })
    );
    expect(result.africa_items).toHaveLength(1);
    expect(result.africa_items![0].title).toBe("Africa update");
    expect(result.africa_no_update).toBe(false);
  });

  it("filters out items with empty or missing titles", () => {
    const result = toExecutiveBriefingViewModel(
      makeRawBriefing({
        global_items: [
          { title: "", sources: [], source_urls: [], summary: "", strategic_implications: "", why_it_matters_now: "" },
          { title: "   ", sources: [], source_urls: [], summary: "", strategic_implications: "", why_it_matters_now: "" },
          { title: "Valid item", sources: [], source_urls: [], summary: "", strategic_implications: "", why_it_matters_now: "" },
        ],
      })
    );
    expect(result.global_items).toHaveLength(1);
    expect(result.global_items[0].title).toBe("Valid item");
  });

  it("returns empty global_items for non-array input", () => {
    const result = toExecutiveBriefingViewModel(makeRawBriefing({ global_items: null }));
    expect(result.global_items).toEqual([]);
  });

  it("returns empty signals_to_watch for non-array input", () => {
    const result = toExecutiveBriefingViewModel(makeRawBriefing({ signals_to_watch: null }));
    expect(result.signals_to_watch).toEqual([]);
  });

  it("sets concept_explained to null when missing", () => {
    const result = toExecutiveBriefingViewModel(makeRawBriefing());
    expect(result.global_items[0].concept_explained).toBe("What it means");

    const noConceptResult = toExecutiveBriefingViewModel(
      makeRawBriefing({
        global_items: [
          {
            title: "Item",
            sources: [],
            source_urls: [],
            earliest_source_date: null,
            summary: "s",
            strategic_implications: "i",
            concept_explained: null,
            why_it_matters_now: "w",
          },
        ],
      })
    );
    expect(noConceptResult.global_items[0].concept_explained).toBeNull();
  });
});
