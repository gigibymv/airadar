import { describe, it, expect } from "vitest";
import { decodeHtmlEntities } from "@/lib/text";

describe("decodeHtmlEntities", () => {
  it("decodes &amp;", () => {
    expect(decodeHtmlEntities("AT&amp;T")).toBe("AT&T");
  });

  it("decodes &lt; and &gt;", () => {
    expect(decodeHtmlEntities("&lt;div&gt;")).toBe("<div>");
  });

  it("decodes &quot;", () => {
    expect(decodeHtmlEntities('say &quot;hello&quot;')).toBe('say "hello"');
  });

  it("decodes &apos;", () => {
    expect(decodeHtmlEntities("it&apos;s")).toBe("it's");
  });

  it("decodes &#39;", () => {
    expect(decodeHtmlEntities("it&#39;s")).toBe("it's");
  });

  it("decodes &#x27;", () => {
    expect(decodeHtmlEntities("it&#x27;s")).toBe("it's");
  });

  it("leaves plain text unchanged", () => {
    expect(decodeHtmlEntities("hello world")).toBe("hello world");
  });

  it("handles empty string", () => {
    expect(decodeHtmlEntities("")).toBe("");
  });

  it("handles multiple entities in one string", () => {
    expect(decodeHtmlEntities("&lt;b&gt;bold &amp; clear&lt;/b&gt;")).toBe(
      "<b>bold & clear</b>"
    );
  });

  it("leaves unknown entities unchanged", () => {
    expect(decodeHtmlEntities("&nbsp;")).toBe("&nbsp;");
  });
});
