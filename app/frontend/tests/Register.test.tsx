import React from "react";
import { expect, test, beforeEach, describe, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RegisterForm from "../src/components/Forms/RegisterForm";
import { ToastContainer } from "react-toastify";
import "@testing-library/jest-dom/vitest";

beforeEach(() => {
  (globalThis as any).fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    }),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("RegisterForm", () => {
  render(
    <MemoryRouter>
      <ToastContainer />
      <RegisterForm />
    </MemoryRouter>,
  );
  test("successful registration with valid input", async () => {
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("Register"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/register/validate"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            username: "testuser",
            password: "password123",
            isAdmin: false,
          }),
        }),
      );
    });
  });

  test("registration with already existing username", async () => {
    (globalThis as any).fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({ error: "This username is already taken" }),
      }),
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "existinguser" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("Register"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/register/validate"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            username: "existinguser",
            password: "password123",
            isAdmin: false,
          }),
        }),
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText(/username is already taken/i),
      ).toBeInTheDocument();
    });
  });
});
