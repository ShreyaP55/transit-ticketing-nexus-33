
import express from 'express';
import mongoose from 'mongoose';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';
import User from '../models/User.js';
import Ride from '../models/Ride.js';
import Trip from '../models/Trip.js';
import Pass from '../models/Pass.js';
import PassUsage from '../models/PassUsage.js';

const router = express.Router();

// Apply authentication and admin check to all routes
router.use(authenticateUser);
router.use(requireAdmin);

// Get dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      activeTrips,
      completedRides,
      totalPasses,
      pendingVerifications
    ] = await Promise.all([
      User.countDocuments(),
      Trip.countDocuments({ active: true }),
      Ride.countDocuments({ active: false }),
      Pass.countDocuments({ active: true }),
      User.countDocuments({ verificationStatus: 'pending' })
    ]);

    // Calculate today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRevenue = await Ride.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
          active: false
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$fare' }
        }
      }
    ]);

    const revenue = todayRevenue.length > 0 ? todayRevenue[0].totalRevenue : 0;

    res.json({
      totalUsers,
      activeTrips,
      completedRides,
      totalPasses,
      pendingVerifications,
      todayRevenue: revenue
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get active users with current trips
router.get('/users/active', async (req, res) => {
  try {
    const activeUsers = await Trip.aggregate([
      {
        $match: { active: true }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: 'clerkId',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          startLocation: 1,
          createdAt: 1,
          'user.firstName': 1,
          'user.lastName': 1,
          'user.email': 1,
          'user.concessionType': 1
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    res.json(activeUsers);
  } catch (error) {
    console.error('Error fetching active users:', error);
    res.status(500).json({ error: 'Failed to fetch active users' });
  }
});

// Get completed rides with details
router.get('/rides/completed', async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    const matchConditions = { active: false };
    
    if (startDate || endDate) {
      matchConditions.createdAt = {};
      if (startDate) matchConditions.createdAt.$gte = new Date(startDate);
      if (endDate) matchConditions.createdAt.$lte = new Date(endDate);
    }

    const completedRides = await Ride.aggregate([
      {
        $match: matchConditions
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: 'clerkId',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          startLocation: 1,
          endLocation: 1,
          fare: 1,
          createdAt: 1,
          updatedAt: 1,
          'user.firstName': 1,
          'user.lastName': 1,
          'user.email': 1,
          'user.concessionType': 1
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $skip: (parseInt(page) - 1) * parseInt(limit)
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    const totalRides = await Ride.countDocuments(matchConditions);
    
    res.json({
      rides: completedRides,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalRides,
        pages: Math.ceil(totalRides / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching completed rides:', error);
    res.status(500).json({ error: 'Failed to fetch completed rides' });
  }
});

// Get pass verification status and statistics
router.get('/passes/verification', async (req, res) => {
  try {
    const [verificationStats, recentVerifications] = await Promise.all([
      User.aggregate([
        {
          $group: {
            _id: '$verificationStatus',
            count: { $sum: 1 },
            concessionTypes: { $push: '$concessionType' }
          }
        }
      ]),
      User.find({
        verificationStatus: { $in: ['pending', 'verified', 'rejected'] }
      })
      .select('firstName lastName email concessionType verificationStatus verificationDate')
      .sort({ verificationDate: -1 })
      .limit(20)
    ]);

    // Get pass usage statistics
    const passUsageStats = await PassUsage.aggregate([
      {
        $group: {
          _id: '$passId',
          usageCount: { $sum: 1 },
          lastUsed: { $max: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'passes',
          localField: '_id',
          foreignField: '_id',
          as: 'pass'
        }
      },
      {
        $unwind: '$pass'
      },
      {
        $project: {
          passId: '$_id',
          usageCount: 1,
          lastUsed: 1,
          'pass.routeId': 1,
          'pass.userId': 1,
          'pass.active': 1
        }
      }
    ]);

    res.json({
      verificationStats,
      recentVerifications,
      passUsageStats
    });
  } catch (error) {
    console.error('Error fetching pass verification data:', error);
    res.status(500).json({ error: 'Failed to fetch pass verification data' });
  }
});

export default router;
