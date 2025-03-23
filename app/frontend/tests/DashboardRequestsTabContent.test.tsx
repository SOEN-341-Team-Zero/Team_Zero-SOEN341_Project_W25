import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { ToastContainer } from "react-toastify";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DashboardRequestsTabContent from "../src/components/Dashboard/DashboardRequestsTabContent";
import { IChannelRequestModel, IUserModel } from "../src/models/models";
import wretch from "wretch";

vi.mock("wretch");

describe("DashboardRequestsTabContent", () => {
  const mockRequests: IChannelRequestModel[] = [
    {
      request_id: 1,
      requester_id: 2,
      requester_name: "John Doe",
      channel_owner_id: 3,
      channel_id: 4,
      channel_name: "General",
      team_name: "Team Zero",
      created_at: "2023-01-01T00:00:00Z",
    },
  ];

  const mockUsers: IUserModel[] = [
    {
      user_id: 1,
      username: "testuser",
      activity: "Online",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(wretch).mockReturnValue({
      auth: vi.fn().mockReturnThis(),
      get: vi.fn().mockReturnThis(),
      json: vi.fn().mockImplementation((callback) => {
        if (callback.toString().includes("requests")) {
          return Promise.resolve(mockRequests);
        } else if (callback.toString().includes("getallusers")) {
          return Promise.resolve(mockUsers);
        }
        return Promise.resolve([]);
      }),
      catch: vi.fn().mockReturnThis(),
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the DashboardRequestsTabContent component", async () => {
    render(
      <>
        <ToastContainer />
        <DashboardRequestsTabContent />
      </>,
    );

    await waitFor(() => {
      expect(
        screen.getByText("You do not have any pending requests at the moment."),
      ).toBeInTheDocument();
    });
  });

  it("shows an error toast on failed requests fetch", async () => {
    vi.mocked(wretch).mockReturnValueOnce({
      auth: vi.fn().mockReturnThis(),
      get: vi.fn().mockReturnThis(),
      json: vi.fn().mockRejectedValue(new Error("Network error")),
      catch: vi.fn().mockImplementation((callback) => {
        callback(new Error("Network error"));
        return this;
      }),
    } as any);

    render(
      <>
        <ToastContainer />
        <DashboardRequestsTabContent />
      </>,
    );

    await waitFor(() => {
      expect(screen.getByText("An error has occurred.")).toBeInTheDocument();
    });
  });

  it("shows an error toast on failed users fetch", async () => {
    vi.mocked(wretch).mockReturnValueOnce({
      auth: vi.fn().mockReturnThis(),
      get: vi.fn().mockReturnThis(),
      json: vi.fn().mockImplementation((callback) => {
        if (callback.toString().includes("requests")) {
          return Promise.resolve(mockRequests);
        }
        return Promise.reject(new Error("Network error"));
      }),
      catch: vi.fn().mockImplementation((callback) => {
        callback(new Error("Network error"));
        return this;
      }),
    } as any);

    render(
      <>
        <ToastContainer />
        <DashboardRequestsTabContent />
      </>,
    );

    await waitFor(() => {
      expect(screen.getByText("An error has occurred.")).toBeInTheDocument();
    });
  });
});
