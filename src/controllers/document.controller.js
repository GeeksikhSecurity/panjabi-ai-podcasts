/**
 * Document Controller
 * 
 * Handles document-related operations and implements security controls.
 */

const { logger } = require('../utils/logger');
const { processDocumentUpload } = require('../services/document/upload.service');
const Document = require('../models/document.model');
const { validateGoogleDriveImport, validatePanjabDigilibImport } = require('../utils/validators/document.validator');

/**
 * Upload a document
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadDocument = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ 
        error: {
          message: 'No file uploaded',
          code: 'FILE_MISSING'
        }
      });
    }
    
    // Get metadata from request body
    const metadata = req.body;
    
    // Get user from request (set by auth middleware)
    const user = req.user || {};
    
    // Process the document upload
    const result = await processDocumentUpload(req.file, metadata, user);
    
    // Return success response
    res.status(201).json({
      message: 'Document uploaded successfully',
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
    logger.error(`Error in uploadDocument controller: ${error.message}`);
    
    // Return appropriate error response
    res.status(400).json({
      error: {
        message: error.message,
        code: 'UPLOAD_FAILED'
      }
    });
  }
};

/**
 * Get all documents with pagination and filtering
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllDocuments = async (req, res) => {
  try {
    // Extract query parameters
    const { 
      page = 1, 
      limit = 10, 
      status, 
      language, 
      collection, 
      tag,
      sortBy = 'uploadDate',
      sortOrder = 'desc'
    } = req.query;
    
    // Build query
    const query = {};
    
    if (status) query.status = status;
    if (language) query.language = language;
    if (collection) query.collections = collection;
    if (tag) query.tags = tag;
    
    // Build sort options
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with pagination
    const documents = await Document.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');
    
    // Get total count for pagination
    const total = await Document.countDocuments(query);
    
    // Return paginated results
    res.status(200).json({
      message: 'Documents retrieved successfully',
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      documents: documents.map(doc => ({
        id: doc._id,
        title: doc.title,
        author: doc.author,
        language: doc.language,
        status: doc.status,
        uploadDate: doc.uploadDate
      }))
    });
  } catch (error) {
    logger.error(`Error in getAllDocuments controller: ${error.message}`);
    
    res.status(500).json({
      error: {
        message: 'Failed to retrieve documents',
        code: 'RETRIEVAL_FAILED'
      }
    });
  }
};

/**
 * Get a document by ID
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find document by ID
    const document = await Document.findById(id).select('-__v');
    
    if (!document) {
      return res.status(404).json({
        error: {
          message: 'Document not found',
          code: 'NOT_FOUND'
        }
      });
    }
    
    // Return document
    res.status(200).json({
      message: 'Document retrieved successfully',
      document: {
        id: document._id,
        title: document.title,
        author: document.author,
        description: document.description,
        language: document.language,
        source: document.source,
        status: document.status,
        processingMetadata: document.processingMetadata,
        tags: document.tags,
        collections: document.collections,
        uploadDate: document.uploadDate,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt
      }
    });
  } catch (error) {
    logger.error(`Error in getDocumentById controller: ${error.message}`);
    
    res.status(500).json({
      error: {
        message: 'Failed to retrieve document',
        code: 'RETRIEVAL_FAILED'
      }
    });
  }
};

/**
 * Import document from Google Drive
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @deprecated Use the dedicated Google Drive controller instead
 */
const importFromGoogleDrive = async (req, res) => {
  try {
    // Redirect to the dedicated Google Drive import endpoint
    logger.info(`Redirecting Google Drive import request to dedicated endpoint`);
    
    res.status(308).json({
      message: 'This endpoint is deprecated. Please use /api/v1/google-drive/import instead.',
      redirectTo: '/api/v1/google-drive/import'
    });
  } catch (error) {
    logger.error(`Error in importFromGoogleDrive controller: ${error.message}`);
    
    res.status(500).json({
      error: {
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      }
    });
  }
};

/**
 * Import document from Panjab Digital Library
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @deprecated Use the dedicated Panjab Digital Library controller instead
 */
const importFromPanjabDigilib = async (req, res) => {
  try {
    // Redirect to the dedicated Panjab Digital Library import endpoint
    logger.info(`Redirecting Panjab Digital Library import request to dedicated endpoint`);
    
    res.status(308).json({
      message: 'This endpoint is deprecated. Please use /api/v1/panjabdigilib/import instead.',
      redirectTo: '/api/v1/panjabdigilib/import'
    });
  } catch (error) {
    logger.error(`Error in importFromPanjabDigilib controller: ${error.message}`);
    
    res.status(500).json({
      error: {
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      }
    });
  }
};

/**
 * Delete a document
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user from request (set by auth middleware)
    const user = req.user || {};
    
    // Find document by ID
    const document = await Document.findById(id);
    
    if (!document) {
      return res.status(404).json({
        error: {
          message: 'Document not found',
          code: 'NOT_FOUND'
        }
      });
    }
    
    // Log for compliance audit trail
    logger.info(`Compliance: Document deletion initiated`, {
      event: 'document_deletion_started',
      documentId: id,
      user: user.id || 'anonymous',
      timestamp: new Date().toISOString()
    });
    
    // Delete document
    await Document.findByIdAndDelete(id);
    
    // TODO: Delete associated files from storage
    
    // Log for compliance audit trail
    logger.info(`Compliance: Document deletion completed`, {
      event: 'document_deletion_completed',
      documentId: id,
      user: user.id || 'anonymous',
      timestamp: new Date().toISOString()
    });
    
    res.status(200).json({
      message: 'Document deleted successfully',
      id
    });
  } catch (error) {
    logger.error(`Error in deleteDocument controller: ${error.message}`);
    
    // Log for compliance audit trail
    logger.error(`Compliance: Document deletion failed`, {
      event: 'document_deletion_failed',
      documentId: req.params.id,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({
      error: {
        message: 'Failed to delete document',
        code: 'DELETION_FAILED'
      }
    });
  }
};

module.exports = {
  uploadDocument,
  getAllDocuments,
  getDocumentById,
  importFromGoogleDrive,
  importFromPanjabDigilib,
  deleteDocument
};