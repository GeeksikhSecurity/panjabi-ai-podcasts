/**
 * Panjab Digital Library Controller
 * 
 * Handles Panjab Digital Library integration operations and implements security controls.
 */

const { logger } = require('../utils/logger');
const { 
  searchDocuments, 
  getDocumentMetadata, 
  importFromPanjabDigilib 
} = require('../services/document/panjabdigilib.service');
const { validatePanjabDigilibImport } = require('../utils/validators/document.validator');

/**
 * Search documents in Panjab Digital Library
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const searchPDLDocuments = async (req, res) => {
  try {
    // Extract query parameters
    const { 
      query, 
      page, 
      limit, 
      language, 
      category, 
      sortBy, 
      sortOrder 
    } = req.query;
    
    // Search documents
    const result = await searchDocuments({
      query,
      page,
      limit,
      language,
      category,
      sortBy,
      sortOrder
    });
    
    // Return success response
    res.status(200).json({
      message: 'Documents retrieved successfully',
      documents: result.documents,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error(`Error in searchPDLDocuments controller: ${error.message}`);
    
    // Return appropriate error response
    res.status(500).json({
      error: {
        message: 'Failed to search documents',
        code: 'SEARCH_FAILED'
      }
    });
  }
};

/**
 * Get document metadata from Panjab Digital Library
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPDLDocumentMetadata = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get document metadata
    const metadata = await getDocumentMetadata(id);
    
    // Return success response
    res.status(200).json({
      message: 'Document metadata retrieved successfully',
      metadata
    });
  } catch (error) {
    logger.error(`Error in getPDLDocumentMetadata controller: ${error.message}`);
    
    // Return appropriate error response
    res.status(500).json({
      error: {
        message: 'Failed to retrieve document metadata',
        code: 'METADATA_RETRIEVAL_FAILED'
      }
    });
  }
};

/**
 * Import document from Panjab Digital Library
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const importPDLDocument = async (req, res) => {
  try {
    // Validate request body
    const validatedData = validatePanjabDigilibImport(req.body);
    
    // Get user from request (set by auth middleware)
    const user = req.user || {};
    
    // Import document
    const result = await importFromPanjabDigilib(
      validatedData.documentId,
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
    logger.error(`Error in importPDLDocument controller: ${error.message}`);
    
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
  searchPDLDocuments,
  getPDLDocumentMetadata,
  importPDLDocument
};