
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
import walletRouter from './routes/walletRouter.js';
import rideSessionRouter from './routes/rideSessionRouter.js';
import busLocationRouter from './routes/busLocationRouter.js';
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
app.use('/api/wallet', walletRouter);
app.use('/api/ride-sessions', rideSessionRouter);
app.use('/api/bus-location', busLocationRouter);

// Root route
app.get('/', (req, res) => {
  res.send('Uber-like Bus Transit API Server is running');
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Uber-like Bus Transit Server running on port ${PORT}`);
});
