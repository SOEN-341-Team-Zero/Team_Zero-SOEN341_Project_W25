import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from '../src/components/Forms/LoginForm';  // Adjust the import as needed
import { useNavigate } from 'react-router-dom';

// Mock useNavigate to avoid wrapping in BrowserRouter
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // Preserve other router functionality
  useNavigate: jest.fn(), // Mock useNavigate
}));

describe('LoginForm', () => {
  test('renders login form with username and password', () => {
    // Mock the implementation of useNavigate to track its usage
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);

    // Render the LoginForm
    render(<LoginForm />);

    // Check if username and password inputs are in the document
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('submit button calls navigate', () => {
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);

    // Render the LoginForm
    render(<LoginForm />);

    // Click the submit button and check if navigate was called
    const submitButton = screen.getByRole('button', { name: /submit/i });
    submitButton.click();

    // Ensure navigate was called after clicking the button
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });
});
