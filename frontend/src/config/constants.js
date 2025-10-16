// Centralized configuration for the application
// Update these values to change URLs across the entire application

export const CONFIG = {
  // Backend API Configuration
  API: {
    BASE_URL: 'https://s85-moksh-capstone-skillbridge.onrender.com',
    ENDPOINTS: {
      // Auth endpoints
      LOGIN: '/api/auth/login',
      SIGNUP: '/api/auth/signup',
      LOGOUT: '/api/auth/logout',
      
      // User endpoints
      USER_PROFILE: '/api/users/me',
      USER_UPDATE: '/api/users',
      USER_CONNECTIONS: '/api/connections',
      
      // Post endpoints
      POSTS: '/api/posts',
      POST_LIKE: '/api/posts',
      POST_BOOKMARK: '/api/posts',
      POST_COMMENT: '/api/posts',
      POST_BOOKMARKS: '/api/posts/bookmarks',
      
      // Message endpoints
      MESSAGES: '/api/messages',
      CONVERSATIONS: '/api/messages/conversations',
      USER_MESSAGES: '/api/messages/user',
      
      // Notification endpoints
      NOTIFICATIONS: '/api/notifications',
      NOTIFICATION_READ: '/api/notifications',
      NOTIFICATION_DELETE: '/api/notifications',
      NOTIFICATION_READ_ALL: '/api/notifications/read-all',
    }
  },
  
  // External Services
  EXTERNAL: {
    CLOUDINARY: {
      UPLOAD_URL: 'https://api.cloudinary.com/v1_1/dxp6ok4wo/image/upload',
      UPLOAD_PRESET: 'Skill Bridge'
    }
  },
  
  // App Configuration
  APP: {
    NAME: 'SkillBridge',
    VERSION: '1.0.0',
    DESCRIPTION: 'A professional networking platform for students and companies'
  },
  
  // Environment Configuration
  ENV: {
    DEVELOPMENT: {
      API_BASE_URL: 'http://localhost:5000'
    },
    PRODUCTION: {
      API_BASE_URL: 'https://s85-moksh-capstone-skillbridge.onrender.com'
    }
  }
}

// Helper function to get the current API base URL
export const getApiBaseUrl = () => {
  // Check if we're in development or production
  const isDevelopment = import.meta.env.DEV
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  
  // Use localhost backend when running locally, production when deployed
  if (isDevelopment || isLocalhost) {
    console.log('🌐 [API Config] Using DEVELOPMENT API:', CONFIG.ENV.DEVELOPMENT.API_BASE_URL)
    return CONFIG.ENV.DEVELOPMENT.API_BASE_URL
  } else {
    console.log('🌐 [API Config] Using PRODUCTION API:', CONFIG.ENV.PRODUCTION.API_BASE_URL)
    return CONFIG.ENV.PRODUCTION.API_BASE_URL
  }
}

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  const baseUrl = getApiBaseUrl()
  return `${baseUrl}${endpoint}`
}

// Export individual constants for easy access
export const API_BASE_URL = getApiBaseUrl()
export const CLOUDINARY_UPLOAD_URL = CONFIG.EXTERNAL.CLOUDINARY.UPLOAD_URL
export const CLOUDINARY_UPLOAD_PRESET = CONFIG.EXTERNAL.CLOUDINARY.UPLOAD_PRESET
export const APP_NAME = CONFIG.APP.NAME

export default CONFIG 