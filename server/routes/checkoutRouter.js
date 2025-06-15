
import express from 'express';

const router = express.Router();

// Simple checkout endpoint for testing
router.post('/', async (req, res) => {
  try {
    console.log('Checkout request received:', req.body);
    
    const { type, amount, stationId, busId, routeId } = req.body;
    
    if (!type || !amount) {
      return res.status(400).json({ error: 'Missing required fields: type and amount' });
    }

    // Simulate Stripe checkout session creation
    const mockSessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mockSession = {
      id: mockSessionId,
      url: `https://checkout.stripe.com/pay/${mockSessionId}#fidkdWxOYHwnPyd1blpxYHZxWjA0TUhNfGJHQ1NHNG1kSURyZjFRMFxMZXZHZEtwSGIyNjx0UXVmY29DQU1RXWdqfE1zU19RUWNINz9sQ1dmTktyfTFuVXN%2BSGpnfWZ8Q1VGNVBnPWx3YSdBcWJyalQ0N3VzZCcpJ2hwbGkrZ2F0Kl8qZGxhYCc%2FJyt3YGtkPSd4JSUl`,
      payment_status: 'pending',
      amount_total: amount,
      currency: 'inr',
      metadata: {
        type,
        stationId: stationId || null,
        busId: busId || null,
        routeId: routeId || null
      }
    };

    console.log('Mock checkout session created:', mockSession);
    
    res.json(mockSession);
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

export default router;
