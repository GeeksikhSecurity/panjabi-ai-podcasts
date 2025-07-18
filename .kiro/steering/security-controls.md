---
inclusion: always
---

# Security Controls for Punjabi AI Podcasts

This steering file provides guidance and requirements for implementing security controls in the Punjabi AI Podcasts project.

## Authentication & Access Control

- All admin endpoints must require MFA
- Implement rate limiting on all APIs
- Use JWT with short expiration times (15 minutes)
- Log all authentication attempts
- Implement role-based access control (RBAC)
- Use secure password storage with bcrypt or Argon2

## API Security

### Required Security Headers

All API responses must include the following security headers:

```javascript
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'"
};
```

### Input Validation

- Use Joi or similar libraries for request validation
- Implement strict type checking
- Sanitize all user inputs
- Validate file uploads for type, size, and content

## Data Protection

- Encrypt sensitive data at rest
- Use TLS/SSL for data in transit
- Implement secure file storage with access controls
- Generate signed URLs for file access instead of public URLs
- Implement data minimization practices

## Logging & Monitoring

- Log all security-relevant events
- Include timestamp, user ID, action, and result in logs
- Implement structured logging for easier analysis
- Mask sensitive data in logs (PII, credentials)
- Set up alerts for suspicious activities

## Error Handling

- Use generic error messages for users
- Log detailed errors for debugging
- Don't expose stack traces in production
- Implement graceful error recovery
- Return appropriate HTTP status codes

## Compliance Requirements

- Maintain audit trails for all document operations
- Implement data retention policies
- Ensure proper access controls for different user roles
- Document all security controls and their implementation
- Conduct regular security reviews

## Implementation Phases

### Phase 1: Foundation (Months 1-3)

- Implement core security policies
- Set up access controls and MFA
- Establish logging framework

### Phase 2: Technical Controls (Months 4-6)

- Deploy automated vulnerability scanning
- Implement continuous monitoring
- Set up incident response automation

### Phase 3: Validation (Months 7-12)

- Conduct internal audits
- Prepare evidence collection
- Automate compliance reporting
