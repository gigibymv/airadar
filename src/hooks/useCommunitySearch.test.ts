import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCommunitySearch } from "@/hooks/useCommunitySearch";

const mockInvoke = vi.hoisted(() => vi.fn());

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: { invoke: mockInvoke },
  },
}));

describe("useCommunitySearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts with empty state", () => {
    const { result } = renderHook(() => useCommunitySearch());

    expect(result.current.query).toBe("");
    expect(result.current.results).toEqual([]);
    expect(result.current.isSearching).toBe(false);
    expect(result.current.hasSearched).toBe(false);
  });

  it("updates query via setQuery", () => {
    const { result } = renderHook(() => useCommunitySearch());

    act(() => { result.current.setQuery("langchain"); });

    expect(result.current.query).toBe("langchain");
  });

  it("sets hasSearched and populates results on success", async () => {
    const fakeResults = [
      { id: "1", title: "LangChain repo", url: "https://github.com/langchain-ai/langchain" },
    ];
    mockInvoke.mockResolvedValue({ data: { results: fakeResults }, error: null });

    const { result } = renderHook(() => useCommunitySearch());

    await act(async () => { await result.current.search("langchain"); });

    expect(result.current.hasSearched).toBe(true);
    expect(result.current.results).toEqual(fakeResults);
    expect(result.current.isSearching).toBe(false);
  });

  it("returns empty results when data.results is missing", async () => {
    mockInvoke.mockResolvedValue({ data: {}, error: null });

    const { result } = renderHook(() => useCommunitySearch());

    await act(async () => { await result.current.search("anything"); });

    expect(result.current.results).toEqual([]);
    expect(result.current.hasSearched).toBe(true);
  });

  it("returns empty results and sets hasSearched on error", async () => {
    mockInvoke.mockRejectedValue(new Error("edge function error"));

    const { result } = renderHook(() => useCommunitySearch());

    await act(async () => { await result.current.search("fail"); });

    expect(result.current.results).toEqual([]);
    expect(result.current.hasSearched).toBe(true);
    expect(result.current.isSearching).toBe(false);
  });

  it("returns empty results when invoke returns an error object", async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: new Error("Function failed"),
    });

    const { result } = renderHook(() => useCommunitySearch());

    await act(async () => { await result.current.search("fail"); });

    expect(result.current.results).toEqual([]);
  });

  it("resets hasSearched and results on reset()", async () => {
    mockInvoke.mockResolvedValue({ data: { results: [{ id: "1" }] }, error: null });

    const { result } = renderHook(() => useCommunitySearch());

    await act(async () => { await result.current.search("langchain"); });
    expect(result.current.hasSearched).toBe(true);

    act(() => { result.current.reset(); });

    expect(result.current.hasSearched).toBe(false);
    expect(result.current.results).toEqual([]);
  });

  it("resets isSearching to false after completion", async () => {
    mockInvoke.mockResolvedValue({ data: { results: [] }, error: null });

    const { result } = renderHook(() => useCommunitySearch());

    await act(async () => { await result.current.search("test"); });

    expect(result.current.isSearching).toBe(false);
  });
});
