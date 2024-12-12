// Test file for the App component using Vitest

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App component', () => {
    it('renders navigation links', () => {
        render(<App />);
        expect(screen.getByText(/Home/i)).toBeInTheDocument();
        expect(screen.getByText(/Shop/i)).toBeInTheDocument();
    });

    it('increments cart count on adding items to cart', async () => {
        render(<App />);

        const shopLink = screen.getByText(/Shop/i);
        shopLink.click();

        const addToCartButton = await screen.findByText(/Add To Cart/i);
        addToCartButton.click();

        const cartCountText = screen.getByText(/Cart Items:/i);
        expect(cartCountText).toHaveTextContent(/Cart Items: 1/);
    });
});