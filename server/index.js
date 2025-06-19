
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connect } from './utils/mongoConnect.js';
import routesRouter from './routes/routesRouter.js';
import busesRouter from './routes/busesRouter.js';
import stationsRouter from './routes/stationsRouter.js';
import ticketsRouter from './routes/ticketsRouter.js';
import passesRouter from './routes/passesRouter.js';
import passUsageRouter from './routes/passUsageRouter.js';
import ridesRouter from './routes/ridesRouter.js';
import tripsRouter from './routes/tripsRouter.js';
import usersRouter from './routes/usersRouter.js';
import paymentsRouter from './routes/paymentsRouter.js';
import checkoutRouter from './routes/checkoutRouter.js';
import walletRouter from './routes/walletRouter.js';
import webhookRouter from './routes/webhookRouter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001; // Changed default port to 3001

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Webhook route MUST come before express.json() middleware
// because Stripe webhooks need raw body
app.use('/api/webhook', webhookRouter);

// Regular JSON middleware for all other routes
app.use(express.json());

// Connect to MongoDB
connect();

// Routes
app.use('/api/routes', routesRouter);
app.use('/api/buses', busesRouter);
app.use('/api/stations', stationsRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/passes', passesRouter);
app.use('/api/pass-usage', passUsageRouter);
app.use('/api/rides', ridesRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/users', usersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/wallet', walletRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Handle port conflicts gracefully
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ Port ${PORT} is busy, trying port ${PORT + 1}`);
    server.listen(PORT + 1, () => {
      console.log(`🚀 Server running on port ${PORT + 1}`);
    });
  } else {
    console.error('❌ Server error:', err);
  }
});
