
import express from 'express';
import BusLocation from '../models/BusLocation.js';

const router = express.Router();

// Update bus location
router.post('/update', async (req, res) => {
  try {
    const { busId, coords } = req.body;

    if (!busId || !coords || !coords.lat || !coords.lng) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const location = await BusLocation.findOneAndUpdate(
      { busId },
      { coords, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ success: true, location });
  } catch (error) {
    console.error('Error updating bus location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Get all bus locations
router.get('/all', async (req, res) => {
  try {
    const locations = await BusLocation.find();
    res.json({ locations });
  } catch (error) {
    console.error('Error fetching bus locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Get specific bus location
router.get('/:busId', async (req, res) => {
  try {
    const { busId } = req.params;
    const location = await BusLocation.findOne({ busId });
    
    if (!location) {
      return res.status(404).json({ error: 'Bus location not found' });
    }

    res.json({ location });
  } catch (error) {
    console.error('Error fetching bus location:', error);
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

export default router;
