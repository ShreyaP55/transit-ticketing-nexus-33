
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import busesRouter from './routes/busesRouter.js';
import routesRouter from './routes/routesRouter.js';
import stationsRouter from './routes/stationsRouter.js';
import ticketsRouter from './routes/ticketsRouter.js';
import passesRouter from './routes/passesRouter.js';
import passUsageRouter from './routes/passUsageRouter.js';
import paymentsRouter from './routes/paymentsRouter.js';
import usersRouter from './routes/usersRouter.js';
import tripsRouter from './routes/tripsRouter.js';
import ridesRouter from './routes/ridesRouter.js';
import walletRouter from './routes/walletRouter.js';
import busLocationRouter from './routes/busLocationRouter.js';
import rideSessionRouter from './routes/rideSessionRouter.js';
import notificationRouter from './routes/notificationRouter.js';
import adminRouter from './routes/adminRouter.js';
import { connect } from './utils/mongoConnect.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
connect()
  .then(() => console.log('Connected to MongoDB via utility'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/buses', busesRouter);
app.use('/api/routes', routesRouter);
app.use('/api/stations', stationsRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/passes', passesRouter);
app.use('/api/pass-usage', passUsageRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/users', usersRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/rides', ridesRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/bus-locations', busLocationRouter);
app.use('/api/ride-sessions', rideSessionRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/admin', adminRouter);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Transit API Server is running',
    version: '2.0.0',
    endpoints: {
      routes: '/api/routes',
      buses: '/api/buses',
      stations: '/api/stations',
      tickets: '/api/tickets',
      passes: '/api/passes',
      rides: '/api/ride-sessions',
      locations: '/api/bus-locations',
      admin: '/api/admin',
      notifications: '/api/notifications'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
});
