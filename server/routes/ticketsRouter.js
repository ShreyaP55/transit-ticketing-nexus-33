
import express from 'express';
import mongoose from 'mongoose';
import Ticket from '../models/Ticket.js';
import Route from '../models/Route.js';
import Bus from '../models/Bus.js';

const router = express.Router();

// Get tickets by user ID with proper expiry checking
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // First, mark expired tickets
    await Ticket.updateMany(
      { 
        userId,
        expiryDate: { $lt: new Date() }, 
        status: 'active' 
      },
      { 
        $set: { status: 'expired' } 
      }
    );
    
    const tickets = await Ticket.find({ userId })
      .populate('routeId')
      .populate('busId')
      .sort({ createdAt: -1 });
    
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Create ticket (only after successful payment)
router.post('/', async (req, res) => {
  try {
    const { userId, routeId, busId, startStation, endStation, price, paymentIntentId, expiryDate } = req.body;
    
    if (!userId || !routeId || !busId || !startStation || !price || !paymentIntentId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(routeId)) {
      return res.status(400).json({ error: 'Invalid route ID format' });
    }
    if (!mongoose.Types.ObjectId.isValid(busId)) {
      return res.status(400).json({ error: 'Invalid bus ID format' });
    }

    // Check for duplicate payment intent
    const existingTicket = await Ticket.findOne({ paymentIntentId });
    if (existingTicket) {
      return res.status(400).json({ error: 'Ticket with this payment intent already exists' });
    }

    // Check if documents exist
    const [existingRoute, existingBus] = await Promise.all([
      Route.findById(routeId),
      Bus.findById(busId)
    ]);

    if (!existingRoute) {
      return res.status(400).json({ error: 'Route not found' });
    }
    if (!existingBus) {
      return res.status(400).json({ error: 'Bus not found' });
    }
    
    const newTicket = new Ticket({
      userId,
      routeId,
      busId,
      startStation,
      endStation: endStation || startStation,
      price: parseFloat(price),
      paymentIntentId,
      expiryDate: expiryDate || new Date(Date.now() + 12 * 60 * 60 * 1000), // Default to 12hrs from now
      status: 'active',
      paymentStatus: 'paid' // Only create tickets after successful payment
    });
    
    await newTicket.save();

    const populatedTicket = await Ticket.findById(newTicket._id)
      .populate('routeId')
      .populate('busId');
    
    res.status(201).json({
      success: true,
      ticket: populatedTicket
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: `Validation failed: ${validationErrors.join(', ')}` });
    }
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Validate ticket usage
router.post('/:ticketId/validate', async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({ error: 'Invalid ticket ID format' });
    }
    
    const ticket = await Ticket.findById(ticketId)
      .populate('routeId')
      .populate('busId');
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    if (!ticket.isValid()) {
      let reason = 'Unknown reason';
      if (ticket.isExpired()) {
        reason = 'Ticket has expired';
      } else if (ticket.status !== 'active') {
        reason = `Ticket status is ${ticket.status}`;
      } else if (ticket.usageCount >= ticket.maxUsage) {
        reason = 'Ticket has been used maximum times';
      } else if (ticket.paymentStatus !== 'paid') {
        reason = 'Payment not confirmed';
      }
      
      return res.status(400).json({ 
        error: 'Ticket is not valid for use',
        reason,
        ticket: {
          id: ticket._id,
          status: ticket.status,
          expiryDate: ticket.expiryDate,
          usageCount: ticket.usageCount,
          maxUsage: ticket.maxUsage,
          paymentStatus: ticket.paymentStatus
        }
      });
    }
    
    res.json({
      valid: true,
      ticket: {
        id: ticket._id,
        routeId: ticket.routeId,
        busId: ticket.busId,
        startStation: ticket.startStation,
        endStation: ticket.endStation,
        price: ticket.price,
        expiryDate: ticket.expiryDate,
        usageCount: ticket.usageCount,
        maxUsage: ticket.maxUsage
      }
    });
  } catch (error) {
    console.error('Error validating ticket:', error);
    res.status(500).json({ error: 'Failed to validate ticket' });
  }
});

// Use ticket
router.post('/:ticketId/use', async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return res.status(400).json({ error: 'Invalid ticket ID format' });
    }
    
    const ticket = await Ticket.findById(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    await ticket.use();
    
    res.json({
      success: true,
      message: 'Ticket used successfully',
      ticket: {
        id: ticket._id,
        status: ticket.status,
        usageCount: ticket.usageCount,
        lastUsed: ticket.lastUsed
      }
    });
  } catch (error) {
    console.error('Error using ticket:', error);
    if (error.message === 'Ticket is not valid for use') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to use ticket' });
  }
});

// Get ticket statistics
router.get('/stats', async (req, res) => {
  try {
    const [totalTickets, activeTickets, expiredTickets, usedTickets] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: 'active', expiryDate: { $gte: new Date() } }),
      Ticket.countDocuments({ status: 'expired' }),
      Ticket.countDocuments({ status: 'used' })
    ]);
    
    res.json({
      totalTickets,
      activeTickets,
      expiredTickets,
      usedTickets
    });
  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    res.status(500).json({ error: 'Failed to fetch ticket statistics' });
  }
});

export default router;
