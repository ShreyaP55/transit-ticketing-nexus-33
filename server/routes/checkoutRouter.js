
import express from 'express';

const router = express.Router();

// Simple checkout endpoint for testing
router.post('/', async (req, res) => {
  try {
    console.log('=== CHECKOUT REQUEST ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    const { type, amount, stationId, busId, routeId } = req.body;
    
    // Validate required fields
    if (!type) {
      console.error('Missing type field');
      return res.status(400).json({ error: 'Missing required field: type' });
    }
    
    if (!amount || amount <= 0) {
      console.error('Missing or invalid amount field');
      return res.status(400).json({ error: 'Missing or invalid required field: amount' });
    }

    // Validate type-specific requirements
    if (type === 'ticket' && (!stationId || !busId)) {
      console.error('Missing stationId or busId for ticket type');
      return res.status(400).json({ error: 'Missing required fields for ticket: stationId and busId' });
    }
    
    if (type === 'pass' && !routeId) {
      console.error('Missing routeId for pass type');
      return res.status(400).json({ error: 'Missing required field for pass: routeId' });
    }

    // Simulate Stripe checkout session creation
    const mockSessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mockSession = {
      id: mockSessionId,
      url: `https://checkout.stripe.com/pay/${mockSessionId}#mock_session`,
      payment_status: 'pending',
      amount_total: amount,
      currency: 'inr',
      metadata: {
        type,
        stationId: stationId || null,
        busId: busId || null,
        routeId: routeId || null
      },
      success: true
    };

    console.log('=== CHECKOUT RESPONSE ===');
    console.log('Mock checkout session created:', mockSession);
    
    res.status(200).json(mockSession);
  } catch (error) {
    console.error('=== CHECKOUT ERROR ===');
    console.error('Checkout error:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message 
    });
  }
});

// Health check for checkout service
router.get('/health', (req, res) => {
  console.log('Checkout service health check');
  res.json({ 
    status: 'OK', 
    service: 'checkout',
    timestamp: new Date().toISOString() 
  });
});

export default router;
