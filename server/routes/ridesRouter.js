
import express from 'express';
import mongoose from 'mongoose';
import Ride from '../models/Ride.js';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import Route from '../models/Route.js';
import Bus from '../models/Bus.js';

const router = express.Router();

// DistanceMatrix.ai API integration
const calculateRealDistance = async (lat1, lon1, lat2, lon2) => {
  const DISTANCE_MATRIX_API_KEY = 'gTjz3x0YNfNW9hnEqh2Km4YjtMKPJuxkUTehdpvOYYUuwTqx0z0CQetvQgwhXymS';
  const DISTANCE_MATRIX_BASE_URL = 'https://api.distancematrix.ai/maps/api/distancematrix/json';
  
  try {
    console.log('🚀 Using DistanceMatrix.ai API for ride calculation');
    const url = `${DISTANCE_MATRIX_BASE_URL}?origins=${lat1},${lon1}&destinations=${lat2},${lon2}&key=${DISTANCE_MATRIX_API_KEY}`;
    
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      
      if (data.status === 'OK' && data.rows?.[0]?.elements?.[0]?.status === 'OK') {
        const element = data.rows[0].elements[0];
        return {
          distance: element.distance.value / 1000, // Convert meters to km
          duration: element.duration.value / 60, // Convert seconds to minutes
          realWorld: true,
          method: 'distancematrix_ai'
        };
      }
    }
  } catch (error) {
    console.warn('DistanceMatrix.ai API failed, falling back to Haversine:', error);
  }
  
  // Fallback to Haversine formula
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

// Get all rides (for admin dashboard)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, userId } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (userId) query.userId = userId;
    
    const rides = await Ride.find(query)
      .populate('routeId', 'start end')
      .populate('busId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Ride.countDocuments(query);
    
    res.json({
      rides,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching rides:', error);
    res.status(500).json({ error: 'Failed to fetch rides' });
  }
});

