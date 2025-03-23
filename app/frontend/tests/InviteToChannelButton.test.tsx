import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { ToastContainer } from "react-toastify";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import InviteToChannelButton from "../src/components/Buttons/InviteToChannelButton";
import { useApplicationStore } from "../src/stores/ApplicationStore";

vi.mock("../src/stores/ApplicationStore");

describe("InviteToChannelButton", () => {
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
    channelId: 1,
    channelName: "testchannel",
    channelPub: true,
    displayButton: true,
  };

  it("renders the InviteToChannelButton", () => {
    render(
      <>
        <ToastContainer />
        <InviteToChannelButton {...defaultProps} />
      </>,
    );
    expect(
      screen.getByLabelText("Manage users in this channel"),
    ).toBeInTheDocument();
  });

  it("opens the dialog when the button is clicked", () => {
    render(
      <>
        <ToastContainer />
        <InviteToChannelButton {...defaultProps} />
      </>,
    );
    fireEvent.click(screen.getByLabelText("Manage users in this channel"));
    expect(screen.getByText("Manage Users in testchannel")).toBeInTheDocument();
  });
});
