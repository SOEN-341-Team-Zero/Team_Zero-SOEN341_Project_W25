import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import LoginForm from '../src/components/Forms/LoginForm';

// Mock the firebase/auth module
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'test-user-id' } }))
}));

// Get the mocked function
const { signInWithEmailAndPassword } = require('firebase/auth');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('LoginForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('successful login with correct credentials', async () => {
    // No need to re-mock, just ensure it will resolve
    signInWithEmailAndPassword.mockResolvedValue({ user: { uid: 'test-user-id' } });
    
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    // Fill in the form fields using fireEvent
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'testuser' }
    });
    
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' }
    });

    // Submit the form using fireEvent
    fireEvent.click(screen.getByText('Login'));

    // Verify navigation occurred after successful login
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  test('unsuccessful login with incorrect credentials', async () => {
    // Set up the mock to reject for this test
    signInWithEmailAndPassword.mockRejectedValue(new Error('Invalid credentials'));
    
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    // Fill in the form fields using fireEvent
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'wronguser' }
    });
    
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'wrongpassword' }
    });

    // Submit the form using fireEvent
    fireEvent.click(screen.getByText('Login'));

    // Verify error handling
    await waitFor(() => {
      // Check that we don't navigate on failed login
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});