
import express from 'express';
import Trip from '../models/Trip.js';

const router = express.Router();

// Start a new trip
router.post('/start', async (req, res) => {
  try {
    const { userId, latitude, longitude } = req.body;

    if (!userId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'userId, latitude, and longitude are required' });
    }

    // Check if user already has an active trip
    const existingTrip = await Trip.findOne({ userId, active: true });
    if (existingTrip) {
      return res.status(400).json({ error: 'User already has an active trip' });
    }

    const trip = new Trip({
      userId,
      startLocation: {
        latitude,
        longitude,
        timestamp: new Date()
      }
    });

    await trip.save();
    res.json({ success: true, trip });
  } catch (error) {
    console.error('Error starting trip:', error);
    res.status(500).json({ error: 'Failed to start trip' });
  }
});

// End a trip
router.put('/:tripId/end', async (req, res) => {
  try {
    const { tripId } = req.params;
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'latitude and longitude are required' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (!trip.active) {
      return res.status(400).json({ error: 'Trip is already completed' });
    }

    // Set end location
    trip.endLocation = {
      latitude,
      longitude,
      timestamp: new Date()
    };
    trip.active = false;

    // Calculate distance, fare, and duration
    trip.calculateDistance();
    trip.calculateFare();
    trip.calculateDuration();

    await trip.save();
    res.json({ success: true, trip });
  } catch (error) {
    console.error('Error ending trip:', error);
    res.status(500).json({ error: 'Failed to end trip' });
  }
});

// Get active trip for a user
router.get('/active/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const trip = await Trip.findOne({ userId, active: true });
    
    if (!trip) {
      return res.status(404).json({ active: false, message: 'No active trip found' });
    }

    res.json({ active: true, trip });
  } catch (error) {
    console.error('Error getting active trip:', error);
    res.status(500).json({ error: 'Failed to get active trip' });
  }
});

// Get all trips for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const trips = await Trip.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 trips
    
    // Transform trips for frontend consumption
    const formattedTrips = trips.map(trip => ({
      _id: trip._id,
      status: trip.active ? 'active' : 'completed',
      createdAt: trip.createdAt,
      startLocation: {
        lat: trip.startLocation.latitude,
        lng: trip.startLocation.longitude
      },
      endLocation: trip.endLocation ? {
        lat: trip.endLocation.latitude,
        lng: trip.endLocation.longitude
      } : null,
      distance: trip.distance,
      fare: trip.fare,
      duration: trip.duration
    }));

    res.json(formattedTrips);
  } catch (error) {
    console.error('Error getting user trips:', error);
    res.status(500).json({ error: 'Failed to get user trips' });
  }
});

export default router;
