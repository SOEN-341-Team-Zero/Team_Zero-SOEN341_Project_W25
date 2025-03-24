import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { ToastContainer } from "react-toastify";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CreateTeamButton from "../src/components/Buttons/CreateTeamButton";
import { useApplicationStore } from "../src/stores/ApplicationStore";

vi.mock("../src/stores/ApplicationStore");

describe("CreateTeamButton", () => {
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

  it("renders the CreateTeamButton", () => {
    render(
      <>
        <ToastContainer />
        <CreateTeamButton />
      </>,
    );
    expect(
      screen.getByTestId("sidebar-create-team-button"),
    ).toBeInTheDocument();
  });

  it("opens the dialog when the button is clicked", () => {
    render(
      <>
        <ToastContainer />
        <CreateTeamButton />
      </>,
    );
    fireEvent.click(screen.getByTestId("sidebar-create-team-button"));
    expect(screen.getByText("Create a team")).toBeInTheDocument();
  });
});
