/**
 * Document Validator
 * 
 * Validates document uploads and metadata.
 */

const Joi = require('joi');
const config = require('../../config');

// Schema for document metadata
const documentMetadataSchema = Joi.object({
  title: Joi.string().trim().max(255).required(),
  author: Joi.string().trim().max(255).allow('', null),
  description: Joi.string().trim().max(1000).allow('', null),
  language: Joi.string().valid('en', 'pa', 'other').default('en'),
  tags: Joi.array().items(Joi.string().trim().max(50)).default([]),
  collections: Joi.array().items(Joi.string().trim().max(100)).default([])
});

// Schema for Google Drive document import
const googleDriveImportSchema = Joi.object({
  fileId: Joi.string().required(),
  metadata: documentMetadataSchema.default({})
});

// Schema for Panjab Digital Library document import
const panjabDigilibImportSchema = Joi.object({
  documentId: Joi.string().required(),
  metadata: documentMetadataSchema.default({})
});

/**
 * Validate document metadata
 * 
 * @param {Object} metadata - Document metadata
 * @returns {Object} - Validated metadata or error
 */
const validateMetadata = (metadata) => {
  const { error, value } = documentMetadataSchema.validate(metadata, { abortEarly: false });
  
  if (error) {
    throw new Error(`Invalid document metadata: ${error.message}`);
  }
  
  return value;
};

/**
 * Validate Google Drive import request
 * 
 * @param {Object} requestBody - Request body
 * @returns {Object} - Validated request or error
 */
const validateGoogleDriveImport = (requestBody) => {
  const { error, value } = googleDriveImportSchema.validate(requestBody, { abortEarly: false });
  
  if (error) {
    throw new Error(`Invalid Google Drive import request: ${error.message}`);
  }
  
  return value;
};

/**
 * Validate Panjab Digital Library import request
 * 
 * @param {Object} requestBody - Request body
 * @returns {Object} - Validated request or error
 */
const validatePanjabDigilibImport = (requestBody) => {
  const { error, value } = panjabDigilibImportSchema.validate(requestBody, { abortEarly: false });
  
  if (error) {
    throw new Error(`Invalid Panjab Digital Library import request: ${error.message}`);
  }
  
  return value;
};

/**
 * Validate file upload
 * 
 * @param {Object} file - File object from multer
 * @returns {boolean} - Whether the file is valid
 */
const validateFileUpload = (file) => {
  // Check if file exists
  if (!file) {
    throw new Error('No file provided');
  }
  
  // Check file type
  if (!config.upload.allowedFileTypes.includes(file.mimetype)) {
    throw new Error(`Invalid file type: ${file.mimetype}. Only PDF files are allowed.`);
  }
  
  // Check file size
  if (file.size > config.upload.maxFileSize) {
    throw new Error(`File too large: ${file.size} bytes. Maximum allowed size is ${config.upload.maxFileSize} bytes.`);
  }
  
  // Check for malicious content (basic check)
  // In production, implement more robust malware scanning
  if (file.buffer.includes('%PDF-') === false) {
    throw new Error('Invalid PDF file format');
  }
  
  return true;
};

module.exports = {
  validateMetadata,
  validateGoogleDriveImport,
  validatePanjabDigilibImport,
  validateFileUpload
};