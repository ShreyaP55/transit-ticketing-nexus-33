
import express from 'express';
import User from '../models/User.js';
import RideSession from '../models/RideSession.js';
import Pass from '../models/Pass.js';
import Route from '../models/Route.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();

// Get admin dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [
      userCount,
      activeRideCount,
      activePassCount,
      routeCount,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments(),
      RideSession.countDocuments({ status: 'active' }),
      Pass.countDocuments({ expiryDate: { $gte: new Date() } }),
      Route.countDocuments(),
      Transaction.aggregate([
        { $match: { type: { $in: ['fare_deduction', 'stripe_topup'] }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    res.json({
      userCount,
      activeRideCount,
      activePassCount,
      routeCount,
      totalRevenue: revenue
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get all users with their wallet balances
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const users = await User.find({})
      .select('clerkId firstName lastName email walletBalance createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments();

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

// Get recent transactions
router.get('/transactions', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const transactions = await Transaction.find({})
      .populate('userId', 'firstName lastName email')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments();

    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get revenue analytics
router.get('/revenue', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const revenueData = await Transaction.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          type: { $in: ['fare_deduction', 'stripe_topup'] },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            type: '$type'
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    res.json({ revenueData });
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    res.status(500).json({ error: 'Failed to fetch revenue data' });
  }
});

export default router;
