import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import LoginForm from '../src/components/Forms/LoginForm'; // Your LoginForm component

describe("LoginForm", () => {
  test("renders login form with username and password", () => {
    // Render the LoginForm inside a BrowserRouter since it uses useNavigate
    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    // Check if username and password inputs are in the document
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });
});
