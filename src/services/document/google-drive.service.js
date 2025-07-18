/**
 * Google Drive Integration Service
 * 
 * Handles integration with Google Drive API for document retrieval.
 * Implements security controls and compliance requirements.
 */

const { google } = require('googleapis');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { Readable } = require('stream');
const config = require('../../config');
const { logger } = require('../../utils/logger');
const { processDocumentUpload } = require('./upload.service');
const Document = require('../../models/document.model');

/**
 * Create OAuth2 client for Google Drive API
 * 
 * @returns {OAuth2Client} Google OAuth2 client
 */
const createOAuth2Client = () => {
  return new google.auth.OAuth2(
    config.googleDrive.clientId,
    config.googleDrive.clientSecret,
    config.googleDrive.redirectUri
  );
};

/**
 * Generate authentication URL for Google Drive access
 * 
 * @param {string} userId - User ID for state parameter
 * @returns {string} Authentication URL
 */
const generateAuthUrl = (userId) => {
  const oauth2Client = createOAuth2Client();
  
  // Generate a URL that asks for permissions to access Google Drive files
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // 'offline' gets refresh token
    scope: config.googleDrive.scopes,
    state: userId || 'anonymous', // Pass user ID in state for security
    prompt: 'consent' // Force consent screen to ensure getting refresh_token
  });
  
  logger.info(`Google Drive auth URL generated for user`);
  
  return authUrl;
};

/**
 * Exchange authorization code for tokens
 * 
 * @param {string} code - Authorization code from Google
 * @returns {Promise<Object>} Tokens object
 */
