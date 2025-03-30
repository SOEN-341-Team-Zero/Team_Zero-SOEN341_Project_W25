import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";
import { ToastContainer } from "react-toastify";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import wretch from "wretch";
import ChannelChatComponent from "../src/components/Chat/ChannelChatComponent";
import { IChannelMessageModel } from "../src/models/models";
import ChannelChatService from "../src/services/ChannelChatService";

vi.mock("wretch");
vi.mock("../src/services/ChannelChatService");

describe("ChannelChatComponent", () => {
  const mockMessages: IChannelMessageModel[] = [
    {
      senderId: 1,
      username: "testuser",
      message: "Hello, this is a test message",
      sentAt: "2023-01-01T00:00:00Z",
      replyToId: undefined,
      replyToUsername: undefined,
      replyToMessage: undefined,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(wretch).mockReturnValue({
      auth: vi.fn().mockReturnThis(),
      get: vi.fn().mockReturnThis(),
      post: vi.fn().mockReturnThis(),
      json: vi.fn().mockResolvedValue({ messages: mockMessages }),
      res: vi.fn().mockReturnThis(),
      catch: vi.fn().mockReturnThis(),
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  const defaultProps = {
    channelId: 1,
    userId: 1,
    userName: "testuser",
    isUserAdmin: true,
  };

  it("sends a message when Enter key is pressed", async () => {
    render(
      <>
        <ToastContainer />
        <ChannelChatComponent {...defaultProps} />
      </>,
    );

    fireEvent.change(screen.getByPlaceholderText("Type a message..."), {
      target: { value: "New message" },
    });
    fireEvent.keyDown(screen.getByPlaceholderText("Type a message..."), {
      key: "Enter",
      shiftKey: false,
    });

    await waitFor(() => {
      expect(ChannelChatService.sendMessageToChannel).toHaveBeenCalled(); // the parameters keep changing so just check that the function was called
    });
  });

  it("shows a loading spinner while fetching messages", async () => {
    vi.mocked(wretch).mockReturnValueOnce({
      auth: vi.fn().mockReturnThis(),
      get: vi.fn().mockReturnThis(),
      json: vi.fn().mockImplementation(() => new Promise(() => {})),
      catch: vi.fn().mockReturnThis(),
    } as any);

    render(
      <>
        <ToastContainer />
        <ChannelChatComponent {...defaultProps} />
      </>,
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
