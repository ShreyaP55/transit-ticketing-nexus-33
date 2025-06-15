import express from 'express';
import Trip from '../models/Trip.js';
import Wallet from '../models/Wallet.js';
import { authenticateUser, requireOwnership } from '../middleware/auth.js';
import { tripRateLimit, validateTrip, sanitizeInput, securityLogger } from '../middleware/security.js';

const router = express.Router();

// Apply security middleware to all routes
router.use(securityLogger);
router.use(sanitizeInput);
router.use(tripRateLimit);

// Start a new trip
router.post('/start', authenticateUser, validateTrip, async (req, res) => {
  try {
    const { userId, latitude, longitude } = req.body;

    // Verify user owns this request
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!userId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'userId, latitude, and longitude are required' });
    }

    // Check if user already has an active trip
    const existingTrip = await Trip.findOne({ userId, active: true });
    if (existingTrip) {
      return res.status(400).json({ error: 'User already has an active trip' });
    }

    // Validate coordinates are reasonable
    if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
      return res.status(400).json({ error: 'Invalid coordinates' });
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
    console.log('Trip started:', { userId, tripId: trip._id, timestamp: new Date().toISOString() });
    
    res.json({ success: true, trip });
  } catch (error) {
    console.error('Error starting trip:', error);
    res.status(500).json({ error: 'Failed to start trip' });
  }
});

// End a trip
router.put('/:tripId/end', authenticateUser, validateTrip, async (req, res) => {
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

    // Verify user owns this trip
    if (req.user.id !== trip.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!trip.active) {
      return res.status(400).json({ error: 'Trip is already completed' });
    }

    // Validate coordinates
    if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
      return res.status(400).json({ error: 'Invalid coordinates' });
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
    console.log('Trip ended:', { userId: trip.userId, tripId: trip._id, fare: trip.fare, timestamp: new Date().toISOString() });
    
    // Deduct fare from user's wallet
    let deduction = { status: 'pending', message: 'Deduction not attempted.' };
    try {
      if (trip.fare > 0) {
        const wallet = await Wallet.findOne({ userId: trip.userId });
        if (wallet) {
          await wallet.deductFunds(trip.fare, `Bus fare for trip`, trip._id);
          deduction = { status: 'success', message: `₹${trip.fare.toFixed(2)} was deducted from wallet.` };
          console.log(`Fare deducted for trip ${trip._id} from user ${trip.userId}`);
        } else {
          deduction = { status: 'error', message: 'User wallet not found.' };
          console.warn(`Wallet not found for user ${trip.userId} for trip ${trip._id}`);
        }
      } else {
        deduction = { status: 'success', message: 'No fare to deduct.' };
      }
    } catch (error) {
      if (error.message === 'Insufficient funds') {
        deduction = { status: 'error', message: 'Insufficient funds in wallet.' };
        console.warn(`Insufficient funds for user ${trip.userId} for trip ${trip._id}`);
      } else {
        deduction = { status: 'error', message: 'Error processing fare deduction.' };
        console.error(`Error deducting funds for trip ${trip._id}:`, error);
      }
    }
    
    res.json({ success: true, trip, deduction });
  } catch (error) {
    console.error('Error ending trip:', error);
    res.status(500).json({ error: 'Failed to end trip' });
  }
});

// Get active trip for a user
router.get('/active/:userId', authenticateUser, requireOwnership('userId'), async (req, res) => {
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
router.get('/user/:userId', authenticateUser, requireOwnership('userId'), async (req, res) => {
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