const getTokensFromCode = async (code) => {
  try {
    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    
    logger.info(`Google Drive tokens obtained successfully`);
    
    // Log for compliance audit trail (without sensitive data)
    logger.info(`Compliance: Google Drive authorization completed`, {
      event: 'google_drive_authorization',
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiryDate: tokens.expiry_date,
      timestamp: new Date().toISOString()
    });
    
    return tokens;
  } catch (error) {
    logger.error(`Error getting tokens from code: ${error.message}`);
    
    // Log for compliance audit trail
    logger.error(`Compliance: Google Drive authorization failed`, {
      event: 'google_drive_authorization_failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    throw new Error(`Failed to get tokens: ${error.message}`);
  }
};

/**
 * List files in Google Drive
 * 
 * @param {Object} tokens - OAuth tokens
 * @param {Object} options - Query options
 * @returns {Promise<Array>} List of files
 */
const listFiles = async (tokens, options = {}) => {
  try {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials(tokens);
    
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    // Default query for PDF files
    const defaultQuery = "mimeType='application/pdf'";
    
    // Build query with options
    let query = options.query || defaultQuery;
    if (options.folderId) {
      query += ` and '${options.folderId}' in parents`;
    }
    
    // Execute the query
    const response = await drive.files.list({
      q: query,
      pageSize: options.pageSize || 10,
      pageToken: options.pageToken,
      fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink)',
      orderBy: options.orderBy || 'modifiedTime desc'
    });
    
    logger.info(`Google Drive files listed successfully: ${response.data.files.length} files`);
    
    // Log for compliance audit trail
    logger.info(`Compliance: Google Drive files listed`, {
      event: 'google_drive_files_listed',
      fileCount: response.data.files.length,
      timestamp: new Date().toISOString()
    });
    
    return {
      files: response.data.files,
      nextPageToken: response.data.nextPageToken
    };
  } catch (error) {
    logger.error(`Error listing Google Drive files: ${error.message}`);
    
    // Log for compliance audit trail
    logger.error(`Compliance: Google Drive files listing failed`, {
      event: 'google_drive_files_listing_failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    throw new Error(`Failed to list files: ${error.message}`);
  }
};

/**
 * Get file metadata from Google Drive
 * 
 * @param {Object} tokens - OAuth tokens
 * @param {string} fileId - Google Drive file ID
 * @returns {Promise<Object>} File metadata
 */
const getFileMetadata = async (tokens, fileId) => {
  try {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials(tokens);
    
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    const response = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, description'
    });
    
    logger.info(`Google Drive file metadata retrieved successfully: ${fileId}`);
    
    return response.data;
  } catch (error) {
    logger.error(`Error getting Google Drive file metadata: ${error.message}`);
    throw new Error(`Failed to get file metadata: ${error.message}`);
  }
};

/**
 * Download file from Google Drive
 * 
 * @param {Object} tokens - OAuth tokens
 * @param {string} fileId - Google Drive file ID
 * @returns {Promise<Buffer>} File buffer
 */
const downloadFile = async (tokens, fileId) => {
  try {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials(tokens);
    
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    // Get file metadata first to verify it's a PDF
    const metadata = await getFileMetadata(tokens, fileId);
    
    if (metadata.mimeType !== 'application/pdf') {
      throw new Error(`Invalid file type: ${metadata.mimeType}. Only PDF files are supported.`);
    }
    
    // Create a temporary file path
    const tempFilePath = path.join(os.tmpdir(), `gdrive-${fileId}-${Date.now()}.pdf`);
    
    // Download the file
    const response = await drive.files.get({
      fileId,
      alt: 'media'
    }, {
      responseType: 'stream'
    });
    
    // Write the file to disk
    const dest = fs.createWriteStream(tempFilePath);
    
    await new Promise((resolve, reject) => {
      response.data
        .on('error', err => {
          reject(err);
        })
        .pipe(dest)
        .on('error', err => {
          reject(err);
        })
        .on('finish', () => {
          resolve();
        });
    });
    
    // Read the file into a buffer
    const fileBuffer = fs.readFileSync(tempFilePath);
    
    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);
    
    logger.info(`Google Drive file downloaded successfully: ${fileId}`);
    
    // Log for compliance audit trail
    logger.info(`Compliance: Google Drive file downloaded`, {
      event: 'google_drive_file_downloaded',
      fileId,
      fileName: metadata.name,
      fileSize: metadata.size,
      timestamp: new Date().toISOString()
    });
    
    return {
      buffer: fileBuffer,
      metadata
    };
  } catch (error) {
    logger.error(`Error downloading Google Drive file: ${error.message}`);
    
    // Log for compliance audit trail
    logger.error(`Compliance: Google Drive file download failed`, {
      event: 'google_drive_file_download_failed',
      fileId,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    throw new Error(`Failed to download file: ${error.message}`);
  }
};

/**
 * Import document from Google Drive
 * 
 * @param {Object} tokens - OAuth tokens
 * @param {string} fileId - Google Drive file ID
 * @param {Object} metadata - Additional metadata for the document
 * @param {Object} user - User performing the import
 * @returns {Promise<Object>} Imported document
 */
const importFromGoogleDrive = async (tokens, fileId, metadata = {}, user = {}) => {
  try {
    // Start compliance audit trail
    logger.info(`Compliance: Google Drive import started`, {
      event: 'google_drive_import_started',
      fileId,
      user: user.id || 'anonymous',
      timestamp: new Date().toISOString()
    });
    
    // Download the file from Google Drive
    const { buffer, metadata: fileMetadata } = await downloadFile(tokens, fileId);
    
    // Create a file object similar to what multer would provide
    const file = {
      buffer,
      originalname: fileMetadata.name,
      mimetype: fileMetadata.mimeType,
      size: parseInt(fileMetadata.size, 10)
    };
    
    // Merge Google Drive metadata with provided metadata
    const mergedMetadata = {
      ...metadata,
      title: metadata.title || fileMetadata.name,
      description: metadata.description || fileMetadata.description || ''
    };
    
    // Process the document upload
    const result = await processDocumentUpload(file, mergedMetadata, user);
    
    // Update the document source to indicate it's from Google Drive
    const document = result.document;
    document.source.type = 'GOOGLE_DRIVE';
    document.source.metadata = {
      ...document.source.metadata,
      googleDriveId: fileId,
      googleDriveLink: fileMetadata.webViewLink,
      createdTime: fileMetadata.createdTime,
      modifiedTime: fileMetadata.modifiedTime
    };
    
    await document.save();
    
    // Complete compliance audit trail
    logger.info(`Compliance: Google Drive import completed`, {
      event: 'google_drive_import_completed',
      documentId: document._id,
      fileId,
      user: user.id || 'anonymous',
      timestamp: new Date().toISOString()
    });
    
    return {
      document,
      fileInfo: result.fileInfo
    };
  } catch (error) {
    // Log error for compliance audit trail
    logger.error(`Compliance: Google Drive import failed`, {
      event: 'google_drive_import_failed',
      fileId,
      error: error.message,
      user: user?.id || 'anonymous',
      timestamp: new Date().toISOString()
    });
    
    throw error;
  }
};

/**
 * Refresh OAuth tokens
 * 
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} New tokens
 */
const refreshTokens = async (refreshToken) => {
  try {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });
    
    const { tokens } = await oauth2Client.refreshAccessToken();
    
    logger.info(`Google Drive tokens refreshed successfully`);
    
    return tokens;
  } catch (error) {
    logger.error(`Error refreshing tokens: ${error.message}`);
    throw new Error(`Failed to refresh tokens: ${error.message}`);
  }
};

module.exports = {
  generateAuthUrl,
  getTokensFromCode,
  listFiles,
  getFileMetadata,
  downloadFile,
  importFromGoogleDrive,
  refreshTokens
};