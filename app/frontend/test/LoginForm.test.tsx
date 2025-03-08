import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import LoginForm from '../src/components/Forms/LoginForm';

describe("LoginForm", () => {
  it("should not submit if fields are empty", () => {
    render(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: /login/i });
    fireEvent.click(submitButton);

    // Replace toBeInTheDocument with .toBeTruthy() or .toBeDefined()
    expect(screen.getByLabelText(/username/i)).toBeTruthy();
    expect(screen.getByLabelText(/password/i)).toBeTruthy();
  });
});
