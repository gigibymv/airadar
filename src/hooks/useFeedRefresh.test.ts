import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFeedRefresh } from "@/hooks/useFeedRefresh";

const mockInvoke = vi.hoisted(() => vi.fn());

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: { invoke: mockInvoke },
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { toast } from "sonner";

describe("useFeedRefresh", () => {
  const onRefreshed = vi.fn().mockResolvedValue(undefined);
  const onShowAllNewsReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts with isRefreshing false", () => {
    const { result } = renderHook(() =>
      useFeedRefresh({ onRefreshed, onShowAllNewsReset })
    );
    expect(result.current.isRefreshing).toBe(false);
  });

  it("calls onShowAllNewsReset and onRefreshed on success", async () => {
    mockInvoke.mockResolvedValue({
      data: { counts: { news: 5, community: 3, use_cases: 2 } },
      error: null,
    });

    const { result } = renderHook(() =>
      useFeedRefresh({ onRefreshed, onShowAllNewsReset })
    );

    await act(async () => { await result.current.refresh(); });

    expect(onShowAllNewsReset).toHaveBeenCalledOnce();
    expect(onRefreshed).toHaveBeenCalledOnce();
    expect(toast.success).toHaveBeenCalledWith(
      "Feed refreshed (5 news, 3 community, 2 use cases)"
    );
  });

  it("shows generic success toast when counts are missing", async () => {
    mockInvoke.mockResolvedValue({ data: {}, error: null });

    const { result } = renderHook(() =>
      useFeedRefresh({ onRefreshed, onShowAllNewsReset })
    );

    await act(async () => { await result.current.refresh(); });

    expect(toast.success).toHaveBeenCalledWith("Feed refreshed with latest articles");
  });

  it("shows quota error when data.success is false with 429 message", async () => {
    mockInvoke.mockResolvedValue({
      data: { success: false, error: "429 quota exceeded" },
      error: null,
    });

    const { result } = renderHook(() =>
      useFeedRefresh({ onRefreshed, onShowAllNewsReset })
    );

    await act(async () => { await result.current.refresh(); });

    expect(toast.error).toHaveBeenCalledWith(
      "AI quota reached — refresh resets daily at midnight."
    );
    expect(onRefreshed).not.toHaveBeenCalled();
  });

  it("shows quota error when data.success is false with RESOURCE_EXHAUSTED message", async () => {
    mockInvoke.mockResolvedValue({
      data: { success: false, error: "RESOURCE_EXHAUSTED: limit hit" },
      error: null,
    });

    const { result } = renderHook(() =>
      useFeedRefresh({ onRefreshed, onShowAllNewsReset })
    );

    await act(async () => { await result.current.refresh(); });

    expect(toast.error).toHaveBeenCalledWith(
      "AI quota reached — refresh resets daily at midnight."
    );
  });

  it("shows specific error message when data.success is false with other error", async () => {
    mockInvoke.mockResolvedValue({
      data: { success: false, error: "Something went wrong with the pipeline" },
      error: null,
    });

    const { result } = renderHook(() =>
      useFeedRefresh({ onRefreshed, onShowAllNewsReset })
    );

    await act(async () => { await result.current.refresh(); });

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("Refresh failed:")
    );
  });

  it("shows quota error on thrown 429 network error", async () => {
    mockInvoke.mockRejectedValue(new Error("429 rate limit"));

    const { result } = renderHook(() =>
      useFeedRefresh({ onRefreshed, onShowAllNewsReset })
    );

    await act(async () => { await result.current.refresh(); });

    expect(toast.error).toHaveBeenCalledWith(
      "AI quota reached — refresh resets daily at midnight."
    );
  });

  it("shows generic error on unknown network failure", async () => {
    mockInvoke.mockRejectedValue(new Error("network timeout"));

    const { result } = renderHook(() =>
      useFeedRefresh({ onRefreshed, onShowAllNewsReset })
    );

    await act(async () => { await result.current.refresh(); });

    expect(toast.error).toHaveBeenCalledWith("Failed to refresh feed");
  });

  it("shows error when invoke returns an error object", async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: new Error("Function invocation failed"),
    });

    const { result } = renderHook(() =>
      useFeedRefresh({ onRefreshed, onShowAllNewsReset })
    );

    await act(async () => { await result.current.refresh(); });

    expect(toast.error).toHaveBeenCalled();
    expect(onRefreshed).not.toHaveBeenCalled();
  });

  it("resets isRefreshing to false after completion", async () => {
    mockInvoke.mockResolvedValue({ data: {}, error: null });

    const { result } = renderHook(() =>
      useFeedRefresh({ onRefreshed, onShowAllNewsReset })
    );

    await act(async () => { await result.current.refresh(); });

    expect(result.current.isRefreshing).toBe(false);
  });

  it("works without optional onShowAllNewsReset", async () => {
    mockInvoke.mockResolvedValue({ data: {}, error: null });

    const { result } = renderHook(() =>
      useFeedRefresh({ onRefreshed })
    );

    await act(async () => { await result.current.refresh(); });

    expect(toast.success).toHaveBeenCalled();
  });
});
