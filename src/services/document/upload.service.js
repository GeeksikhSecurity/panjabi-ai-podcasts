/**
 * Document Upload Service
 * 
 * Handles the upload, validation, and storage of documents.
 * Implements security controls and compliance requirements.
 */

const { Storage } = require('@google-cloud/storage');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const crypto = require('crypto');
const config = require('../../config');
const { logger } = require('../../utils/logger');
const Document = require('../../models/document.model');
const { validateFileUpload, validateMetadata } = require('../../utils/validators/document.validator');

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: config.googleCloud.projectId,
  keyFilename: config.googleCloud.keyFilename
});

const bucket = storage.bucket(config.googleCloud.storage.bucketName);

/**
 * Generate a secure filename for uploaded documents
 * 
 * @param {string} originalFilename - The original filename
 * @returns {string} - A secure, unique filename
 */
const generateSecureFilename = (originalFilename) => {
  const fileExtension = path.extname(originalFilename).toLowerCase();
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(16).toString('hex');
  return `${timestamp}-${randomString}${fileExtension}`;
};

/**
 * Upload a document to Google Cloud Storage with security controls
 * 
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} originalFilename - The original filename
 * @param {string} mimeType - The file MIME type
 * @returns {Promise<Object>} - The uploaded file information
 */
const uploadToStorage = async (fileBuffer, originalFilename, mimeType) => {
  try {
    // Generate a secure, unique filename
    const filename = generateSecureFilename(originalFilename);
    const filePath = `uploads/${filename}`;
    
    // Create a file in the bucket
    const file = bucket.file(filePath);
    
    // Set metadata for security and compliance
    const metadata = {
      contentType: mimeType,
      metadata: {
        originalFilename: originalFilename,
        uploadTimestamp: new Date().toISOString(),
        securityScan: 'pending' // Will be updated after security scan
      }
    };
    
    // Upload the file with encryption
    await file.save(fileBuffer, {
      metadata,
      // Enable server-side encryption
      encryptionKey: crypto.randomBytes(32) // In production, use a managed key
    });
    
    // Generate a signed URL with expiration instead of making public
    // This follows security best practices for access control
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    logger.info(`File uploaded successfully with secure access controls`);
    
    // Log for compliance audit trail
    logger.info(`Compliance: Document upload completed`, {
      event: 'document_upload',
      filename: filename,
      originalFilename: originalFilename,
      mimeType: mimeType,
      size: fileBuffer.length,
      timestamp: new Date().toISOString()
    });
    
    return {
      filename,
      originalFilename,
      mimeType,
      size: fileBuffer.length,
      path: filePath,
      url: signedUrl,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
  } catch (error) {
    logger.error(`Error uploading file to storage: ${error.message}`);
    
    // Log for compliance audit trail
    logger.error(`Compliance: Document upload failed`, {
      event: 'document_upload_failed',
      originalFilename: originalFilename,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

/**
 * Create a document record in the database with proper validation
 * 
 * @param {Object} fileInfo - The uploaded file information
 * @param {Object} metadata - Additional metadata for the document
 * @returns {Promise<Object>} - The created document
 */
const createDocumentRecord = async (fileInfo, metadata) => {
  try {
    // Validate metadata using Joi schema
    const validatedMetadata = validateMetadata(metadata);
    
    const document = new Document({
      title: validatedMetadata.title || fileInfo.originalFilename,
      author: validatedMetadata.author || 'Unknown',
      description: validatedMetadata.description || '',
      language: validatedMetadata.language || 'en',
      source: {
        type: 'UPLOAD',
        location: fileInfo.url,
        metadata: {
          originalFilename: fileInfo.originalFilename,
          size: fileInfo.size,
          mimeType: fileInfo.mimeType,
          uploadPath: fileInfo.path,
          expiresAt: fileInfo.expiresAt
        }
      },
      tags: validatedMetadata.tags || [],
      collections: validatedMetadata.collections || []
    });
    
    await document.save();
    
    // Log for compliance audit trail
    logger.info(`Compliance: Document record created`, {
      event: 'document_record_created',
      documentId: document._id,
      title: document.title,
      timestamp: new Date().toISOString()
    });
    
    return document;
  } catch (error) {
    logger.error(`Error creating document record: ${error.message}`);
    
    // Log for compliance audit trail
    logger.error(`Compliance: Document record creation failed`, {
      event: 'document_record_creation_failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    throw new Error(`Failed to create document record: ${error.message}`);
  }
};

/**
 * Process a document upload with security controls and compliance logging
 * 
 * @param {Object} file - The file object from multer
 * @param {Object} metadata - Additional metadata for the document
 * @param {Object} user - The user performing the upload
 * @returns {Promise<Object>} - The processed document
 */
const processDocumentUpload = async (file, metadata = {}, user = {}) => {
  try {
    // Start compliance audit trail
    logger.info(`Compliance: Document upload process started`, {
      event: 'document_upload_started',
      user: user.id || 'anonymous',
      originalFilename: file.originalname,
      timestamp: new Date().toISOString()
    });
    
    // Validate the document using enhanced validation
    validateFileUpload(file);
    
    // Upload to storage with security controls
    const fileInfo = await uploadToStorage(
      file.buffer,
      file.originalname,
      file.mimetype
    );
    
    // Create document record with validated metadata
    const document = await createDocumentRecord(fileInfo, metadata);
    
    // Queue the document for processing
    // TODO: Implement document processing queue with security controls
    
    // Complete compliance audit trail
    logger.info(`Compliance: Document upload process completed`, {
      event: 'document_upload_completed',
      documentId: document._id,
      user: user.id || 'anonymous',
      timestamp: new Date().toISOString()
    });
    
    return {
      document,
      fileInfo
    };
  } catch (error) {
    // Log error for compliance audit trail
    logger.error(`Compliance: Document upload process failed`, {
      event: 'document_upload_failed',
      error: error.message,
      user: user?.id || 'anonymous',
      originalFilename: file?.originalname,
      timestamp: new Date().toISOString()
    });
    
    throw error;
  }
};

module.exports = {
  processDocumentUpload,
  uploadToStorage,
  createDocumentRecord
};