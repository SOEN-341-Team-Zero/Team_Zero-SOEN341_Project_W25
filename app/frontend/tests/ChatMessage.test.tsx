import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ChatMessage from "../src/components/Chat/ChatMessage";
import { IChannelMessageModel } from "../src/models/models";
import React from "react";
import "@testing-library/jest-dom/vitest";

describe("ChatMessage", () => {
  const mockOnReply = vi.fn();

  const defaultProps = {
    message: {
      senderId: 1,
      username: "testuser",
      message: "Hello, this is a test message",
      replyToId: undefined,
      replyToUsername: undefined,
      replyToMessage: undefined,
    } as IChannelMessageModel,
    id: 1,
    userId: 1,
    onReply: mockOnReply,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the message from the current user", () => {
    render(<ChatMessage {...defaultProps} />);
    expect(
      screen.getByText("Hello, this is a test message"),
    ).toBeInTheDocument();
    expect(screen.getByText("testuser")).toBeInTheDocument();
  });

  it("renders the message from another user", () => {
    const props = {
      ...defaultProps,
      message: { ...defaultProps.message, senderId: 2, username: "otheruser" },
    };
    render(<ChatMessage {...props} />);
    expect(
      screen.getByText("Hello, this is a test message"),
    ).toBeInTheDocument();
    expect(screen.getByText("otheruser")).toBeInTheDocument();
  });

  it("calls onReply when the reply button is clicked", () => {
    render(<ChatMessage {...defaultProps} />);
    fireEvent.click(screen.getByRole("button"));
    expect(mockOnReply).toHaveBeenCalledWith(1);
  });

  it("renders a reply message if replyToId, replyToUsername, and replyToMessage are provided", () => {
    const props = {
      ...defaultProps,
      message: {
        ...defaultProps.message,
        replyToId: 2,
        replyToUsername: "replyuser",
        replyToMessage: "This is a reply message",
      },
    };
    render(<ChatMessage {...props} />);
    expect(screen.getByText("This is a reply message")).toBeInTheDocument();
    expect(screen.getByText("@replyuser")).toBeInTheDocument();
  });

  it("does not render a reply message if replyToId, replyToUsername, and replyToMessage are not provided", () => {
    render(<ChatMessage {...defaultProps} />);
    expect(
      screen.queryByText("This is a reply message"),
    ).not.toBeInTheDocument();
  });
});
