
import express from 'express';
import Stripe from 'stripe';
import { connect } from '../utils/mongoConnect.js';
import Payment from '../models/Payment.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create checkout session with payment intent tracking
router.post('/', async (req, res) => {
  try {
    console.log('=== CHECKOUT REQUEST ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    await connect();
    
    const { userId, type, amount, stationId, busId, routeId } = req.body;
    
    // Validate required fields
    if (!userId) {
      console.error('Missing userId field');
      return res.status(400).json({ error: 'Missing required field: userId' });
    }
    
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

    // Check for existing pending payment to prevent duplicates
    const existingPayment = await Payment.findOne({
      userId,
      type,
      status: 'pending',
      createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) } // Within last 10 minutes
    });

    if (existingPayment) {
      console.log('Found existing pending payment, returning existing session');
      return res.status(200).json({ 
        url: `https://checkout.stripe.com/pay/${existingPayment.stripeSessionId}`,
        message: 'Using existing payment session'
      });
    }

    // Determine product name based on type
    let productName = 'Payment';
    switch (type) {
      case 'wallet':
        productName = 'Wallet Top-up';
        break;
      case 'pass':
        productName = 'Monthly Transit Pass';
        break;
      case 'ticket':
        productName = 'Bus Ticket';
        break;
    }

    // Create Stripe checkout session with idempotency
    const idempotencyKey = `${userId}_${type}_${amount}_${Date.now()}`;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            unit_amount: Math.round(amount * 100), // Convert to paise
            product_data: {
              name: productName,
              description: `${productName} for transit services`,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin || 'http://localhost:5173'}/${type === 'wallet' ? 'wallet' : type}?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:5173'}/${type === 'wallet' ? 'wallet' : type}?status=cancel`,
      metadata: {
        userId,
        type,
        routeId: routeId || '',
        stationId: stationId || '',
        busId: busId || '',
      },
    }, {
      idempotencyKey
    });

    // Create payment record ONLY after successful Stripe session creation
    const payment = new Payment({
      userId,
      type,
      routeId: routeId || null,
      fare: amount,
      stripeSessionId: session.id,
      status: 'pending'
    });

    await payment.save();

    console.log('=== CHECKOUT RESPONSE ===');
    console.log('Stripe session created:', session.id);
    console.log('Payment record created:', payment._id);
    
    res.status(200).json({ 
      url: session.url,
      sessionId: session.id,
      paymentId: payment._id
    });
  } catch (error) {
    console.error('=== CHECKOUT ERROR ===');
    console.error('Checkout error:', error);
    
    // Handle Stripe duplicate session errors
    if (error.type === 'StripeIdempotencyError') {
      return res.status(409).json({ 
        error: 'Duplicate payment request detected',
        details: 'Please wait a moment before trying again'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message 
    });
  }
});

// Verify payment status
router.get('/verify/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    await connect();
    
    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Find payment record
    const payment = await Payment.findOne({ stripeSessionId: sessionId });
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }
    
    res.json({
      sessionId: session.id,
      paymentStatus: session.payment_status,
      paymentIntentStatus: session.payment_intent ? 'created' : 'pending',
      amount: session.amount_total / 100, // Convert from paise to rupees
      currency: session.currency,
      paymentRecord: {
        id: payment._id,
        status: payment.status,
        type: payment.type,
        fare: payment.fare
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      error: 'Failed to verify payment',
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
