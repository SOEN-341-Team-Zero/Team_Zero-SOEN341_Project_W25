import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { ToastContainer } from "react-toastify";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import InviteToTeamButton from "../src/components/Buttons/InviteToTeamButton";
import { useApplicationStore } from "../src/stores/ApplicationStore";

vi.mock("../src/stores/ApplicationStore");

describe("InviteToTeamButton", () => {
  const mockRefetchTeamChannelsState = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useApplicationStore).mockReturnValue({
      refetchTeamChannelsState: mockRefetchTeamChannelsState,
    });
  });

  afterEach(() => {
    cleanup();
  });

  const defaultProps = {
    teamId: 1,
    teamName: "testteam",
  };

  it("renders the InviteToTeamButton", () => {
    render(
      <>
        <ToastContainer />
        <InviteToTeamButton {...defaultProps} />
      </>,
    );
    expect(
      screen.getByLabelText("Manage users in this team"),
    ).toBeInTheDocument();
  });

  it("opens the dialog when the button is clicked", () => {
    render(
      <>
        <ToastContainer />
        <InviteToTeamButton {...defaultProps} />
      </>,
    );
    fireEvent.click(screen.getByLabelText("Manage users in this team"));
    expect(screen.getByText("Add Users to testteam")).toBeInTheDocument();
  });
});
