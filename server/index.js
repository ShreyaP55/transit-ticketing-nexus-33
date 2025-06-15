
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
import { connect } from './utils/mongoConnect.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
connect()
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running', 
    timestamp: new Date().toISOString() 
  });
});

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

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Transit API Server is running',
    version: '1.0.0',
    endpoints: [
      '/api/health',
      '/api/routes',
      '/api/buses', 
      '/api/stations',
      '/api/tickets',
      '/api/passes',
      '/api/pass-usage',
      '/api/payments',
      '/api/users',
      '/api/trips',
      '/api/rides',
      '/api/wallet'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
});
