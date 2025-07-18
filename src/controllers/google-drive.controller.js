/**
 * Google Drive Controller
 * 
 * Handles Google Drive integration operations and implements security controls.
 */

const { logger } = require('../utils/logger');
const { 
  generateAuthUrl, 
  getTokensFromCode, 
  listFiles, 
  importFromGoogleDrive 
} = require('../services/document/google-drive.service');
const { validateGoogleDriveImport } = require('../utils/validators/document.validator');

/**
 * Get Google Drive authentication URL
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAuthUrl = (req, res) => {
  try {
    // Get user from request (set by auth middleware)
    const user = req.user || {};
    
    // Generate authentication URL
    const authUrl = generateAuthUrl(user.id);
    
    // Return success response
    res.status(200).json({
      message: 'Google Drive authentication URL generated',
      authUrl
    });
  } catch (error) {
    logger.error(`Error in getAuthUrl controller: ${error.message}`);
    
    // Return appropriate error response
    res.status(500).json({
      error: {
        message: 'Failed to generate authentication URL',
        code: 'AUTH_URL_GENERATION_FAILED'
      }
    });
  }
};

/**
 * Handle Google Drive OAuth callback
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleOAuthCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).json({
        error: {
          message: 'Authorization code is required',
          code: 'AUTH_CODE_MISSING'
        }
      });
    }
    
    // Get tokens from authorization code
    const tokens = await getTokensFromCode(code);
    
    // In a real application, store these tokens securely for the user
    // For now, we'll just return them in the response
    
    // Log for compliance audit trail
    logger.info(`Compliance: Google Drive authorization completed`, {
      event: 'google_drive_authorization',
      userId: state || 'anonymous',
      timestamp: new Date().toISOString()
    });
    
    // Return success response
    res.status(200).json({
      message: 'Google Drive authorization successful',
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ? '[REDACTED]' : null, // Don't expose actual refresh token
        expiry_date: tokens.expiry_date
      }
    });
  } catch (error) {
    logger.error(`Error in handleOAuthCallback controller: ${error.message}`);
    
    // Return appropriate error response
    res.status(500).json({
      error: {
        message: 'Failed to complete authorization',
        code: 'AUTHORIZATION_FAILED'
      }
    });
  }
};

/**
 * List files from Google Drive
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const listDriveFiles = async (req, res) => {
  try {
    // Get tokens from request
    const { access_token, refresh_token } = req.body;
    
    if (!access_token) {
      return res.status(400).json({
        error: {
          message: 'Access token is required',
          code: 'ACCESS_TOKEN_MISSING'
        }
      });
    }
    
    // Get query parameters
    const { 
      query, 
      folderId, 
      pageSize, 
      pageToken, 
      orderBy 
    } = req.query;
    
    // List files from Google Drive
    const result = await listFiles(
      { access_token, refresh_token },
      { query, folderId, pageSize, pageToken, orderBy }
    );
    
    // Return success response
    res.status(200).json({
      message: 'Files retrieved successfully',
      files: result.files,
      nextPageToken: result.nextPageToken
    });
  } catch (error) {
    logger.error(`Error in listDriveFiles controller: ${error.message}`);
    
    // Return appropriate error response
    res.status(500).json({
      error: {
        message: 'Failed to list files',
        code: 'FILE_LISTING_FAILED'
      }
    });
  }
};

/**
 * Import file from Google Drive
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const importDriveFile = async (req, res) => {
  try {
    // Validate request body
    const validatedData = validateGoogleDriveImport(req.body);
    
    // Get tokens from request
    const { access_token, refresh_token } = req.body;
    
    if (!access_token) {
      return res.status(400).json({
        error: {
          message: 'Access token is required',
          code: 'ACCESS_TOKEN_MISSING'
        }
      });
    }
    
    // Get user from request (set by auth middleware)
    const user = req.user || {};
    
    // Import file from Google Drive
    const result = await importFromGoogleDrive(
      { access_token, refresh_token },
      validatedData.fileId,
      validatedData.metadata,
      user
    );
    
    // Return success response
    res.status(201).json({
      message: 'Document imported successfully',
      document: {
        id: result.document._id,
        title: result.document.title,
        author: result.document.author,
        language: result.document.language,
        status: result.document.status,
        uploadDate: result.document.uploadDate
      }
    });
  } catch (error) {
    logger.error(`Error in importDriveFile controller: ${error.message}`);
    
    // Return appropriate error response
    res.status(400).json({
      error: {
        message: error.message,
        code: 'IMPORT_FAILED'
      }
    });
  }
};

module.exports = {
  getAuthUrl,
  handleOAuthCallback,
  listDriveFiles,
  importDriveFile
};