// Get ride statistics (for admin dashboard)
router.get('/stats', async (req, res) => {
  try {
    const [totalRides, activeRides, completedRides, totalRevenue] = await Promise.all([
      Ride.countDocuments(),
      Ride.countDocuments({ status: 'active' }),
      Ride.countDocuments({ status: 'completed' }),
      Ride.aggregate([
        { $match: { status: 'completed', paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$fare' } } }
      ])
    ]);
    
    res.json({
      totalRides,
      activeRides,
      completedRides,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (error) {
    console.error('Error fetching ride stats:', error);
    res.status(500).json({ error: 'Failed to fetch ride statistics' });
  }
});

// Start a new ride
router.post('/start', async (req, res) => {
  try {
    const { userId, latitude, longitude, routeId, busId, startStation } = req.body;
    
    if (!userId || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if user already has an active ride
    const existingRide = await Ride.findOne({ userId, status: 'active' });
    if (existingRide) {
      return res.status(400).json({ error: 'User already has an active ride' });
    }
    
    const newRide = new Ride({
      userId,
      routeId,
      busId,
      startStation,
      startLocation: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        timestamp: new Date()
      },
      status: 'active'
    });
    
    await newRide.save();
    
    res.status(201).json({
      success: true,
      ride: newRide
    });
  } catch (error) {
    console.error('Error starting ride:', error);
    res.status(500).json({ error: 'Failed to start ride' });
  }
});

// End a ride with enhanced calculations
router.put('/:rideId/end', async (req, res) => {
  try {
    const { rideId } = req.params;
    const { latitude, longitude, endStation } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(rideId)) {
      return res.status(400).json({ error: 'Invalid ride ID format' });
    }
    
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }
    
    if (ride.status !== 'active') {
      return res.status(400).json({ error: 'Ride is not active' });
    }

    // Get user's concession type
    const user = await User.findOne({ clerkId: ride.userId });
    const concessionType = user?.concessionType || 'general';
    
    // Calculate real-world distance and fare using DistanceMatrix.ai
    const distanceResult = await calculateRealDistance(
      ride.startLocation.latitude,
      ride.startLocation.longitude,
      parseFloat(latitude),
      parseFloat(longitude)
    );
    
    const fareResult = calculateFareWithConcession(distanceResult.distance, concessionType);
    
    // Update ride with comprehensive data
    ride.endLocation = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timestamp: new Date()
    };
    ride.endStation = endStation;
    ride.status = 'completed';
    ride.distance = distanceResult.distance;
    ride.realWorldDistance = distanceResult.realWorld;
    ride.calculationMethod = distanceResult.method;
    ride.duration = distanceResult.duration;
    ride.concessionType = concessionType;
    ride.originalFare = fareResult.originalFare;
    ride.discountAmount = fareResult.discountAmount;
    ride.discountPercentage = fareResult.discountPercentage;
    ride.fare = fareResult.finalFare;
    
    await ride.save();
    
    // Try to deduct fare from wallet
    let deductionResult = { status: 'failed', message: 'Payment processing failed' };
    
    try {
      let wallet = await Wallet.findOne({ userId: ride.userId });
      
      if (!wallet) {
        wallet = new Wallet({ userId: ride.userId, balance: 0, transactions: [] });
        await wallet.save();
      }
      
      if (wallet.balance >= ride.fare) {
        await wallet.deductFunds(ride.fare, `Ride fare - ${ride.distance.toFixed(2)}km (${ride.concessionType} concession)`, ride._id);
        ride.paymentStatus = 'paid';
        await ride.save();
        
        deductionResult = { 
          status: 'success', 
          message: `₹${ride.fare} deducted from wallet. Savings: ₹${ride.discountAmount}. New balance: ₹${(wallet.balance - ride.fare).toFixed(2)}`
        };
      } else {
        ride.paymentStatus = 'failed';
        await ride.save();
        
        deductionResult = { 
          status: 'insufficient_funds', 
          message: `Insufficient funds. Required: ₹${ride.fare}, Available: ₹${wallet.balance.toFixed(2)}`
        };
      }
    } catch (walletError) {
      console.error('Wallet deduction error:', walletError);
      ride.paymentStatus = 'failed';
      await ride.save();
      
      deductionResult = { 
        status: 'error', 
        message: `Payment error: ${walletError.message}` 
      };
    }
    
    res.json({
      success: true,
      ride: {
        id: ride._id,
        distance: ride.distance,
        realWorldDistance: ride.realWorldDistance,
        calculationMethod: ride.calculationMethod,
        originalFare: ride.originalFare,
        discountAmount: ride.discountAmount,
        discountPercentage: ride.discountPercentage,
        finalFare: ride.fare,
        concessionType: ride.concessionType,
        duration: ride.duration,
        paymentStatus: ride.paymentStatus,
        startTime: ride.startLocation.timestamp,
        endTime: ride.endLocation.timestamp
      },
      deduction: deductionResult
    });
  } catch (error) {
    console.error('Error ending ride:', error);
    res.status(500).json({ error: 'Failed to end ride' });
  }
});

// Get user ride history
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const rides = await Ride.find({ userId })
      .populate('routeId', 'start end')
      .populate('busId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Ride.countDocuments({ userId });
    
    res.json({
      rides,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching user rides:', error);
    res.status(500).json({ error: 'Failed to fetch user rides' });
  }
});

// Get active ride for user
router.get('/active/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const activeRide = await Ride.findOne({ userId, status: 'active' })
      .populate('routeId', 'start end')
      .populate('busId', 'name');
    
    if (!activeRide) {
      return res.status(404).json({ error: 'No active ride found' });
    }
    
    res.json({
      active: true,
      ride: activeRide
    });
  } catch (error) {
    console.error('Error fetching active ride:', error);
    res.status(500).json({ error: 'Failed to fetch active ride' });
  }
});

export default router;
