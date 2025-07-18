/**
 * Panjab Digital Library Integration Service
 * 
 * Handles integration with panjabdigilib.org for document retrieval.
 * Implements security controls and compliance requirements.
 */

const axios = require('axios');
const fs = require('fs');
const os = require('os');
const path = require('path');
const config = require('../../config');
const { logger } = require('../../utils/logger');
const { processDocumentUpload } = require('./upload.service');
const Document = require('../../models/document.model');

// Create axios instance with base URL and default headers
const apiClient = axios.create({
  baseURL: config.panjabDigilib.baseUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000 // 30 seconds timeout
});

// Add request interceptor for API key
apiClient.interceptors.request.use(config => {
  if (config.panjabDigilib && config.panjabDigilib.apiKey) {
    config.headers['X-API-Key'] = config.panjabDigilib.apiKey;
  }
  return config;
});

/**
 * Search documents in Panjab Digital Library
 * 
 * @param {Object} params - Search parameters
 * @returns {Promise<Array>} List of documents
 */
const searchDocuments = async (params = {}) => {
  try {
    // Default search parameters
    const searchParams = {
      query: params.query || '',
      page: params.page || 1,
      limit: params.limit || 10,
      language: params.language,
      category: params.category,
      sortBy: params.sortBy || 'relevance',
      sortOrder: params.sortOrder || 'desc'
    };
    
    // Execute the search
    const response = await apiClient.get('/documents/search', {
      params: searchParams
    });
    
    logger.info(`Panjab Digital Library search completed: ${response.data.documents.length} results`);
    
    // Log for compliance audit trail
    logger.info(`Compliance: Panjab Digital Library search performed`, {
      event: 'panjabdigilib_search',
      query: searchParams.query,
      resultCount: response.data.documents.length,
      timestamp: new Date().toISOString()
    });
    
    return {
      documents: response.data.documents,
      pagination: response.data.pagination
    };
  } catch (error) {
    logger.error(`Error searching Panjab Digital Library: ${error.message}`);
    
    // Log for compliance audit trail
    logger.error(`Compliance: Panjab Digital Library search failed`, {
      event: 'panjabdigilib_search_failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    throw new Error(`Failed to search documents: ${error.message}`);
  }
};

/**
 * Get document metadata from Panjab Digital Library
 * 
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} Document metadata
 */
const getDocumentMetadata = async (documentId) => {
  try {
    const response = await apiClient.get(`/documents/${documentId}`);
    
    logger.info(`Panjab Digital Library document metadata retrieved: ${documentId}`);
    
    return response.data;
  } catch (error) {
    logger.error(`Error getting document metadata: ${error.message}`);
    throw new Error(`Failed to get document metadata: ${error.message}`);
  }
};

/**
 * Download document from Panjab Digital Library
 * 
 * @param {string} documentId - Document ID
 * @returns {Promise<Buffer>} Document buffer
 */
const downloadDocument = async (documentId) => {
  try {
    // Get document metadata first
    const metadata = await getDocumentMetadata(documentId);
    
    // Check if document is available for download
    if (!metadata.downloadUrl) {
      throw new Error('Document is not available for download');
    }
    
    // Create a temporary file path
    const tempFilePath = path.join(os.tmpdir(), `pdl-${documentId}-${Date.now()}.pdf`);
    
    // Download the file
    const response = await axios({
      method: 'get',
      url: metadata.downloadUrl,
      responseType: 'stream',
      timeout: 60000 // 60 seconds timeout for downloads
    });
    
    // Write the file to disk
    const writer = fs.createWriteStream(tempFilePath);
    
    await new Promise((resolve, reject) => {
      response.data.pipe(writer);
      
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    
    // Read the file into a buffer
    const fileBuffer = fs.readFileSync(tempFilePath);
    
    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);
    
    logger.info(`Panjab Digital Library document downloaded: ${documentId}`);
    
    // Log for compliance audit trail
    logger.info(`Compliance: Panjab Digital Library document downloaded`, {
      event: 'panjabdigilib_document_downloaded',
      documentId,
      documentTitle: metadata.title,
      timestamp: new Date().toISOString()
    });
    
    return {
      buffer: fileBuffer,
      metadata
    };
  } catch (error) {
    logger.error(`Error downloading document: ${error.message}`);
    
    // Log for compliance audit trail
    logger.error(`Compliance: Panjab Digital Library document download failed`, {
      event: 'panjabdigilib_document_download_failed',
      documentId,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    throw new Error(`Failed to download document: ${error.message}`);
  }
};

/**
 * Import document from Panjab Digital Library
 * 
 * @param {string} documentId - Document ID
 * @param {Object} metadata - Additional metadata for the document
 * @param {Object} user - User performing the import
 * @returns {Promise<Object>} Imported document
 */
const importFromPanjabDigilib = async (documentId, metadata = {}, user = {}) => {
  try {
    // Start compliance audit trail
    logger.info(`Compliance: Panjab Digital Library import started`, {
      event: 'panjabdigilib_import_started',
      documentId,
      user: user.id || 'anonymous',
      timestamp: new Date().toISOString()
    });
    
    // Download the document
    const { buffer, metadata: documentMetadata } = await downloadDocument(documentId);
    
    // Create a file object similar to what multer would provide
    const file = {
      buffer,
      originalname: documentMetadata.title + '.pdf',
      mimetype: 'application/pdf',
      size: buffer.length
    };
    
    // Merge document metadata with provided metadata
    const mergedMetadata = {
      ...metadata,
      title: metadata.title || documentMetadata.title,
      author: metadata.author || documentMetadata.author || 'Unknown',
      description: metadata.description || documentMetadata.description || '',
      language: metadata.language || documentMetadata.language || 'en',
      tags: metadata.tags || documentMetadata.tags || [],
      collections: metadata.collections || []
    };
    
    // Process the document upload
    const result = await processDocumentUpload(file, mergedMetadata, user);
    
    // Update the document source to indicate it's from Panjab Digital Library
    const document = result.document;
    document.source.type = 'PANJABDIGILIB';
    document.source.metadata = {
      ...document.source.metadata,
      panjabDigilibId: documentId,
      originalUrl: documentMetadata.viewUrl || '',
      category: documentMetadata.category || '',
      period: documentMetadata.period || '',
      language: documentMetadata.language || ''
    };
    
    await document.save();
    
    // Complete compliance audit trail
    logger.info(`Compliance: Panjab Digital Library import completed`, {
      event: 'panjabdigilib_import_completed',
      documentId: document._id,
      panjabDigilibId: documentId,
      user: user.id || 'anonymous',
      timestamp: new Date().toISOString()
    });
    
    return {
      document,
      fileInfo: result.fileInfo
    };
  } catch (error) {
    // Log error for compliance audit trail
    logger.error(`Compliance: Panjab Digital Library import failed`, {
      event: 'panjabdigilib_import_failed',
      documentId,
      error: error.message,
      user: user?.id || 'anonymous',
      timestamp: new Date().toISOString()
    });
    
    throw error;
  }
};

module.exports = {
  searchDocuments,
  getDocumentMetadata,
  downloadDocument,
  importFromPanjabDigilib
};