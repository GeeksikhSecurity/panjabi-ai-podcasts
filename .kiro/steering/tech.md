# Technology Stack and Build System

## Core Technologies
- **Node.js**: v18+ runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **Google Cloud Platform**:
  - Document AI for text extraction
  - Cloud Storage for document storage
  - Text-to-Speech for audio synthesis
  - Vertex AI (Gemini) for content analysis and generation
  - PubSub for event-driven processing

## Key Dependencies
- **Authentication & Security**:
  - JWT for authentication with 15-minute expiration
  - Helmet for security headers
  - Joi for input validation
  - Multer for file uploads

- **Logging & Monitoring**:
  - Winston for structured logging
  - Compliance-focused audit trails

- **External APIs**:
  - Google Drive API
  - Panjab Digital Library API
  - Distribution platforms (Spotify, Apple Podcasts, YouTube)

## Development Tools
- **ESLint**: JavaScript linting
- **Jest**: Testing framework
- **Nodemon**: Development server with hot reload
- **Supertest**: API testing

## Common Commands

### Installation
```bash
# Install dependencies
npm install
```

### Development
```bash
# Start development server with hot reload
npm run dev

# Run linting
npm run lint
```

### Testing
```bash
# Run tests
npm test
```

### Production
```bash
# Start production server
npm start
```

## Environment Configuration
The application uses environment variables loaded from a `.env` file. Copy `.env.example` to `.env` and configure the following:

- Server settings (PORT, NODE_ENV)
- MongoDB connection (MONGODB_URI)
- Google Cloud credentials (GOOGLE_CLOUD_PROJECT_ID, GOOGLE_APPLICATION_CREDENTIALS)
- API keys for external services

## Security Requirements
- All API responses must include security headers
- Admin endpoints require MFA
- Rate limiting on all APIs
- JWT with short expiration (15 minutes)
- Comprehensive logging of security events