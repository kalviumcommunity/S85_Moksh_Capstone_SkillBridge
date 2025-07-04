# 🔧 Configuration Management Guide

## 📋 **Overview**

This guide explains how to manage your application's configuration, especially backend URLs, in a centralized and maintainable way.

## 🎯 **Current Configuration**

### **Backend URL**: `https://s85-moksh-capstone-skillbridge.onrender.com`

## 📁 **Configuration Files**

### 1. **Main Configuration File**
- **Location**: `src/config/constants.js`
- **Purpose**: Centralized configuration for all URLs and constants
- **Key Features**:
  - Environment-aware URL selection (dev vs production)
  - All API endpoints defined in one place
  - External service configurations (Cloudinary, etc.)

### 2. **API Utility**
- **Location**: `src/utils/api.js`
- **Purpose**: Axios instance with centralized base URL
- **Automatically uses**: Configuration from `constants.js`

### 3. **Socket Context**
- **Location**: `src/SocketContext.jsx`
- **Purpose**: WebSocket connection with centralized URL
- **Automatically uses**: Configuration from `constants.js`

## 🚀 **How to Update Backend URL**

### **Method 1: Automated Script (Recommended)**

```bash
# Navigate to frontend directory
cd frontend

# Run the update script with your new URL
node scripts/update-config.js https://your-new-backend-url.onrender.com
```

**Example:**
```bash
node scripts/update-config.js https://new-skillbridge-backend.onrender.com
```

### **Method 2: Manual Update**

1. **Update Main Configuration** (`src/config/constants.js`):
   ```javascript
   export const CONFIG = {
     API: {
       BASE_URL: 'https://your-new-backend-url.onrender.com',
       // ... other config
     },
     ENV: {
       PRODUCTION: {
         API_BASE_URL: 'https://your-new-backend-url.onrender.com'
       }
     }
   }
   ```

2. **Update Deployment Files**:
   - `netlify.toml` - Environment variable reference
   - `DEPLOYMENT.md` - Documentation
   - `DEPLOYMENT_CHECKLIST.md` - Deployment guide

## 🔄 **Automatic Environment Detection**

The configuration automatically detects your environment:

- **Development**: Uses `http://localhost:5000`
- **Production**: Uses your Render backend URL

```javascript
// This function automatically returns the correct URL
const apiUrl = getApiBaseUrl()
```

## 📝 **Configuration Structure**

```javascript
export const CONFIG = {
  API: {
    BASE_URL: 'https://s85-moksh-capstone-skillbridge.onrender.com',
    ENDPOINTS: {
      // All your API endpoints
      LOGIN: '/api/auth/login',
      POSTS: '/api/posts',
      // ... etc
    }
  },
  EXTERNAL: {
    CLOUDINARY: {
      UPLOAD_URL: 'https://api.cloudinary.com/v1_1/dxp6ok4wo/image/upload',
      UPLOAD_PRESET: 'Skill Bridge'
    }
  },
  ENV: {
    DEVELOPMENT: { API_BASE_URL: 'http://localhost:5000' },
    PRODUCTION: { API_BASE_URL: 'https://s85-moksh-capstone-skillbridge.onrender.com' }
  }
}
```

## 🎯 **Benefits of This System**

1. **Centralized Management**: All URLs in one place
2. **Easy Updates**: Single script to update everything
3. **Environment Aware**: Automatically uses correct URLs
4. **Type Safe**: Consistent configuration structure
5. **Maintainable**: Clear separation of concerns

## 🔧 **Available Helper Functions**

```javascript
import { 
  getApiBaseUrl, 
  buildApiUrl, 
  CONFIG,
  API_BASE_URL,
  CLOUDINARY_UPLOAD_URL 
} from './config/constants'

// Get current API base URL (dev or production)
const baseUrl = getApiBaseUrl()

// Build full API URL
const fullUrl = buildApiUrl('/api/posts')

// Access specific configurations
const cloudinaryUrl = CLOUDINARY_UPLOAD_URL
```

## 📋 **Files That Use This Configuration**

- ✅ `src/utils/api.js` - API utility
- ✅ `src/SocketContext.jsx` - WebSocket connections
- ✅ `src/component/HomePage.jsx` - Image URLs and Cloudinary
- ✅ `src/component/Messages.jsx` - Message API calls
- ✅ All other components using API calls

## 🚨 **Important Notes**

1. **Environment Variables**: The system still respects `VITE_API_URL` if set
2. **Fallback**: If environment variable is set, it takes precedence
3. **Development**: Always uses localhost in development mode
4. **Production**: Always uses your Render URL in production

## 🔄 **Migration from Environment Variables**

If you were using `import.meta.env.VITE_API_URL`, the system now:
- Automatically detects environment
- Uses centralized configuration
- Still supports environment variables as fallback

## 📞 **Need Help?**

If you need to update your backend URL:

1. **Use the script**: `node scripts/update-config.js <new-url>`
2. **Test locally**: Run `npm run dev` to test changes
3. **Deploy**: Update your deployment environment variables
4. **Verify**: Check that all features work with the new URL

---

**🎉 Your configuration is now centralized and easy to manage!** 