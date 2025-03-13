import React from 'react';
import { expect, test, beforeEach, describe, afterEach} from 'vitest';
import { vi } from "vitest";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterForm from '../src/components/Forms/RegisterForm';


// Mock fetch instead of registerService
beforeEach(() => {
  (globalThis as any).fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    })
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('RegisterForm Component', () => {
  
  test('successful registration with valid input', async () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );
  
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Register'));
  
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/register/validate'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            username: 'testuser',
            password: 'password123',
            isAdmin: false,
          }),
        })
      );
    });
  });

  test('displays error when username is missing', async () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Register'));

    await waitFor(() => {
      // Check for an error message for missing username
      const errorMessage = screen.queryByText(/username is required/i);
      expect(errorMessage).not.toBeNull(); // Ensures the error message appears
    });
  });

  test('displays error when password is missing', async () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.click(screen.getByText('Register'));

    await waitFor(() => {
      // Check for an error message for missing password
      const errorMessage = screen.queryByText(/password is required/i);
      expect(errorMessage).not.toBeNull(); // Ensures the error message appears
    });
  });
});
