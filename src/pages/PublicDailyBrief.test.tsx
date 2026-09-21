import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { PublicDailyBrief } from "@/pages/PublicDailyBrief";
import { useAuth } from "@/hooks/useAuth";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/features/tabs/DailyBriefTab", () => ({
  DailyBriefTab: ({ showBookmarkControls }: { showBookmarkControls?: boolean }) => (
    <div>Bookmark controls: {String(showBookmarkControls)}</div>
  ),
}));

const mockedUseAuth = vi.mocked(useAuth);

function renderPage() {
  return render(
    <MemoryRouter>
      <PublicDailyBrief />
    </MemoryRouter>
  );
}

describe("PublicDailyBrief", () => {
  it("shows the daily brief without a session and keeps bookmark controls unavailable", () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      displayName: "",
      signOut: vi.fn(async () => {}),
      updateDisplayName: vi.fn(async () => {}),
    });

    renderPage();

    expect(screen.getByText("Bookmark controls: false")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/auth");
  });

  it("links an authenticated reader to the full app", () => {
    mockedUseAuth.mockReturnValue({
      user: { id: "user-1" } as User,
      session: null,
      loading: false,
      displayName: "mv",
      signOut: vi.fn(async () => {}),
      updateDisplayName: vi.fn(async () => {}),
    });

    renderPage();

    expect(screen.getByRole("link", { name: "Open my Radar" })).toHaveAttribute("href", "/app");
  });
});
