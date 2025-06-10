
import express from 'express';
import RideSession from '../models/RideSession.js';
import BusLocation from '../models/BusLocation.js';
import Wallet from '../models/Wallet.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Start a new ride session
router.post('/start', async (req, res) => {
  try {
    const { clerkId, userName, busId, busName, startCoords, busQRToken } = req.body;
    
    if (!clerkId || !busId || !startCoords || !startCoords.lat || !startCoords.lng) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if user already has an active ride
    const activeRide = await RideSession.findOne({ clerkId, status: 'active' });
    if (activeRide) {
      return res.status(400).json({ 
        error: 'User already has an active ride',
        existingRide: activeRide 
      });
    }
    
    // Verify bus exists and is active
    const busLocation = await BusLocation.findOne({ busId, isActive: true });
    if (!busLocation) {
      return res.status(404).json({ error: 'Bus not found or inactive' });
    }
    
    // Generate secure tokens
    const rideId = RideSession.generateRideId();
    const rideToken = RideSession.generateRideToken();
    
    // Create new ride session
    const newRide = new RideSession({
      rideId,
      clerkId,
      userName: userName || 'Unknown User',
      busId,
      busName: busName || `Bus ${busId}`,
      rideToken,
      startLocation: {
        latitude: parseFloat(startCoords.lat),
        longitude: parseFloat(startCoords.lng),
        timestamp: new Date(),
        accuracy: startCoords.accuracy || null
      },
      status: 'active'
    });
    
    await newRide.save();
    
    // Update bus with new active ride
    if (busLocation) {
      busLocation.activeRides.push(rideId);
      await busLocation.save();
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Ride started successfully',
      ride: {
        rideId: newRide.rideId,
        rideToken: newRide.rideToken,
        busId: newRide.busId,
        busName: newRide.busName,
        startTime: newRide.startTime,
        status: newRide.status
      }
    });
  } catch (error) {
    console.error('Error starting ride:', error);
    res.status(500).json({ error: 'Failed to start ride' });
  }
});

// End a ride session
router.post('/end', async (req, res) => {
  try {
    const { rideId, rideToken, endCoords, busPath } = req.body;
    
    if (!rideId || !rideToken || !endCoords) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Find the active ride with matching token
    const ride = await RideSession.findOne({ 
      rideId, 
      rideToken, 
      status: 'active' 
    });
    
    if (!ride) {
      return res.status(404).json({ error: 'Active ride not found or invalid token' });
    }
    
    // Update ride with end data
    ride.endLocation = {
      latitude: parseFloat(endCoords.lat),
      longitude: parseFloat(endCoords.lng),
      timestamp: new Date(),
      accuracy: endCoords.accuracy || null
    };
    
    ride.endTime = new Date();
    ride.status = 'completed';
    
    // Add bus path if provided
    if (busPath && Array.isArray(busPath)) {
      ride.busPath = busPath.map(point => ({
        latitude: parseFloat(point.lat),
        longitude: parseFloat(point.lng),
        timestamp: new Date(point.timestamp || Date.now()),
        speed: point.speed || 0,
        heading: point.heading || 0
      }));
    }
    
    // Calculate distance, duration, and fare
    ride.calculateDuration();
    const totalFare = ride.calculateFare();
    
    await ride.save();
    
    // Deduct fare from wallet
    try {
      const wallet = await Wallet.findOne({ userId: ride.clerkId });
      if (wallet && wallet.balance >= totalFare) {
        await wallet.deductFunds(totalFare, `Bus ride fare - ${ride.rideId}`, ride._id);
        ride.paymentStatus = 'completed';
        ride.walletTransactionId = wallet.transactions[wallet.transactions.length - 1]._id;
      } else {
        ride.paymentStatus = 'failed';
        console.log(`Insufficient funds for user ${ride.clerkId}, fare: ${totalFare}`);
      }
      await ride.save();
    } catch (walletError) {
      console.error('Wallet deduction error:', walletError);
      ride.paymentStatus = 'failed';
      await ride.save();
    }
    
    // Remove ride from bus active rides
    const busLocation = await BusLocation.findOne({ busId: ride.busId });
    if (busLocation) {
      busLocation.activeRides = busLocation.activeRides.filter(id => id !== rideId);
      await busLocation.save();
    }
    
    res.json({ 
      success: true, 
      message: 'Ride ended successfully',
      ride: {
        rideId: ride.rideId,
        distance: ride.totalDistance,
        fare: ride.totalFare,
        duration: ride.duration,
        paymentStatus: ride.paymentStatus,
        startTime: ride.startTime,
        endTime: ride.endTime
      }
    });
  } catch (error) {
    console.error('Error ending ride:', error);
    res.status(500).json({ error: 'Failed to end ride' });
  }
});

// Get active ride for a user
router.get('/active/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;
    
    const activeRide = await RideSession.findOne({ 
      clerkId, 
      status: 'active' 
    });
    
    if (!activeRide) {
      return res.json({ active: false });
    }
    
    // Get current bus location
    const busLocation = await BusLocation.findOne({ busId: activeRide.busId });
    
    res.json({ 
      active: true,
      ride: {
        ...activeRide.toObject(),
        currentBusLocation: busLocation ? busLocation.location : null
      }
    });
  } catch (error) {
    console.error('Error getting active ride:', error);
    res.status(500).json({ error: 'Failed to get active ride' });
  }
});

// Get all active rides (for admin)
router.get('/active', async (req, res) => {
  try {
    const activeRides = await RideSession.find({ status: 'active' })
      .sort({ startTime: -1 });
    
    res.json(activeRides);
  } catch (error) {
    console.error('Error getting active rides:', error);
    res.status(500).json({ error: 'Failed to get active rides' });
  }
});

// Get ride history for a user
router.get('/history/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const rides = await RideSession.find({ 
      clerkId, 
      status: { $in: ['completed', 'cancelled'] }
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await RideSession.countDocuments({ 
      clerkId, 
      status: { $in: ['completed', 'cancelled'] }
    });
    
    res.json({
      rides,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error getting ride history:', error);
    res.status(500).json({ error: 'Failed to get ride history' });
  }
});

// Update user location during ride
router.post('/update-location', async (req, res) => {
  try {
    const { rideId, rideToken, location } = req.body;
    
    if (!rideId || !rideToken || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const ride = await RideSession.findOne({ 
      rideId, 
      rideToken, 
      status: 'active' 
    });
    
    if (!ride) {
      return res.status(404).json({ error: 'Active ride not found' });
    }
    
    // Add location to user path
    ride.userPath.push({
      latitude: parseFloat(location.lat),
      longitude: parseFloat(location.lng),
      timestamp: new Date(),
      accuracy: location.accuracy || null,
      speed: location.speed || 0
    });
    
    await ride.save();
    
    res.json({ success: true, message: 'Location updated' });
  } catch (error) {
    console.error('Error updating user location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

export default router;
