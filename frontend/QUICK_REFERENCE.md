# 🚀 Quick Reference Card

## 🔗 **Current Backend URL**
```
https://s85-moksh-capstone-skillbridge.onrender.com
```

## ⚡ **Quick Actions**

### **Update Backend URL**
```bash
# Navigate to frontend directory
cd frontend

# Run update script
node scripts/update-config.js https://your-new-url.onrender.com
```

### **Check Current Configuration**
```bash
# View current config
cat src/config/constants.js
```

### **Test Configuration**
```bash
# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 **Key Files**

| File | Purpose | Location |
|------|---------|----------|
| **Main Config** | Centralized configuration | `src/config/constants.js` |
| **API Utility** | HTTP client setup | `src/utils/api.js` |
| **Socket Config** | WebSocket setup | `src/SocketContext.jsx` |
| **Update Script** | Automated URL updates | `scripts/update-config.js` |

## 🔧 **Configuration Structure**

```javascript
// Main configuration file
export const CONFIG = {
  API: {
    BASE_URL: 'https://s85-moksh-capstone-skillbridge.onrender.com',
    ENDPOINTS: { /* all API endpoints */ }
  },
  ENV: {
    DEVELOPMENT: { API_BASE_URL: 'http://localhost:5000' },
    PRODUCTION: { API_BASE_URL: 'https://s85-moksh-capstone-skillbridge.onrender.com' }
  }
}
```

## 🎯 **Environment Detection**

- **Development**: `http://localhost:5000`
- **Production**: `https://s85-moksh-capstone-skillbridge.onrender.com`

## 📝 **Common Tasks**

### **1. Update Backend URL**
```bash
node scripts/update-config.js https://new-backend-url.onrender.com
```

### **2. Add New API Endpoint**
```javascript
// In src/config/constants.js
export const CONFIG = {
  API: {
    ENDPOINTS: {
      NEW_ENDPOINT: '/api/new-endpoint'
    }
  }
}
```

### **3. Use Configuration in Components**
```javascript
import { getApiBaseUrl, CONFIG } from '../config/constants'

const apiUrl = getApiBaseUrl()
const endpoint = CONFIG.API.ENDPOINTS.POSTS
```

## 🚨 **Important Notes**

- ✅ Configuration is centralized and environment-aware
- ✅ Automatic URL selection (dev vs production)
- ✅ Easy updates with single script
- ✅ Backward compatible with environment variables
- ✅ Type-safe configuration structure

## 📞 **Need Help?**

1. **Check configuration**: `cat src/config/constants.js`
2. **Run update script**: `node scripts/update-config.js <new-url>`
3. **Test locally**: `npm run dev`
4. **Review guide**: `CONFIGURATION_GUIDE.md`

---

**🎉 Your configuration is now perfectly organized and easy to manage!** 