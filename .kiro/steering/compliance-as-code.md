---
inclusion: fileMatch
fileMatchPattern: '**/*.js'
---

# Compliance-as-Code Strategy for Punjabi AI Podcasts

This steering file provides guidance for implementing compliance requirements directly in code.

## Compliance Logging Patterns

### Authentication Events

```javascript
// Log authentication attempts
logger.info(`Compliance: Authentication attempt`, {
  event: 'authentication_attempt',
  user: user.id || 'anonymous',
  timestamp: new Date().toISOString()
});

// Log authentication failures
logger.warn(`Compliance: Authentication failed`, {
  event: 'authentication_failed',
  error: error.message,
  timestamp: new Date().toISOString()
});
```

### Document Operations

```javascript
// Log document upload
logger.info(`Compliance: Document upload completed`, {
  event: 'document_upload',
  documentId: document._id,
  user: user.id || 'anonymous',
  timestamp: new Date().toISOString()
});

// Log document access
logger.info(`Compliance: Document accessed`, {
  event: 'document_access',
  documentId: document._id,
  user: user.id || 'anonymous',
  timestamp: new Date().toISOString()
});
```

### Admin Actions

```javascript
// Log admin actions
logger.info(`Compliance: Admin action performed`, {
  event: 'admin_action',
  action: actionName,
  adminId: user.id,
  timestamp: new Date().toISOString()
});
```

## Security Validation Patterns

### Input Validation

```javascript
// Use Joi for validation
const schema = Joi.object({
  field: Joi.string().required().max(255)
});

const { error, value } = schema.validate(input);
if (error) {
  throw new Error(`Validation error: ${error.message}`);
}
```

### File Validation

```javascript
// Validate file uploads
const validateFile = (file) => {
  if (!file) {
    throw new Error('No file provided');
  }
  
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error(`Invalid file type: ${file.mimetype}`);
  }
  
  if (file.size > maxSize) {
    throw new Error(`File too large: ${file.size} bytes`);
  }
  
  return true;
};
```

## Automated Testing Requirements

- Write tests for all security controls
- Validate JWT expiration and validation
- Test rate limiting functionality
- Verify security headers are present
- Test access control restrictions
- Validate input validation and sanitization

## Evidence Collection

- Implement structured logging for all compliance events
- Store logs in a secure, immutable format
- Include all required metadata for audit purposes
- Implement log rotation and retention policies
- Create automated reports for compliance evidence