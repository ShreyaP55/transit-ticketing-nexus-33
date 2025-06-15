
import express from 'express';
import Payment from '../models/Payment.js';
import Pass from '../models/Pass.js';

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
    const { userId, sessionId } = req.body;
    
    if (!userId || !sessionId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // For now, simulate successful payment confirmation
    // In real implementation, you would verify with Stripe
    
    // Find the payment record by session ID
    const payment = await Payment.findOne({ stripeSessionId: sessionId });
    
    if (!payment) {
      // Create a mock pass for testing
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      
      const newPass = new Pass({
        userId,
        routeId: req.body.routeId || '674a123456789012345678ab', // Mock route ID
        fare: req.body.fare || 100,
        expiryDate
      });
      
      await newPass.save();
      
      return res.json({
        success: true,
        pass: newPass
      });
    }
    
    // Update payment status
    payment.status = 'completed';
    await payment.save();
    
    // Create pass if it's a pass payment
    if (payment.type === 'pass') {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      
      const newPass = new Pass({
        userId: payment.userId,
        routeId: payment.routeId,
        fare: payment.fare,
        expiryDate
      });
      
      await newPass.save();
      
      res.json({
        success: true,
        pass: newPass
      });
    } else {
      res.json({
        success: true,
        payment
      });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
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
