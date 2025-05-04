
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const stripeService = {
  // Create a checkout session for ticket purchase
  createTicketCheckoutSession: async (stationId: string, busId: string, amount: number) => {
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              name: 'Bus Ticket',
              amount: amount,
              quantity: 1,
            },
          ],
          stationId,
          busId,
          mode: 'payment',
        }),
      });
      
      const session = await response.json();
      
      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      return result;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },
  
  // Create a checkout session for pass purchase
  createPassCheckoutSession: async (routeId: string, amount: number) => {
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              name: 'Transit Pass',
              amount: amount,
              quantity: 1,
            },
          ],
          routeId,
          mode: 'subscription',
        }),
      });
      
      const session = await response.json();
      
      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      return result;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },
};
