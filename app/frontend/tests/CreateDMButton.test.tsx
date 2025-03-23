import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { ToastContainer } from "react-toastify";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CreateDMButton from "../src/components/Buttons/CreateDMButton";
import { useApplicationStore } from "../src/stores/ApplicationStore";

vi.mock("../src/stores/ApplicationStore");

describe("CreateDMButton", () => {
  const mockRefetchDMChannelsState = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useApplicationStore).mockReturnValue({
      refetchDMChannelsState: mockRefetchDMChannelsState,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the CreateDMButton", () => {
    render(
      <>
        <ToastContainer />
        <CreateDMButton />
      </>,
    );
    expect(screen.getByText("Create a new chat")).toBeInTheDocument();
  });

  it("opens the dialog when the button is clicked", () => {
    render(
      <>
        <ToastContainer />
        <CreateDMButton />
      </>,
    );
    fireEvent.click(screen.getByText("Create a new chat"));
    expect(screen.getByText("New chat")).toBeInTheDocument();
  });
});
