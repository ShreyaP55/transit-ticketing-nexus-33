
import express from 'express';
import mongoose from 'mongoose';
import Trip from '../models/Trip.js';
import Wallet from '../models/Wallet.js';
import User from '../models/User.js';

const router = express.Router();

// DistanceMatrix.ai API function
const calculateRealDistance = async (lat1, lon1, lat2, lon2) => {
  const DISTANCE_MATRIX_API_KEY = 'gTjz3x0YNfNW9hnEqh2Km4YjtMKPJuxkUTehdpvOYYUuwTqx0z0CQetvQgwhXymS';
  const DISTANCE_MATRIX_BASE_URL = 'https://api.distancematrix.ai/maps/api/distancematrix/json';
  
  try {
    console.log('🚀 Using DistanceMatrix.ai API for trip calculation');
    const url = `${DISTANCE_MATRIX_BASE_URL}?origins=${lat1},${lon1}&destinations=${lat2},${lon2}&key=${DISTANCE_MATRIX_API_KEY}`;
    
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ DistanceMatrix.ai API response:', data);
      
      if (data.status === 'OK' && data.rows?.[0]?.elements?.[0]?.status === 'OK') {
        const element = data.rows[0].elements[0];
        return {
          distance: element.distance.value / 1000, // Convert meters to km
          duration: element.duration.value / 60, // Convert seconds to minutes
          realWorld: true,
          method: 'distancematrix_ai'
        };
      } else {
        console.warn('⚠️ DistanceMatrix.ai API returned non-OK status:', data.status);
      }
    }
  } catch (error) {
    console.warn('DistanceMatrix.ai API failed, falling back to Haversine:', error);
  }
  
  // Fallback to Haversine formula
  console.log('🔄 Using Haversine formula as fallback');
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return {
    distance: Math.round(distance * 100) / 100,
    duration: Math.round((distance / 40) * 60), // Assume 40 km/h average speed
    realWorld: false,
    method: 'haversine'
  };
};

// Enhanced fare calculation with concession
const calculateFareWithConcession = (distance, concessionType = 'general') => {
  const baseFare = 20;
  const perKmRate = 8;
  const originalFare = baseFare + (distance * perKmRate);
  
  // Concession discounts
  const discounts = {
    general: 0,
    student: 30,
    child: 50,
    women: 20,
    elderly: 40,
    disabled: 50
  };
  
  const discountPercentage = discounts[concessionType] || 0;
  const discountAmount = (originalFare * discountPercentage) / 100;
  const finalFare = originalFare - discountAmount;
  
  return {
    originalFare: Math.round(originalFare),
    discountAmount: Math.round(discountAmount),
    discountPercentage,
    finalFare: Math.round(finalFare)
  };
};

// Start a new trip
router.post('/start', async (req, res) => {
  try {
    const { userId, latitude, longitude } = req.body;
    
    if (!userId || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if user already has an active trip
    const existingTrip = await Trip.findOne({ userId, active: true });
    if (existingTrip) {
      return res.status(400).json({ error: 'User already has an active trip' });
    }
    
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
      trip: newTrip
    });
  } catch (error) {
    console.error('Error starting trip:', error);
    res.status(500).json({ error: 'Failed to start trip' });
  }
});

