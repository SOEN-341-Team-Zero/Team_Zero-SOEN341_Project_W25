import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { ToastContainer } from "react-toastify";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CreateChannelButton from "../src/components/Buttons/CreateChannelButton";
import { useApplicationStore } from "../src/stores/ApplicationStore";

vi.mock("../src/stores/ApplicationStore");

describe("CreateChannelButton", () => {
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
  };

  it("renders the CreateChannelButton", () => {
    render(
      <>
        <ToastContainer />
        <CreateChannelButton {...defaultProps} />
      </>,
    );
    expect(screen.getByTestId("create-channel-button")).toBeInTheDocument();
  });

  it("opens the dialog when the button is clicked", () => {
    render(
      <>
        <ToastContainer />
        <CreateChannelButton {...defaultProps} />
      </>,
    );
    fireEvent.click(screen.getByTestId("create-channel-button"));
    expect(screen.getByLabelText("Channel Name")).toBeInTheDocument();
  });
});
