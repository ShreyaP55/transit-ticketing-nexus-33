
import express from 'express';
import Pass from '../models/Pass.js';

const router = express.Router();

// Get passes by user ID
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Find active passes (not expired)
    const passes = await Pass.find({
      userId,
      expiryDate: { $gt: new Date() }
    }).populate('routeId');
    
    if (passes.length === 0) {
      return res.status(404).json({ error: 'No active passes found' });
    }
    
    // Return the most recent pass
    res.json(passes[0]);
  } catch (error) {
    console.error('Error fetching passes:', error);
    res.status(500).json({ error: 'Failed to fetch passes' });
  }
});

// Create pass
router.post('/', async (req, res) => {
  try {
    const { userId, routeId, fare } = req.body;
    
    if (!userId || !routeId || !fare) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Set expiry to 1 month from now
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    
    const newPass = new Pass({
      userId,
      routeId,
      fare: parseFloat(fare),
      expiryDate
    });
    
    await newPass.save();
    
    res.status(201).json({
      success: true,
      pass: newPass
    });
  } catch (error) {
    console.error('Error creating pass:', error);
    res.status(500).json({ error: 'Failed to create pass' });
  }
});

export default router;
