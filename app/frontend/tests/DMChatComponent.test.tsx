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
import DMChatComponent from "../src/components/Chat/DMChatComponent";
import { IChannelMessageModel } from "../src/models/models";
import DMChatService from "../src/services/DMChatService";

vi.mock("wretch");
vi.mock("../src/services/DMChatService");

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserver);


describe("DMChatComponent", () => {
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
    dmId: 1,
    userId: 1,
    userName: "testuser",
  };

  it("sends a message when Enter key is pressed", async () => {
    render(
      <>
        <ToastContainer />
        <DMChatComponent {...defaultProps} />
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
      expect(DMChatService.sendMessageToDM).toHaveBeenCalledWith(
        1,
        "New message",
        null,
        undefined
      );
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
        <DMChatComponent {...defaultProps} />
      </>,
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
