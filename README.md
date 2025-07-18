# Punjabi AI Podcasts

A system to transform Panjab Digital Library documents into engaging audio podcasts with synchronized visual mindmaps.

## Overview

This project leverages Google's AI technologies, particularly NotebookLM's Audio Overview feature, to automatically generate conversational audio content from PDFs stored either directly in the system, on Google Drive, or on panjabdigilib.org. The system creates podcast-style audio discussions with synchronized visual mindmaps to make cultural and historical content more accessible and engaging.

## Features

- Document ingestion from multiple sources (direct upload, Google Drive, panjabdigilib.org)
- Automatic text extraction with support for Punjabi language
- AI-powered content analysis and conversational script generation
- Visual mindmap generation highlighting key concepts and relationships
- High-quality audio synthesis in both English and Punjabi
- Synchronization of audio with visual mindmaps into cohesive video presentations
- Distribution to multiple platforms (PDL website, Spotify, Apple Podcasts, YouTube)
- Comprehensive accessibility features including transcripts and screen reader support
- Analytics and monitoring for content engagement

## Architecture

The system follows a microservices architecture with event-driven processing to ensure scalability, resilience, and maintainability. It consists of the following layers:

1. **Input Layer**: Document ingestion, queue management, metadata extraction
2. **Processing Layer**: Text extraction, content analysis, script generation, mindmap generation, audio synthesis, synchronization
3. **Output Layer**: Content storage, distribution, analytics, web integration
4. **Management Layer**: Admin portal, quality control, user management

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB
- Google Cloud Platform account with the following APIs enabled:
  - Document AI
  - Cloud Storage
  - Text-to-Speech
  - Vertex AI (Gemini)
- API keys for distribution platforms (optional):
  - Spotify
  - Apple Podcasts
  - YouTube

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/panjabdigilib/punjabi-ai-podcasts.git
   cd punjabi-ai-podcasts
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration values.

5. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### Documents

- `POST /api/v1/documents/upload` - Upload a new document
- `GET /api/v1/documents` - Get all documents
- `GET /api/v1/documents/:id` - Get a document by ID
- `POST /api/v1/documents/google-drive` - Import document from Google Drive
- `POST /api/v1/documents/panjabdigilib` - Import document from Panjab Digital Library
- `DELETE /api/v1/documents/:id` - Delete a document

### Processing

- `POST /api/v1/processing/:id/extract` - Extract text from a document
- `POST /api/v1/processing/:id/analyze` - Analyze document content
- `POST /api/v1/processing/:id/generate-script` - Generate conversational script
- `POST /api/v1/processing/:id/generate-mindmap` - Generate visual mindmap
- `POST /api/v1/processing/:id/synthesize-audio` - Synthesize audio from script
- `POST /api/v1/processing/:id/synchronize` - Synchronize audio with mindmap

### Content

- `GET /api/v1/content` - Get all content
- `GET /api/v1/content/:id` - Get content by ID
- `GET /api/v1/content/:id/audio` - Get audio for content
- `GET /api/v1/content/:id/video` - Get video for content
- `GET /api/v1/content/:id/mindmap` - Get mindmap for content
- `GET /api/v1/content/:id/transcript` - Get transcript for content

### Distribution

- `POST /api/v1/distribution/:id/publish` - Publish content to all platforms
- `POST /api/v1/distribution/:id/spotify` - Publish content to Spotify
- `POST /api/v1/distribution/:id/apple-podcasts` - Publish content to Apple Podcasts
- `POST /api/v1/distribution/:id/youtube` - Publish content to YouTube
- `POST /api/v1/distribution/:id/pdl-website` - Publish content to PDL website
- `GET /api/v1/distribution/:id/qr-code` - Generate QR code for content

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Panjab Digital Library for providing the document collection
- Google for the AI technologies that power this system