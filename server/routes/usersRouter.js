import express from 'express';
import User from '../models/User.js';
import Verification from '../models/Verification.js';
import Ride from '../models/Ride.js';
import Ticket from '../models/Ticket.js';
import Pass from '../models/Pass.js';
import Wallet from '../models/Wallet.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Get comprehensive user profile
router.get('/profile/:clerkId', authenticateUser, async (req, res) => {
  try {
    const { clerkId } = req.params;
    
    // Fetch user data from MongoDB
    const user = await User.findOne({ clerkId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Fetch related data in parallel
    const [verification, wallet, rides, tickets, passes] = await Promise.all([
      Verification.findOne({ userId: clerkId }).sort({ createdAt: -1 }),
      Wallet.findOne({ userId: clerkId }),
      Ride.countDocuments({ userId: clerkId, status: 'completed' }),
      Ticket.countDocuments({ userId: clerkId }),
      Pass.countDocuments({ userId: clerkId })
    ]);
    
    // Calculate total savings from concessions
    const rideStats = await Ride.aggregate([
      { $match: { userId: clerkId, status: 'completed', paymentStatus: 'paid' } },
      {
        $group: {
          _id: null,
          totalRides: { $sum: 1 },
          totalAmount: { $sum: '$fare' },
          totalSavings: { $sum: '$discountAmount' },
          totalOriginalFare: { $sum: '$originalFare' }
        }
      }
    ]);
    
    const stats = rideStats[0] || {
      totalRides: 0,
      totalAmount: 0,
      totalSavings: 0,
      totalOriginalFare: 0
    };
    
    // Prepare comprehensive response
    const profileData = {
      // Basic user info
      clerkId: user.clerkId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      
      // Extended profile info
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      address: user.address,
      governmentId: user.governmentId,
      concessionType: user.concessionType,
      
      // Verification status
      verification: verification ? {
        status: verification.status,
        concessionType: verification.concessionType,
        documentType: verification.documentType,
        submittedAt: verification.createdAt,
        reviewedAt: verification.updatedAt,
        adminComments: verification.adminComments
      } : null,
      
      // Wallet info
      wallet: wallet ? {
        balance: wallet.balance,
        totalTransactions: wallet.transactions.length
      } : { balance: 0, totalTransactions: 0 },
      
      // Usage statistics
      statistics: {
        totalRides: stats.totalRides,
        totalTickets: tickets,
        totalPasses: passes,
        totalAmountSpent: stats.totalAmount,
        totalSavings: stats.totalSavings,
        totalOriginalFare: stats.totalOriginalFare,
        savingsPercentage: stats.totalOriginalFare > 0 
          ? Math.round((stats.totalSavings / stats.totalOriginalFare) * 100)
          : 0
      },
      
      // Account info
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.json(profileData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile/:clerkId', authenticateUser, async (req, res) => {
  try {
    const { clerkId } = req.params;
    const updateData = req.body;
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.clerkId;
    delete updateData.role;
    delete updateData.isActive;
    
    const user = await User.findOneAndUpdate(
      { clerkId },
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        address: user.address,
        concessionType: user.concessionType
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: `Validation failed: ${validationErrors.join(', ')}` });
    }
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Get user ride history with detailed info
router.get('/:clerkId/rides', authenticateUser, async (req, res) => {
  try {
    const { clerkId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { userId: clerkId };
    if (status) query.status = status;
    
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
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching user rides:', error);
    res.status(500).json({ error: 'Failed to fetch user rides' });
  }
});

// Get user statistics
router.get('/:clerkId/statistics', authenticateUser, async (req, res) => {
  try {
    const { clerkId } = req.params;
    
    const [rideStats, ticketStats, passStats, walletStats] = await Promise.all([
      // Ride statistics
      Ride.aggregate([
        { $match: { userId: clerkId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalFare: { $sum: '$fare' },
            totalSavings: { $sum: '$discountAmount' }
          }
        }
      ]),
      
      // Ticket statistics
      Ticket.aggregate([
        { $match: { userId: clerkId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$price' }
          }
        }
      ]),
      
      // Pass statistics
      Pass.aggregate([
        { $match: { userId: clerkId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$fare' }
          }
        }
      ]),
      
      // Wallet statistics
      Wallet.findOne({ userId: clerkId })
    ]);
    
    res.json({
      rides: rideStats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          totalFare: stat.totalFare || 0,
          totalSavings: stat.totalSavings || 0
        };
        return acc;
      }, {}),
      
      tickets: ticketStats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          totalAmount: stat.totalAmount || 0
        };
        return acc;
      }, {}),
      
      passes: passStats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          totalAmount: stat.totalAmount || 0
        };
        return acc;
      }, {}),
      
      wallet: {
        balance: walletStats?.balance || 0,
        totalTransactions: walletStats?.transactions?.length || 0
      }
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Get all users (admin only)
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, isActive } = req.query;
    
    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const users = await User.find(query)
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:clerkId', authenticateUser, async (req, res) => {
  try {
    const { clerkId } = req.params;
    
    const user = await User.findOne({ clerkId }).select('-__v');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create or update user (webhook endpoint)
router.post('/', async (req, res) => {
  try {
    const userData = req.body;
    
    const user = await User.findOneAndUpdate(
      { clerkId: userData.clerkId },
      userData,
      { upsert: true, new: true, runValidators: true }
    );
    
    res.status(201).json({
      success: true,
      message: 'User created/updated successfully',
      user
    });
  } catch (error) {
    console.error('Error creating/updating user:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: `Validation failed: ${validationErrors.join(', ')}` });
    }
    res.status(500).json({ error: 'Failed to create/update user' });
  }
});

// Update user (admin only)
router.put('/:clerkId', authenticateUser, async (req, res) => {
  try {
    const { clerkId } = req.params;
    const updateData = req.body;
    
    const user = await User.findOneAndUpdate(
      { clerkId },
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: `Validation failed: ${validationErrors.join(', ')}` });
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/:clerkId', authenticateUser, async (req, res) => {
  try {
    const { clerkId } = req.params;
    
    const user = await User.findOneAndDelete({ clerkId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
