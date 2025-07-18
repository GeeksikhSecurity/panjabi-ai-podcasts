/**
 * Document Routes
 * 
 * Handles all document-related API endpoints including:
 * - Document upload
 * - Google Drive integration
 * - Panjab Digital Library integration
 * - Document management
 * 
 * Implements security controls and compliance requirements.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const config = require('../../config');
const { logger } = require('../../utils/logger');
const { 
  uploadDocument, 
  getAllDocuments, 
  getDocumentById, 
  importFromGoogleDrive, 
  importFromPanjabDigilib, 
  deleteDocument 
} = require('../../controllers/document.controller');

// Configure multer for file uploads with security controls
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.upload.maxFileSize
  },
  fileFilter: (req, file, cb) => {
    // Validate file type
    if (config.upload.allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF files are allowed.'), false);
    }
  }
});

/**
 * Error handling middleware for multer errors
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    logger.error(`Multer error: ${err.message}`);
    
    // Log for compliance audit trail
    logger.error(`Compliance: File upload error`, {
      event: 'file_upload_error',
      error: err.message,
      code: err.code,
      timestamp: new Date().toISOString()
    });
    
    return res.status(400).json({
      error: {
        message: `File upload error: ${err.message}`,
        code: err.code
      }
    });
  } else if (err) {
    // An unknown error occurred
    logger.error(`Upload error: ${err.message}`);
    
    return res.status(500).json({
      error: {
        message: err.message,
        code: 'UPLOAD_ERROR'
      }
    });
  }
  
  next();
};

/**
 * Rate limiting for document uploads
 * This is a simple implementation - in production, use a more robust solution
 */
const uploadRateLimit = (req, res, next) => {
  // TODO: Implement proper rate limiting
  next();
};

/**
 * @route POST /api/v1/documents/upload
 * @desc Upload a new document
 * @access Private
 */
router.post(
  '/upload', 
  uploadRateLimit,
  upload.single('document'),
  handleMulterError,
  uploadDocument
);

/**
 * @route GET /api/v1/documents
 * @desc Get all documents with pagination and filtering
 * @access Private
 */
router.get('/', getAllDocuments);

/**
 * @route GET /api/v1/documents/:id
 * @desc Get a document by ID
 * @access Private
 */
router.get('/:id', getDocumentById);

/**
 * @route POST /api/v1/documents/google-drive
 * @desc Import document from Google Drive
 * @access Private
 */
router.post('/google-drive', uploadRateLimit, importFromGoogleDrive);

/**
 * @route POST /api/v1/documents/panjabdigilib
 * @desc Import document from Panjab Digital Library (deprecated, use /api/v1/panjabdigilib/import instead)
 * @access Private
 */
router.post('/panjabdigilib', uploadRateLimit, importFromPanjabDigilib);

/**
 * @route DELETE /api/v1/documents/:id
 * @desc Delete a document
 * @access Private
 */
router.delete('/:id', deleteDocument);

module.exports = router;