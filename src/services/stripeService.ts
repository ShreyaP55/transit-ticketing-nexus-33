
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const stripeService = {
  // Create a checkout session for ticket purchase
  createTicketCheckoutSession: async (stationId: string, busId: string, amount: number) => {
    try {
      console.log('Creating ticket checkout session:', { stationId, busId, amount });
      
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication required for payment');
      }

      const response = await fetch(`${API_URL}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          type: 'ticket',
          stationId,
          busId,
          amount: Math.round(amount * 100), // Convert to cents
          successUrl: `${window.location.origin}/tickets?status=success`,
          cancelUrl: `${window.location.origin}/booking?status=cancel`,
        }),
      });

      console.log('Checkout response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Payment service unavailable' }));
        throw new Error(errorData.error || `Payment failed: ${response.status}`);
      }
      
      const session = await response.json();
      console.log('Checkout session created:', session);
      return session;
    } catch (error) {
      console.error('Error creating ticket checkout session:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to payment service. Please check your connection.');
      }
      throw error;
    }
  },
  
  // Create a checkout session for pass purchase
  createPassCheckoutSession: async (routeId: string, amount: number) => {
    try {
      console.log('Creating pass checkout session:', { routeId, amount });
      
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication required for payment');
      }

      const response = await fetch(`${API_URL}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          type: 'pass',
          routeId,
          amount: Math.round(amount * 100), // Convert to cents
          successUrl: `${window.location.origin}/pass?status=success`,
          cancelUrl: `${window.location.origin}/pass?status=cancel`,
        }),
      });

      console.log('Pass checkout response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Payment service unavailable' }));
        throw new Error(errorData.error || `Payment failed: ${response.status}`);
      }
      
      const session = await response.json();
      console.log('Pass checkout session created:', session);
      return session;
    } catch (error) {
      console.error('Error creating pass checkout session:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to payment service. Please check your connection.');
      }
      throw error;
    }
  },

  // Create a checkout session for wallet recharge
  createWalletCheckoutSession: async (amount: number) => {
    try {
      console.log('Creating wallet checkout session:', { amount });
      
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication required for payment');
      }

      const response = await fetch(`${API_URL}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          type: 'wallet',
          amount: Math.round(amount * 100), // Convert to cents
          successUrl: `${window.location.origin}/wallet?status=success&amount=${amount}`,
          cancelUrl: `${window.location.origin}/wallet?status=cancel`,
        }),
      });

      console.log('Wallet checkout response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Payment service unavailable' }));
        throw new Error(errorData.error || `Payment failed: ${response.status}`);
      }
      
      const session = await response.json();
      console.log('Wallet checkout session created:', session);
      return session;
    } catch (error) {
      console.error('Error creating wallet checkout session:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to payment service. Please check your connection.');
      }
      throw error;
    }
  },

  // Redirect to Stripe checkout
  redirectToCheckout: async (sessionUrl: string) => {
    if (!sessionUrl) {
      throw new Error('Invalid checkout session URL');
    }
    
    console.log('Redirecting to checkout:', sessionUrl);
    
    try {
      // Open in new tab by default for better UX
      const newWindow = window.open(sessionUrl, '_blank');
      if (!newWindow) {
        // Fallback to same tab if popup blocked
        window.location.href = sessionUrl;
      }
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      // Final fallback
      window.location.href = sessionUrl;
    }
  }
};
