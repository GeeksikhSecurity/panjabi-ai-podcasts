# Project Structure and Organization

## Directory Structure

```
punjabi-ai-podcasts/
├── .github/                # GitHub workflows and configuration
├── .kiro/                  # Kiro steering files and specs
│   ├── specs/              # Project specifications
│   └── steering/           # Steering rules for AI assistance
├── src/                    # Source code
│   ├── api/                # API routes and endpoints
│   │   └── routes/         # Route definitions by feature
│   ├── config/             # Application configuration
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Express middleware
│   ├── models/             # Database models
│   ├── services/           # Business logic and external services
│   │   └── document/       # Document processing services
│   └── utils/              # Utility functions
│       └── validators/     # Input validation
└── logs/                   # Application logs (in production)
```

## Code Organization

### Architecture Pattern
The application follows a layered architecture with clear separation of concerns:

1. **Routes Layer** (`src/api/routes/`): Defines API endpoints and routes requests
2. **Controller Layer** (`src/controllers/`): Handles HTTP requests and responses
3. **Service Layer** (`src/services/`): Implements business logic and external integrations
4. **Data Layer** (`src/models/`): Defines data models and database interactions

### File Naming Conventions
- **Routes**: `feature.routes.js` (e.g., `document.routes.js`)
- **Controllers**: `feature.controller.js` (e.g., `document.controller.js`)
- **Models**: `entity.model.js` (e.g., `document.model.js`)
- **Services**: `service-name.service.js` (e.g., `upload.service.js`)
- **Middleware**: `purpose.middleware.js` (e.g., `security.middleware.js`)
- **Utilities**: `utility-name.js` (e.g., `logger.js`)
- **Validators**: `entity.validator.js` (e.g., `document.validator.js`)

## Coding Patterns

### Error Handling
- Use structured error responses with message and code
- Log detailed errors for debugging
- Return appropriate HTTP status codes
- Implement graceful error recovery

### Validation
- Use Joi schemas for request validation
- Implement strict type checking
- Sanitize all user inputs
- Validate file uploads for type, size, and content

### Logging
- Use structured logging with Winston
- Include timestamp, user ID, action, and result
- Log all security-relevant events
- Mask sensitive data in logs

### Security
- Implement security headers on all responses
- Use JWT with short expiration times
- Require MFA for admin endpoints
- Implement rate limiting on all APIs
- Log all authentication attempts

### Compliance
- Maintain audit trails for all document operations
- Implement data retention policies
- Ensure proper access controls for different user roles
- Document all security controls and their implementation