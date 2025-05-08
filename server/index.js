
import express from 'express';
import mongoose from 'mongoose';
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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
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

// Root route
app.get('/', (req, res) => {
  res.send('Transit API Server is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
