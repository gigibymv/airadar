import { afterEach, describe, expect, it, vi } from "vitest";
import { callAI } from "./ai";

const ok = (text = "result") => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }), { status: 200 });
const failure = (status: number) => new Response(JSON.stringify({ error: { message: `provider failure ${status}` } }), { status });

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("AI Radar free model failover", () => {
  it("uses Flash and sends the key in a header, outside the URL", async () => {
    const fetch = vi.fn().mockResolvedValue(ok());
    vi.stubGlobal("fetch", fetch);
    expect(await callAI("test-key", "summarize")).toBe("result");
    expect(fetch).toHaveBeenCalledOnce();
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent");
    expect(init.headers["x-goog-api-key"]).toBe("test-key");
    expect(url).not.toContain("test-key");
  });

  it("recovers from repeated Flash overload with Flash-Lite", async () => {
    vi.useFakeTimers();
    const fetch = vi.fn().mockImplementation(async (url: string) => url.includes("flash-lite") ? ok("lite result") : failure(503));
    vi.stubGlobal("fetch", fetch);
    const result = callAI("test-key", "summarize");
    await vi.runAllTimersAsync();
    expect(await result).toBe("lite result");
    expect(fetch).toHaveBeenCalledTimes(4);
    expect(fetch.mock.calls.map(([url]) => url).join(" ")).not.toContain("gemini-1.5");
  });

  it("tries the supported fallback when the primary model is unavailable", async () => {
    const fetch = vi.fn().mockResolvedValueOnce(failure(404)).mockResolvedValueOnce(ok());
    vi.stubGlobal("fetch", fetch);
    expect(await callAI("test-key", "summarize")).toBe("result");
    expect(fetch.mock.calls[1][0]).toContain("gemini-2.5-flash-lite:");
  });

  it("preserves both provider errors when neither model works", async () => {
    const fetch = vi.fn().mockResolvedValueOnce(failure(400)).mockResolvedValueOnce(failure(403));
    vi.stubGlobal("fetch", fetch);
    await expect(callAI("test-key", "summarize")).rejects.toThrow(/gemini-2.5-flash \[400\][\s\S]*gemini-2.5-flash-lite \[403\]/);
  });

  it("fails before sending a request when the key is missing", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    await expect(callAI(undefined, "summarize")).rejects.toThrow("GEMINI_API_KEY is not configured");
    expect(fetch).not.toHaveBeenCalled();
  });
});
