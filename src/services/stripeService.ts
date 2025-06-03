
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const stripeService = {
  // Create a checkout session for ticket purchase
  createTicketCheckoutSession: async (stationId: string, busId: string, amount: number) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userId') || 'guest'}`,
        },
        body: JSON.stringify({
          type: 'ticket',
          stationId,
          busId,
          amount: amount * 100, // Convert to cents
          successUrl: `${window.location.origin}/tickets?status=success`,
          cancelUrl: `${window.location.origin}/booking?status=cancel`,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }
      
      const session = await response.json();
      return session;
    } catch (error) {
      console.error('Error creating ticket checkout session:', error);
      throw error;
    }
  },
  
  // Create a checkout session for pass purchase
  createPassCheckoutSession: async (routeId: string, amount: number) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userId') || 'guest'}`,
        },
        body: JSON.stringify({
          type: 'pass',
          routeId,
          amount: amount * 100, // Convert to cents
          successUrl: `${window.location.origin}/pass?status=success`,
          cancelUrl: `${window.location.origin}/pass?status=cancel`,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }
      
      const session = await response.json();
      return session;
    } catch (error) {
      console.error('Error creating pass checkout session:', error);
      throw error;
    }
  },

  // Create a checkout session for wallet recharge
  createWalletCheckoutSession: async (amount: number) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userId') || 'guest'}`,
        },
        body: JSON.stringify({
          type: 'wallet',
          amount: amount * 100, // Convert to cents
          successUrl: `${window.location.origin}/wallet?status=success&amount=${amount}`,
          cancelUrl: `${window.location.origin}/wallet?status=cancel`,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create wallet checkout session');
      }
      
      const session = await response.json();
      return session;
    } catch (error) {
      console.error('Error creating wallet checkout session:', error);
      throw error;
    }
  },

  // Redirect to Stripe checkout
  redirectToCheckout: async (sessionUrl: string) => {
    if (sessionUrl) {
      window.location.href = sessionUrl;
    } else {
      throw new Error('Invalid session URL');
    }
  }
};
