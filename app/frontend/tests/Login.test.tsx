import { expect, test, describe, vi, beforeAll, afterAll } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import LoginForm from "../src/components/Forms/LoginForm";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";

describe("LoginForm", () => {
  beforeAll(() => {
    globalThis.fetch = vi.fn((...args) => {
      const [url, options] = args;
      const { username, password } = JSON.parse(options.body);
      if (url.includes("api/login/validate")) {
        if (username === "testuser" && password === "password123") {
          return Promise.resolve(
            new Response(
              JSON.stringify({ token: "testtoken", success: true }),
              {
                status: 200,
                headers: { "Content-Type": "application/json" },
              },
            ),
          );
        }
        return Promise.resolve(
          new Response(
            JSON.stringify({ error: "Incorrect username or password" }),
            {
              status: 401,
              headers: { "Content-Type": "application/json" },
            },
          ),
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify({ error: "Network error" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }),
      );
    });
  });

  render(
    <BrowserRouter>
      <ToastContainer />
      <LoginForm />
    </BrowserRouter>,
  );

  test("renders login form", () => {
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("allows user to input username and password", () => {
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(usernameInput).toHaveValue("testuser");
    expect(passwordInput).toHaveValue("password123");
  });

  test("shows an error message on invalid credentials", async () => {
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: "nonapplicable" } });
    fireEvent.change(passwordInput, { target: { value: "doesnotmatter" } });
    fireEvent.click(loginButton);

    // wait for because it's displayed on a toast after validation
    await waitFor(() => {
      expect(
        screen.getByText(/incorrect username or password/i),
      ).toBeInTheDocument();
    });
  });

  test("redirects to home page on successful login", async () => {
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(window.location.pathname).toBe("/home");
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
  });
});