// End a trip with enhanced calculations using DistanceMatrix.ai
router.put('/:tripId/end', async (req, res) => {
  try {
    const { tripId } = req.params;
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ error: 'Invalid trip ID format' });
    }
    
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    if (!trip.active) {
      return res.status(400).json({ error: 'Trip is already completed' });
    }

    // Get user's concession type
    const user = await User.findOne({ clerkId: trip.userId });
    const concessionType = user?.concessionType || 'general';
    
    // Calculate real-world distance and fare using DistanceMatrix.ai
    const distanceResult = await calculateRealDistance(
      trip.startLocation.latitude,
      trip.startLocation.longitude,
      parseFloat(latitude),
      parseFloat(longitude)
    );
    
    const fareResult = calculateFareWithConcession(distanceResult.distance, concessionType);
    
    // Update trip with comprehensive data
    trip.endLocation = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timestamp: new Date()
    };
    trip.active = false;
    trip.distance = distanceResult.distance;
    trip.realWorldDistance = distanceResult.realWorld;
    trip.calculationMethod = distanceResult.method;
    trip.straightLineDistance = trip.calculateHaversineDistance();
    trip.duration = distanceResult.duration;
    trip.concessionType = concessionType;
    trip.originalFare = fareResult.originalFare;
    trip.discountAmount = fareResult.discountAmount;
    trip.discountPercentage = fareResult.discountPercentage;
    trip.fare = fareResult.finalFare;
    
    await trip.save();
    
    // Try to deduct fare from wallet
    let deductionResult = { status: 'failed', message: 'Payment processing failed' };
    
    try {
      let wallet = await Wallet.findOne({ userId: trip.userId });
      
      if (!wallet) {
        wallet = new Wallet({ userId: trip.userId, balance: 0, transactions: [] });
        await wallet.save();
      }
      
      if (wallet.balance >= trip.fare) {
        await wallet.deductFunds(trip.fare, `Trip fare - ${trip.distance.toFixed(2)}km (${trip.concessionType} concession)`, trip._id);
        deductionResult = { 
          status: 'success', 
          message: `₹${trip.fare} deducted from wallet. Savings: ₹${trip.discountAmount}. New balance: ₹${(wallet.balance - trip.fare).toFixed(2)}`
        };
      } else {
        deductionResult = { 
          status: 'insufficient_funds', 
          message: `Insufficient funds. Required: ₹${trip.fare}, Available: ₹${wallet.balance.toFixed(2)}`
        };
      }
    } catch (walletError) {
      console.error('Wallet deduction error:', walletError);
      deductionResult = { 
        status: 'error', 
        message: `Payment error: ${walletError.message}` 
      };
    }
    
    res.json({
      success: true,
      trip: {
        id: trip._id,
        distance: trip.distance,
        straightLineDistance: trip.straightLineDistance,
        realWorldDistance: trip.realWorldDistance,
        calculationMethod: trip.calculationMethod,
        originalFare: trip.originalFare,
        discountAmount: trip.discountAmount,
        discountPercentage: trip.discountPercentage,
        finalFare: trip.fare,
        concessionType: trip.concessionType,
        duration: trip.duration,
        startTime: trip.startLocation.timestamp,
        endTime: trip.endLocation.timestamp
      },
      deduction: deductionResult
    });
  } catch (error) {
    console.error('Error ending trip:', error);
    res.status(500).json({ error: 'Failed to end trip' });
  }
});

// Get active trip for user
router.get('/active/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const activeTrip = await Trip.findOne({ userId, active: true });
    
    if (!activeTrip) {
      return res.status(404).json({ error: 'No active trip found' });
    }
    
    res.json({
      active: true,
      trip: activeTrip
    });
  } catch (error) {
    console.error('Error fetching active trip:', error);
    res.status(500).json({ error: 'Failed to fetch active trip' });
  }
});

// Get user trip history
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const trips = await Trip.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(trips);
  } catch (error) {
    console.error('Error fetching user trips:', error);
    res.status(500).json({ error: 'Failed to fetch user trips' });
  }
});

// Get trip statistics (for admin dashboard)
router.get('/stats', async (req, res) => {
  try {
    const [totalTrips, activeTrips, completedTrips, totalRevenue] = await Promise.all([
      Trip.countDocuments(),
      Trip.countDocuments({ active: true }),
      Trip.countDocuments({ active: false }),
      Trip.aggregate([
        { $match: { active: false, fare: { $exists: true } } },
        { $group: { _id: null, total: { $sum: '$fare' } } }
      ])
    ]);
    
    res.json({
      totalTrips,
      activeTrips,
      completedTrips,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (error) {
    console.error('Error fetching trip stats:', error);
    res.status(500).json({ error: 'Failed to fetch trip statistics' });
  }
});

export default router;
