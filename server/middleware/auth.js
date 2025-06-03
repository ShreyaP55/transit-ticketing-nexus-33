
import { clerkClient } from '@clerk/clerk-sdk-node';

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }
    
    const token = authHeader.substring(7);
    
    try {
      // Verify the token with Clerk
      const user = await clerkClient.users.getUser(token);
      req.user = {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        role: user.publicMetadata?.role || 'user'
      };
      
      next();
    } catch (clerkError) {
      console.error('Clerk verification failed:', clerkError);
      return res.status(401).json({ error: 'Invalid token' });
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
