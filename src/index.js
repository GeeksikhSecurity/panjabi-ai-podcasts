/**
 * Punjabi AI Podcasts - Main Application Entry Point
 * 
 * This file initializes the application, sets up middleware,
 * connects to databases, and starts the server.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { logger } = require('./utils/logger');
const config = require('./config');
const routes = require('./api/routes');
const { 
  securityHeaders, 
  rateLimit, 
  logAuthentication, 
  validateJwt, 
  enforceMfa 
} = require('./middleware/security.middleware');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Apply security middleware
app.use(helmet());
app.use(cors());
app.use(securityHeaders);
app.use(rateLimit);
app.use(logAuthentication);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// JWT validation for protected routes
app.use(validateJwt);

// MFA enforcement for admin routes
app.use(enforceMfa);

// API routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || 'INTERNAL_ERROR'
    }
  });
});

// Start the server
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

module.exports = { app, server };