/**
 * Google Drive Routes
 * 
 * Handles all Google Drive integration API endpoints including:
 * - Authentication
 * - File listing
 * - File import
 * 
 * Implements security controls and compliance requirements.
 */

const express = require('express');
const router = express.Router();
const { logger } = require('../../utils/logger');
const { 
  getAuthUrl, 
  handleOAuthCallback, 
  listDriveFiles, 
  importDriveFile 
} = require('../../controllers/google-drive.controller');

/**
 * Rate limiting for Google Drive operations
 * This is a simple implementation - in production, use a more robust solution
 */
const driveRateLimit = (req, res, next) => {
  // TODO: Implement proper rate limiting
  next();
};

/**
 * @route GET /api/v1/google-drive/auth
 * @desc Get Google Drive authentication URL
 * @access Private
 */
router.get('/auth', getAuthUrl);

/**
 * @route GET /api/v1/google-drive/callback
 * @desc Handle Google Drive OAuth callback
 * @access Public
 */
router.get('/callback', handleOAuthCallback);

/**
 * @route POST /api/v1/google-drive/files
 * @desc List files from Google Drive
 * @access Private
 */
router.post('/files', driveRateLimit, listDriveFiles);

/**
 * @route POST /api/v1/google-drive/import
 * @desc Import file from Google Drive
 * @access Private
 */
router.post('/import', driveRateLimit, importDriveFile);

module.exports = router;