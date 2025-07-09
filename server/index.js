
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routesRouter from './routes/routesRouter.js';
import busesRouter from './routes/busesRouter.js';
import stationsRouter from './routes/stationsRouter.js';
import ticketsRouter from './routes/ticketsRouter.js';
import passesRouter from './routes/passesRouter.js';
import paymentsRouter from './routes/paymentsRouter.js';
import checkoutRouter from './routes/checkoutRouter.js';
import webhookRouter from './routes/webhookRouter.js';
import usersRouter from './routes/usersRouter.js';
import tripsRouter from './routes/tripsRouter.js';
import ridesRouter from './routes/ridesRouter.js';
import walletRouter from './routes/walletRouter.js';
import passUsageRouter from './routes/passUsageRouter.js';
import verificationRouter from './routes/verificationRouter.js';
import adminRouter from './routes/adminRouter.js';

dotenv.config();

const app = express();

// Enhanced CORS Configuration for development and production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8081',
      'https://id-preview--cb03e5f7-7bb7-48ab-8c19-9dcaa2e3afb0.lovable.app',
      'https://businn.onrender.com',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow all origins in development
    }
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Helmet for security headers - modified for development
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false // Disable CSP in development
}));

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for development
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for localhost in development
    return req.ip === '127.0.0.1' || req.ip === '::1' || req.hostname === 'localhost';
  }
});
app.use(limiter);

// JSON parsing with increased limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('Origin')}`);
  next();
});

// Routes
app.use('/api/routes', routesRouter);
app.use('/api/buses', busesRouter);
app.use('/api/stations', stationsRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/passes', passesRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/webhook', webhookRouter);
app.use('/api/users', usersRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/rides', ridesRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/pass-usage', passUsageRouter);
app.use('/api/verification', verificationRouter);
app.use('/api/admin', adminRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// MongoDB connection - Fixed to use correct environment variable
const mongoURL = process.env.MONGODB_URI || process.env.MONGO_URL;

if (!mongoURL) {
  console.error('❌ MongoDB URI not found in environment variables');
  console.error('Please set MONGODB_URI in your .env file');
  process.exit(1);
}

console.log('🔗 Attempting to connect to MongoDB...');
mongoose.connect(mongoURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
  console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  console.error('🔍 Check your MONGODB_URI in .env file');
  process.exit(1);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ error: 'Something broke!', message: err.message });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Server startup
const port = process.env.PORT || 3001;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`🌐 Server accessible at http://localhost:${port}`);
  console.log(`📡 API endpoints available at http://localhost:${port}/api`);
});
