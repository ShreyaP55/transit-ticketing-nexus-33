
import { clerkClient } from '@clerk/clerk-sdk-node';
import jwt from 'jsonwebtoken';

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }
    
    const token = authHeader.substring(7);
    
    try {
      // Verify the JWT token with Clerk
      const payload = await clerkClient.verifyToken(token);
      
      // Get user details from Clerk
      const user = await clerkClient.users.getUser(payload.sub);
      
      req.user = {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        role: user.publicMetadata?.role || 'user'
      };
      
      next();
    } catch (clerkError) {
      console.error('Clerk token verification failed:', clerkError);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
};

export const requireOwnership = (userIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const resourceUserId = req.body[userIdField] || req.params[userIdField] || req.query[userIdField];
    
    if (req.user.role !== 'admin' && req.user.id !== resourceUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    next();
  };
};

// Rate limiting for sensitive operations
export const createAuthRateLimit = () => {
  return (req, res, next) => {
    // Simple in-memory rate limiting (in production, use Redis)
    const key = req.ip;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 5;
    
    if (!global.authAttempts) {
      global.authAttempts = new Map();
    }
    
    const attempts = global.authAttempts.get(key) || [];
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return res.status(429).json({ error: 'Too many authentication attempts' });
    }
    
    validAttempts.push(now);
    global.authAttempts.set(key, validAttempts);
    
    next();
  };
};
