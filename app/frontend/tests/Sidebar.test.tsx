import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import SideBar from "../src/components/Sidebar/SideBar";
import { useApplicationStore } from "../src/stores/ApplicationStore";
import { BrowserRouter as Router, useNavigate } from "react-router-dom";
import React from "react";
import "@testing-library/jest-dom/vitest";

vi.mock("../src/stores/ApplicationStore");

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe("SideBar", () => {
  const mockSetIsDrawerOpen = vi.fn();
  const mockNavigate = vi.fn();

  const defaultProps = {
    drawerVariant: "permanent" as "permanent",
    isDrawerOpen: true,
    setIsDrawerOpen: mockSetIsDrawerOpen,
    isUserAdmin: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useApplicationStore).mockReturnValue({
      teams: [],
      setViewMode: vi.fn(),
      setSelectedTeam: vi.fn(),
    });
    vi.mocked(useNavigate).mockReturnValue(mockNavigate); // Mock useNavigate
  });

  afterEach(() => {
    cleanup();
  });

  it("renders without crashing", () => {
    render(
      <Router>
        <SideBar {...defaultProps} />
      </Router>,
    );
    expect(
      screen.getByRole("button", { name: /direct messages/i }),
    ).toBeInTheDocument();
  });

  it("calls setViewMode with 'dashboard' when PersonIcon is clicked", () => {
    const setViewMode = vi.fn();
    vi.mocked(useApplicationStore).mockReturnValue({
      ...useApplicationStore(),
      setViewMode,
    });

    render(
      <Router>
        <SideBar {...defaultProps} />
      </Router>,
    );

    fireEvent.click(screen.getByTestId("sidebar-dashboard-button"));
    expect(setViewMode).toHaveBeenCalledWith("dashboard");
  });

  it("calls handleLogOut and navigates to '/login' when LogoutIcon is clicked", async () => {
    render(
      <Router>
        <SideBar {...defaultProps} />
      </Router>,
    );

    fireEvent.click(screen.getByTestId("sidebar-logout-button"));

    // Add a delay to account for the setTimeout in handleLogOut
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  it("renders CreateTeamButton if user is admin", () => {
    render(
      <Router>
        <SideBar {...defaultProps} />
      </Router>,
    );
    expect(
      screen.getByTestId("sidebar-create-team-button"),
    ).toBeInTheDocument();
  });

  it("does not render CreateTeamButton if user is not admin", () => {
    render(
      <Router>
        <SideBar {...defaultProps} isUserAdmin={false} />
      </Router>,
    );
    expect(
      screen.queryByRole("button", { name: /create team/i }),
    ).not.toBeInTheDocument();
  });
});
