import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SavedTab } from "@/features/tabs/SavedTab";

describe("SavedTab", () => {
  it("invites unauthenticated readers to sign in instead of exposing saved data", () => {
    render(
      <MemoryRouter>
        <SavedTab requiresSignIn />
      </MemoryRouter>
    );

    expect(screen.getByText("Sign in to save items and access your personal reading list.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in to save items" })).toHaveAttribute("href", "/auth");
  });
});
