import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import SideBar from "../src/components/Sidebar/SideBar";
import { useApplicationStore } from "../src/stores/ApplicationStore";
import { BrowserRouter as Router } from "react-router-dom";
import React from "react";
import "@testing-library/jest-dom/vitest";

vi.mock("../src/stores/ApplicationStore");

describe("SideBar", () => {
  const mockLogout = vi.fn();
  const mockHandleDrawerToggle = vi.fn();

  const defaultProps = {
    drawerVariant: "permanent" as "permanent",
    drawerOpen: true,
    handleDrawerToggle: mockHandleDrawerToggle,
    isUserAdmin: true,
    logout: mockLogout,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useApplicationStore).mockReturnValue({
      teams: [],
      setViewMode: vi.fn(),
      setSelectedTeam: vi.fn(),
    });
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

  it("calls logout and navigates to '/' when LogoutIcon is clicked", () => {
    render(
      <Router>
        <SideBar {...defaultProps} />
      </Router>,
    );

    fireEvent.click(screen.getByTestId("sidebar-logout-button"));
    expect(mockLogout).toHaveBeenCalled();
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
