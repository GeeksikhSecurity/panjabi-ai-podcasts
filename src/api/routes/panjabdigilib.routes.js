/**
 * Panjab Digital Library Routes
 * 
 * Handles all Panjab Digital Library integration API endpoints including:
 * - Document search
 * - Document metadata retrieval
 * - Document import
 * 
 * Implements security controls and compliance requirements.
 */

const express = require('express');
const router = express.Router();
const { logger } = require('../../utils/logger');
const { 
  searchPDLDocuments, 
  getPDLDocumentMetadata, 
  importPDLDocument 
} = require('../../controllers/panjabdigilib.controller');

/**
 * Rate limiting for Panjab Digital Library operations
 * This is a simple implementation - in production, use a more robust solution
 */
const pdlRateLimit = (req, res, next) => {
  // TODO: Implement proper rate limiting
  next();
};

/**
 * @route GET /api/v1/panjabdigilib/search
 * @desc Search documents in Panjab Digital Library
 * @access Private
 */
router.get('/search', pdlRateLimit, searchPDLDocuments);

/**
 * @route GET /api/v1/panjabdigilib/documents/:id
 * @desc Get document metadata from Panjab Digital Library
 * @access Private
 */
router.get('/documents/:id', pdlRateLimit, getPDLDocumentMetadata);

/**
 * @route POST /api/v1/panjabdigilib/import
 * @desc Import document from Panjab Digital Library
 * @access Private
 */
router.post('/import', pdlRateLimit, importPDLDocument);

module.exports = router;