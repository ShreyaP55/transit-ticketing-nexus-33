
import express from 'express';
import Stripe from 'stripe';
import { connect } from '../utils/mongoConnect.js';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import Payment from '../models/Payment.js';
import Pass from '../models/Pass.js';
import Ticket from '../models/Ticket.js';
import Route from '../models/Route.js';
import Bus from '../models/Bus.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe requires raw body, so we need to handle it specially
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const rawBody = req.body;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Stripe webhook verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      await connect();

      // Find payment by Stripe session ID
      const payment = await Payment.findOne({ stripeSessionId: session.id });

      if (!payment) {
        console.error('❌ Payment not found for session:', session.id);
        return res.status(404).send('Payment not found');
      }

      // Skip if already processed (idempotency check)
      if (payment.status === 'completed') {
        console.log('✅ Payment already processed:', session.id);
        return res.status(200).send('Already processed');
      }

      // Verify payment amount matches
      const expectedAmount = Math.round(payment.fare * 100); // Convert to paise
      if (session.amount_total !== expectedAmount) {
        console.error('❌ Payment amount mismatch:', { 
          expected: expectedAmount, 
          received: session.amount_total 
        });
        return res.status(400).send('Payment amount mismatch');
      }

      // Find user by payment.userId
      const user = await User.findOne({ clerkId: payment.userId });
      if (!user) {
        console.error('❌ User not found:', payment.userId);
        return res.status(404).send('User not found');
      }

      console.log(`🔄 Processing ${payment.type} payment for user: ${user.clerkId}`);

      // Process based on payment type with atomic operations
      if (payment.type === 'wallet') {
        // Get or create wallet
        let wallet = await Wallet.findOne({ userId: payment.userId });
        if (!wallet) {
          wallet = new Wallet({ 
            userId: payment.userId, 
            balance: 0, 
            transactions: [] 
          });
        }

        // Add funds to wallet
        await wallet.addFunds(payment.fare, `Wallet top-up via Stripe (${session.id})`);
        console.log(`✅ Wallet updated for ${user.clerkId}: ₹${payment.fare}`);
        
      } else if (payment.type === 'pass') {
        // Create monthly pass only after successful payment
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        
        // Check for duplicate pass
        const existingPass = await Pass.findOne({
          userId: payment.userId,
          routeId: payment.routeId,
          expiryDate: { $gte: new Date() }
        });

        if (!existingPass) {
          const newPass = new Pass({
            userId: payment.userId,
            routeId: payment.routeId,
            fare: payment.fare,
            expiryDate,
            paymentIntentId: session.id,
            status: 'active'
          });
          
          await newPass.save();
          console.log(`✅ Pass created for ${user.clerkId}: ${newPass._id}`);
        } else {
          console.log(`✅ Pass already exists for ${user.clerkId}: ${existingPass._id}`);
        }
        
      } else if (payment.type === 'ticket') {
        // Create ticket only after successful payment
        const route = await Route.findById(payment.routeId);
        const bus = await Bus.findOne({ routeId: payment.routeId });
        
        if (route && bus) {
          // Check for duplicate ticket
          const existingTicket = await Ticket.findOne({
            paymentIntentId: session.id
          });

          if (!existingTicket) {
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 12); // 12 hour validity
            
            const newTicket = new Ticket({
              userId: payment.userId,
              routeId: payment.routeId,
              busId: bus._id,
              startStation: route.start,
              endStation: route.end,
              price: payment.fare,
              paymentIntentId: session.id,
              expiryDate,
              status: 'active',
              paymentStatus: 'paid'
            });
            
            await newTicket.save();
            console.log(`✅ Ticket created for ${user.clerkId}: ${newTicket._id}`);
          } else {
            console.log(`✅ Ticket already exists for ${user.clerkId}: ${existingTicket._id}`);
          }
        } else {
          console.error('❌ Route or bus not found for ticket creation');
        }
      }

      // Mark payment as completed (atomic operation)
      await Payment.findByIdAndUpdate(
        payment._id,
        { 
          status: 'completed',
          updatedAt: new Date()
        },
        { new: true }
      );

      console.log(`✅ Payment completed for session: ${session.id}`);
      return res.status(200).send('Success');
    } catch (err) {
      console.error('❌ Error processing Stripe session:', err);
      
      // Mark payment as failed on error
      try {
        await Payment.findOneAndUpdate(
          { stripeSessionId: session.id },
          { 
            status: 'failed',
            updatedAt: new Date()
          }
        );
      } catch (updateErr) {
        console.error('❌ Error updating payment status to failed:', updateErr);
      }
      
      return res.status(500).send('Internal Server Error');
    }
  }

  return res.status(200).send('Event received');
});

export default router;
