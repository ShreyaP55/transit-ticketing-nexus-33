
import express from 'express';
import RideSession from '../models/RideSession.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// Haversine distance calculation
const calculateDistance = (coords1, coords2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in km

  const dLat = toRad(coords2.lat - coords1.lat);
  const dLng = toRad(coords2.lng - coords1.lng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(coords1.lat)) *
      Math.cos(toRad(coords2.lat)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Start a ride
router.post('/start', async (req, res) => {
  try {
    const { userId, busId, routeId, startCoords } = req.body;

    if (!userId || !busId || !routeId || !startCoords) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already has active ride
    const existingRide = await RideSession.findOne({ userId, status: 'active' });
    if (existingRide) {
      return res.status(400).json({ error: 'User already has active ride' });
    }

    const ride = await RideSession.create({
      userId,
      busId,
      routeId,
      startCoords,
    });

    res.status(201).json({ success: true, rideToken: ride._id, ride });
  } catch (error) {
    console.error('Error starting ride:', error);
    res.status(500).json({ error: 'Failed to start ride' });
  }
});

// End a ride
router.post('/end', async (req, res) => {
  try {
    const { userId, rideToken, endCoords } = req.body;

    if (!userId || !rideToken || !endCoords) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const ride = await RideSession.findOne({ _id: rideToken, userId, status: 'active' });
    if (!ride) {
      return res.status(404).json({ error: 'No active ride found' });
    }

    // Calculate distance
    const distance = calculateDistance(ride.startCoords, endCoords);
    
    // Fare calculation: ₹10 base + ₹5 per km
    const fare = Math.max(10, Math.round(10 + (distance * 5)));

    // Get user and check wallet balance
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.walletBalance < fare) {
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }

    // Deduct fare from wallet
    user.walletBalance -= fare;
    await user.save();

    // Update ride
    ride.endCoords = endCoords;
    ride.endTime = new Date();
    ride.fare = fare;
    ride.totalDistance = distance;
    ride.status = 'completed';
    await ride.save();

    // Log transaction
    await Transaction.create({
      userId: user._id,
      amount: fare,
      type: 'fare_deduction',
      status: 'completed'
    });

    res.json({ 
      success: true, 
      fare,
      distance: distance.toFixed(2),
      remainingBalance: user.walletBalance
    });
  } catch (error) {
    console.error('Error ending ride:', error);
    res.status(500).json({ error: 'Failed to end ride' });
  }
});

// Get user's ride history
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const rides = await RideSession.find({ userId })
      .populate('busId')
      .populate('routeId')
      .sort({ startTime: -1 });
    
    res.json({ rides });
  } catch (error) {
    console.error('Error fetching ride history:', error);
    res.status(500).json({ error: 'Failed to fetch ride history' });
  }
});

// Get active rides (for admin)
router.get('/active', async (req, res) => {
  try {
    const activeRides = await RideSession.find({ status: 'active' })
      .populate('userId')
      .populate('busId')
      .populate('routeId');
    
    res.json({ activeRides });
  } catch (error) {
    console.error('Error fetching active rides:', error);
    res.status(500).json({ error: 'Failed to fetch active rides' });
  }
});

// Get active ride for specific user
router.get('/active/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const activeRide = await RideSession.findOne({ userId, status: 'active' })
      .populate('busId')
      .populate('routeId');
    
    if (!activeRide) {
      return res.json({ hasActiveRide: false });
    }
    
    res.json({ hasActiveRide: true, ride: activeRide });
  } catch (error) {
    console.error('Error fetching active ride:', error);
    res.status(500).json({ error: 'Failed to fetch active ride' });
  }
});

export default router;
