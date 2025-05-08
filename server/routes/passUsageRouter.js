
import express from 'express';
import PassUsage from '../models/PassUsage.js';

const router = express.Router();

// Get usage history by user ID
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const usageHistory = await PassUsage.find({ userId })
      .populate('passId')
      .sort({ scannedAt: -1 });
    
    res.json(usageHistory);
  } catch (error) {
    console.error('Error fetching pass usage history:', error);
    res.status(500).json({ error: 'Failed to fetch pass usage history' });
  }
});

// Record pass usage
router.post('/', async (req, res) => {
  try {
    const { userId, passId, location } = req.body;
    
    if (!userId || !passId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newUsage = new PassUsage({
      userId,
      passId,
      location,
      scannedAt: new Date()
    });
    
    await newUsage.save();
    
    res.status(201).json({
      message: 'Pass usage recorded successfully',
      usage: newUsage
    });
  } catch (error) {
    console.error('Error recording pass usage:', error);
    res.status(500).json({ error: 'Failed to record pass usage' });
  }
});

export default router;
