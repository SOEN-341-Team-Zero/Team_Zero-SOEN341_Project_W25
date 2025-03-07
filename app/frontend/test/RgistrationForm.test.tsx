// RegisterForm.test.jsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import RegisterForm from '../src/components/Forms//RegisterForm';
import { toast } from 'react-toastify';

// Mock Firebase functions
jest.mock('firebase/auth', () => ({
    createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'test-user-id' } })),
}));

const { createUserWithEmailAndPassword } = require('firebase/auth');


jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('RegisterForm Component', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
    });

    test('successful registration with correct credentials', async () => {
        // Mock successful registration response
        createUserWithEmailAndPassword.mockResolvedValueOnce({
            user: { uid: 'user123' },
        });

        render(
            <MemoryRouter>
                <RegisterForm />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/Username/i), {
            target: { value: 'john_doe' },
        });
        fireEvent.change(screen.getByLabelText(/Password/i), {
            target: { value: 'password123' },
        });
        fireEvent.click(screen.getByLabelText(/I want to be an administrator/i));

        fireEvent.click(screen.getByText('Register'));

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('Account registered successfully!');
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    test('unsuccessful registration with empty fields', async () => {
        render(
            <MemoryRouter>
                <RegisterForm />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('Register'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('❌ Error: Username and password are required!');
        });
    });

    test('unsuccessful registration with username already taken', async () => {
        // Mock failed registration (user already exists)
        createUserWithEmailAndPassword.mockRejectedValueOnce({
            message: 'This username is already taken',
        });

        render(
            <MemoryRouter>
                <RegisterForm />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/Username/i), {
            target: { value: 'john_doe' },
        });
        fireEvent.change(screen.getByLabelText(/Password/i), {
            target: { value: 'password123' },
        });
        fireEvent.click(screen.getByText('Register'));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('❌ Error: This username is already taken');
        });
    });
});
