
import express from 'express';
import Trip from '../models/Trip.js';

const router = express.Router();

// Start a new trip
router.post('/start', async (req, res) => {
  try {
    const { userId, latitude, longitude } = req.body;
    
    if (!userId || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if user already has an active trip
    const activeTrip = await Trip.findOne({ userId, active: true });
    if (activeTrip) {
      return res.status(400).json({ error: 'User already has an active trip' });
    }
    
    // Create new trip
    const newTrip = new Trip({
      userId,
      startLocation: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        timestamp: new Date()
      },
      active: true
    });
    
    await newTrip.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Trip started successfully',
      trip: newTrip 
    });
  } catch (error) {
    console.error('Error starting trip:', error);
    res.status(500).json({ error: 'Failed to start trip' });
  }
});

// End a trip
router.put('/:id/end', async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Find the active trip
    const trip = await Trip.findById(id);
    
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    if (!trip.active) {
      return res.status(400).json({ error: 'Trip is already completed' });
    }
    
    // Update trip with end location
    trip.endLocation = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timestamp: new Date()
    };
    trip.active = false;
    
    // Calculate trip metrics
    trip.calculateDistance();
    trip.calculateFare();
    trip.calculateDuration();
    
    await trip.save();
    
    res.json({ 
      success: true, 
      message: 'Trip ended successfully',
      trip: {
        id: trip._id,
        distance: trip.distance,
        fare: trip.fare,
        duration: trip.duration,
        startTime: trip.startLocation.timestamp,
        endTime: trip.endLocation.timestamp
      }
    });
  } catch (error) {
    console.error('Error ending trip:', error);
    res.status(500).json({ error: 'Failed to end trip' });
  }
});

// Get active trip for a user
router.get('/active/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const activeTrip = await Trip.findOne({ userId, active: true });
    
    if (!activeTrip) {
      return res.json({ active: false });
    }
    
    res.json({ 
      active: true,
      trip: activeTrip
    });
  } catch (error) {
    console.error('Error getting active trip:', error);
    res.status(500).json({ error: 'Failed to get active trip' });
  }
});

// Get trip history for a user
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const trips = await Trip.find({ 
      userId, 
      active: false 
    }).sort({ createdAt: -1 });
    
    res.json(trips);
  } catch (error) {
    console.error('Error getting trip history:', error);
    res.status(500).json({ error: 'Failed to get trip history' });
  }
});

export default router;
