/**
 * Document Model
 * 
 * Defines the schema for documents in the system.
 */

const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'pa', 'other']
  },
  source: {
    type: {
      type: String,
      required: true,
      enum: ['UPLOAD', 'GOOGLE_DRIVE', 'PANJABDIGILIB']
    },
    location: {
      type: String,
      required: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'QUEUED',
    enum: ['QUEUED', 'PROCESSING', 'COMPLETED', 'ERROR']
  },
  processingMetadata: {
    extractionStatus: {
      type: String,
      default: 'PENDING',
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ERROR']
    },
    analysisStatus: {
      type: String,
      default: 'PENDING',
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ERROR']
    },
    scriptStatus: {
      type: String,
      default: 'PENDING',
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ERROR']
    },
    mindmapStatus: {
      type: String,
      default: 'PENDING',
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ERROR']
    },
    audioStatus: {
      type: String,
      default: 'PENDING',
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ERROR']
    },
    syncStatus: {
      type: String,
      default: 'PENDING',
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ERROR']
    },
    distributionStatus: {
      type: String,
      default: 'PENDING',
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ERROR']
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  collections: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Add indexes for common queries
DocumentSchema.index({ status: 1 });
DocumentSchema.index({ 'source.type': 1 });
DocumentSchema.index({ language: 1 });
DocumentSchema.index({ tags: 1 });
DocumentSchema.index({ collections: 1 });

// Add virtual for content reference
DocumentSchema.virtual('content', {
  ref: 'Content',
  localField: '_id',
  foreignField: 'documentId',
  justOne: true
});

// Add virtual for media reference
DocumentSchema.virtual('media', {
  ref: 'Media',
  localField: '_id',
  foreignField: 'contentId',
  justOne: true
});

// Add method to update processing status
DocumentSchema.methods.updateProcessingStatus = async function(stage, status) {
  const statusField = `processingMetadata.${stage}Status`;
  this[statusField] = status;
  
  // Update overall status based on processing stages
  if (Object.values(this.processingMetadata).every(s => s === 'COMPLETED')) {
    this.status = 'COMPLETED';
  } else if (Object.values(this.processingMetadata).some(s => s === 'ERROR')) {
    this.status = 'ERROR';
  } else if (Object.values(this.processingMetadata).some(s => s === 'IN_PROGRESS')) {
    this.status = 'PROCESSING';
  }
  
  return this.save();
};

const Document = mongoose.model('Document', DocumentSchema);

module.exports = Document;