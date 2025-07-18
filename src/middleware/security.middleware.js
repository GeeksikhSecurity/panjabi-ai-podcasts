/**
 * Security Middleware
 * 
 * Implements security controls and headers for the application.
 * Based on SOC2 security control requirements.
 */

const { logger } = require('../utils/logger');
const config = require('../config');

/**
 * Apply security headers to all responses
 */
const securityHeaders = (req, res, next) => {
  // Required security headers as per SOC2 controls
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  
  next();
};

/**
 * Rate limiting middleware
 * Simple implementation - for production, use a more robust solution like express-rate-limit
 */
const rateLimit = (req, res, next) => {
  // This is a placeholder for actual rate limiting implementation
  // In production, use a proper rate limiting library with Redis or similar backend
  
  // For now, just log the request for demonstration
  logger.info(`Rate limit check for ${req.ip}`);
  
  next();
};

/**
 * Log all authentication attempts
 */
const logAuthentication = (req, res, next) => {
  if (req.path.startsWith('/api/v1/auth')) {
    logger.info(`Authentication attempt from ${req.ip}`, {
      method: req.method,
      path: req.path,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

/**
 * Validate JWT tokens and enforce short expiration
 */
const validateJwt = (req, res, next) => {
  // Skip JWT validation for public routes
  if (req.path === '/api/v1/auth/login' || req.path === '/api/v1/auth/register' || req.path === '/health') {
    return next();
  }
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn(`Unauthorized access attempt: No token provided`, {
      method: req.method,
      path: req.path,
      ip: req.ip
    });
    
    return res.status(401).json({
      error: {
        message: 'Unauthorized: No token provided',
        code: 'UNAUTHORIZED'
      }
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  // This is a placeholder for actual JWT validation
  // In production, use a proper JWT library like jsonwebtoken
  
  // For now, just log the token validation for demonstration
  logger.info(`JWT validation for ${req.path}`);
  
  // TODO: Implement actual JWT validation with 15-minute expiration
  
  next();
};

/**
 * Enforce MFA for admin routes
 */
const enforceMfa = (req, res, next) => {
  // Check if this is an admin route
  if (req.path.startsWith('/api/v1/admin')) {
    // This is a placeholder for actual MFA validation
    // In production, implement proper MFA validation
    
    const mfaToken = req.headers['x-mfa-token'];
    
    if (!mfaToken) {
      logger.warn(`Admin access attempt without MFA`, {
        method: req.method,
        path: req.path,
        ip: req.ip
      });
      
      return res.status(403).json({
        error: {
          message: 'Forbidden: MFA required for admin access',
          code: 'MFA_REQUIRED'
        }
      });
    }
    
    // TODO: Implement actual MFA validation
    
    logger.info(`MFA validation for admin route ${req.path}`);
  }
  
  next();
};

module.exports = {
  securityHeaders,
  rateLimit,
  logAuthentication,
  validateJwt,
  enforceMfa
};