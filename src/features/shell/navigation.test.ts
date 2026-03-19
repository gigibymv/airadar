import { describe, expect, it } from "vitest";
import { appNavItems, appTabs } from "@/features/shell/navigation";

describe("navigation invariants", () => {
  it("keeps the expected enabled tab order", () => {
    expect(appTabs.map((item) => item.tab)).toEqual([
      "briefing",
      "community",
      "usecases",
      "saved",
      "settings",
    ]);
  });

  it("keeps settings as enabled tab", () => {
    const settings = appNavItems.find((item) => item.key === "settings");
    expect(settings).toBeDefined();
    expect(settings?.enabled).toBe(true);
    expect(settings?.tab).toBe("settings");
  });
});
