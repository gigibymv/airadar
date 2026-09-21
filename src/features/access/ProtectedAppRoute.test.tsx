import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { ProtectedAppRoute } from "@/features/access/ProtectedAppRoute";
import { useAuth } from "@/hooks/useAuth";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

function renderProtectedRoute() {
  return render(
    <MemoryRouter initialEntries={["/app"]}>
      <Routes>
        <Route
          path="/app"
          element={
            <ProtectedAppRoute>
              <div>App Home</div>
            </ProtectedAppRoute>
          }
        />
        <Route path="/" element={<div>Public Daily Brief</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedAppRoute", () => {
  it("shows loading state while auth status is resolving", () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: true,
      displayName: "",
      signOut: vi.fn(async () => {}),
    });

    renderProtectedRoute();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("redirects unauthenticated users to the public daily brief", () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      displayName: "",
      signOut: vi.fn(async () => {}),
    });

    renderProtectedRoute();
    expect(screen.getByText("Public Daily Brief")).toBeInTheDocument();
  });

  it("renders protected content for authenticated users", () => {
    mockedUseAuth.mockReturnValue({
      user: {
        id: "user-1",
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
    } as User,
      session: null,
      loading: false,
      displayName: "mv",
      signOut: vi.fn(async () => {}),
    });

    renderProtectedRoute();
    expect(screen.getByText("App Home")).toBeInTheDocument();
  });
});
