
import express from 'express';
import User from '../models/User.js';
import Verification from '../models/Verification.js';
import Trip from '../models/Trip.js';
import { connect } from '../utils/mongoConnect.js';

const router = express.Router();

// Get user by clerk ID
router.get('/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;
    
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Get comprehensive user profile
router.get('/profile/:clerkId', async (req, res) => {
  try {
    await connect();
    const { clerkId } = req.params;
    
    // Get user data
    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get verification history
    const verifications = await Verification.find({ userId: clerkId })
      .sort({ submittedAt: -1 })
      .limit(10);
    
    // Get trip statistics
    const completedTrips = await Trip.find({ userId: clerkId, active: false });
    const totalRides = completedTrips.length;
    const totalAmount = completedTrips.reduce((sum, trip) => sum + (trip.originalFare || 0), 0);
    const totalSavings = completedTrips.reduce((sum, trip) => sum + (trip.discountAmount || 0), 0);
    const totalDistance = completedTrips.reduce((sum, trip) => sum + (trip.distance || 0), 0);
    
    // Get current verification status
    const latestVerification = verifications[0];
    
    const profileData = {
      // Basic user info
      clerkId: user.clerkId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      avatar: user.avatar,
      
      // Concession info
      concessionType: user.concessionType || 'general',
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      governmentIdType: user.governmentIdType,
      governmentIdNumber: user.governmentIdNumber,
      verificationStatus: user.verificationStatus || 'pending',
      verificationDate: user.verificationDate,
      documentExpiryDate: user.documentExpiryDate,
      verificationNotes: user.verificationNotes,
      
      // Verification history
      verificationHistory: verifications,
      
      // Statistics
      statistics: {
        totalRides,
        totalAmount: Math.round(totalAmount),
        totalSavings: Math.round(totalSavings),
        totalDistance: Math.round(totalDistance * 100) / 100,
        averageRideDistance: totalRides > 0 ? Math.round((totalDistance / totalRides) * 100) / 100 : 0,
        averageFare: totalRides > 0 ? Math.round(totalAmount / totalRides) : 0
      },
      
      // Latest verification
      latestVerification: latestVerification || null
    };
    
    res.json(profileData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Create or update user
router.post('/', async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName, username, avatar } = req.body;
    
    if (!clerkId || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const user = await User.findOneAndUpdate(
      { clerkId },
      {
        email,
        firstName,
        lastName,
        username,
        avatar
      },
      { new: true, upsert: true }
    );
    
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating or updating user:', error);
    res.status(500).json({ error: 'Failed to create or update user' });
  }
});

// Update user profile information
router.put('/profile/:clerkId', async (req, res) => {
  try {
    await connect();
    const { clerkId } = req.params;
    const updateData = req.body;
    
    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.verificationStatus;
    delete updateData.verificationDate;
    delete updateData.clerkId;
    
    const user = await User.findOneAndUpdate(
      { clerkId },
      updateData,
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Delete user
router.delete('/:clerkId', async (req, res) => {
  try {
    const { clerkId } = req.params;
    
    const user = await User.findOneAndDelete({ clerkId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
