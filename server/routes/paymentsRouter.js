
import express from 'express';
import Payment from '../models/Payment.js';

const router = express.Router();

// Get payments by user ID
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const payments = await Payment.find({ userId })
      .populate('routeId')
      .sort({ _id: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Create payment
router.post('/', async (req, res) => {
  try {
    const { userId, type, routeId, start, end, fare, stripeSessionId } = req.body;
    
    if (!userId || !type || !fare || !stripeSessionId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newPayment = new Payment({
      userId,
      type,
      routeId,
      start,
      end,
      fare: parseFloat(fare),
      stripeSessionId,
      status: 'pending'
    });
    
    await newPayment.save();
    
    // If integration with Stripe, would redirect to Stripe checkout here
    const stripeRedirectUrl = `https://checkout.stripe.com/pay/${stripeSessionId}`;
    
    res.status(201).json({
      url: stripeRedirectUrl,
      payment: newPayment
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Update payment status
router.put('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const payment = await Payment.findOneAndUpdate(
      { stripeSessionId: sessionId },
      { status },
      { new: true }
    );
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
});

export default router;
