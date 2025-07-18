/**
 * API Routes
 * 
 * Defines all API endpoints and routes for the application.
 */

const express = require('express');
const router = express.Router();

// Import route modules
const documentRoutes = require('./routes/document.routes');
const googleDriveRoutes = require('./routes/google-drive.routes');
const panjabDigilibRoutes = require('./routes/panjabdigilib.routes');
const processingRoutes = require('./routes/processing.routes');
const contentRoutes = require('./routes/content.routes');
const distributionRoutes = require('./routes/distribution.routes');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');

// API version prefix
const API_VERSION = require('../config').server.apiVersion;
const BASE_PATH = `/${API_VERSION}`;

// Register routes
router.use(`${BASE_PATH}/documents`, documentRoutes);
router.use(`${BASE_PATH}/google-drive`, googleDriveRoutes);
router.use(`${BASE_PATH}/panjabdigilib`, panjabDigilibRoutes);
router.use(`${BASE_PATH}/processing`, processingRoutes);
router.use(`${BASE_PATH}/content`, contentRoutes);
router.use(`${BASE_PATH}/distribution`, distributionRoutes);
router.use(`${BASE_PATH}/auth`, authRoutes);
router.use(`${BASE_PATH}/admin`, adminRoutes);

// API documentation route
router.get(`${BASE_PATH}/docs`, (req, res) => {
  res.status(200).json({
    message: 'API Documentation',
    version: API_VERSION,
    endpoints: {
      documents: `${BASE_PATH}/documents`,
      googleDrive: `${BASE_PATH}/google-drive`,
      panjabdigilib: `${BASE_PATH}/panjabdigilib`,
      processing: `${BASE_PATH}/processing`,
      content: `${BASE_PATH}/content`,
      distribution: `${BASE_PATH}/distribution`,
      auth: `${BASE_PATH}/auth`,
      admin: `${BASE_PATH}/admin`,
    }
  });
});

module.exports = router;