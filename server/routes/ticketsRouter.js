
import express from 'express';
import Ticket from '../models/Ticket.js';

const router = express.Router();

// Get tickets by user ID
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const tickets = await Ticket.find({ userId })
      .populate('routeId')
      .populate('busId');
    
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Create ticket
router.post('/', async (req, res) => {
  try {
    const { userId, routeId, busId, startStation, endStation, price, paymentIntentId, expiryDate } = req.body;
    
    if (!userId || !routeId || !busId || !startStation || !endStation || !price || !paymentIntentId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newTicket = new Ticket({
      userId,
      routeId,
      busId,
      startStation,
      endStation,
      price: parseFloat(price),
      paymentIntentId,
      expiryDate: expiryDate || new Date(Date.now() + 24 * 60 * 60 * 1000) // Default to 24hrs from now
    });
    
    await newTicket.save();
    
    res.status(201).json({
      success: true,
      ticket: newTicket
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

export default router;
