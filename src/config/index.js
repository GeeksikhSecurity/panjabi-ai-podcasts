/**
 * Configuration Module
 * 
 * Centralizes all application configuration settings.
 * Uses environment variables with sensible defaults.
 */

module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1',
  },
  
  // Database configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/punjabi-ai-podcasts',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  
  // Google Cloud configuration
  googleCloud: {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    
    // Storage configuration
    storage: {
      bucketName: process.env.GCS_BUCKET_NAME || 'punjabi-ai-podcasts',
    },
    
    // Document AI configuration
    documentAI: {
      processorId: process.env.DOCUMENT_AI_PROCESSOR_ID,
      location: process.env.DOCUMENT_AI_LOCATION || 'us',
    },
    
    // Text-to-Speech configuration
    textToSpeech: {
      voiceEnglish: process.env.TTS_VOICE_ENGLISH || 'en-US-Neural2-D',
      voicePunjabi: process.env.TTS_VOICE_PUNJABI || 'pa-IN-Standard-A',
    },
    
    // Vertex AI configuration
    vertexAI: {
      location: process.env.VERTEX_AI_LOCATION || 'us-central1',
      model: process.env.VERTEX_AI_MODEL || 'gemini-1.5-pro',
    },
  },
  
  // Google Drive API configuration
  googleDrive: {
    clientId: process.env.GOOGLE_DRIVE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_DRIVE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback',
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  },
  
  // Panjab Digital Library API configuration
  panjabDigilib: {
    baseUrl: process.env.PANJAB_DIGILIB_API_URL || 'https://panjabdigilib.org/api',
    apiKey: process.env.PANJAB_DIGILIB_API_KEY,
  },
  
  // Distribution platforms configuration
  distribution: {
    spotify: {
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    },
    applePodcasts: {
      teamId: process.env.APPLE_TEAM_ID,
      keyId: process.env.APPLE_KEY_ID,
      privateKey: process.env.APPLE_PRIVATE_KEY,
    },
    youtube: {
      clientId: process.env.YOUTUBE_CLIENT_ID,
      clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
      redirectUri: process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/api/auth/youtube/callback',
    },
  },
  
  // File upload configuration
  upload: {
    maxFileSize: process.env.MAX_FILE_SIZE || 50 * 1024 * 1024, // 50MB
    allowedFileTypes: ['application/pdf'],
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};