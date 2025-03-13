import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react';
import React from 'react';

const Button = ({ text }: { text: string }) => <button>{text}</button>;

test('renders the button with correct text', () => {
    render(<Button text="Click Me" />);
    expect(screen.getByText('Click Me')).toBeTruthy();
});

test('button does not render incorrect text', () => {
    render(<Button text="Click Me" />);
    expect(screen.queryByText('Do Not Click Me')).toBeNull();
});