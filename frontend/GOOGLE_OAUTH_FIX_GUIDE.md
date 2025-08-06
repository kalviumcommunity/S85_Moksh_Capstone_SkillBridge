# 🔧 Google OAuth Fix Guide - Production Deployment

## 🚨 **Issue Identified**

Your Google OAuth is not working in production because:

1. **Google OAuth Client ID is hardcoded** for development
2. **Authorized origins** in Google Console don't include your Netlify domain
3. **Environment variables** are not properly configured

## ✅ **Solution: Update Google OAuth Configuration**

### **Step 1: Update Google Cloud Console**

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select your project** (or create one if needed)
3. **Go to APIs & Services > Credentials**
4. **Find your OAuth 2.0 Client ID** or create a new one

### **Step 2: Update Authorized Origins**

In your OAuth 2.0 Client ID settings, add these **Authorized JavaScript origins**:

```
http://localhost:5173
https://skillbridgeweb.netlify.app
```

### **Step 3: Update Authorized Redirect URIs**

Add these **Authorized redirect URIs**:

```
http://localhost:5173
https://skillbridgeweb.netlify.app
https://skillbridgeweb.netlify.app/
```

### **Step 4: Update Frontend Configuration**

#### **Option A: Use Environment Variables (Recommended)**

1. **Create environment file** (`frontend/.env.production`):
```env
VITE_GOOGLE_CLIENT_ID=196564239232-f94gsenprde6m8csolnnsr4o0kf38sjt.apps.googleusercontent.com
```

2. **Update main.jsx** to use environment variable:
```javascript
// In frontend/src/main.jsx
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '196564239232-f94gsenprde6m8csolnnsr4o0kf38sjt.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={googleClientId}>
    <App />
  </GoogleOAuthProvider>
);
```

#### **Option B: Update Constants File**

Update `frontend/src/config/constants.js`:

```javascript
export const CONFIG = {
  // ... existing config
  GOOGLE: {
    CLIENT_ID: '196564239232-f94gsenprde6m8csolnnsr4o0kf38sjt.apps.googleusercontent.com'
  }
}
```

Then update `frontend/src/main.jsx`:

```javascript
import { CONFIG } from './config/constants';

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={CONFIG.GOOGLE.CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
);
```

### **Step 5: Update Backend Environment Variables**

In your **Render backend**, add these environment variables:

```
GOOGLE_CLIENT_ID=196564239232-f94gsenprde6m8csolnnsr4o0kf38sjt.apps.googleusercontent.com
FRONTEND_URL=https://skillbridgeweb.netlify.app
NODE_ENV=production
```

### **Step 6: Update Backend Code**

Update `backend/controllers/authController.js`:

```javascript
// Replace the hardcoded CLIENT_ID with environment variable
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '196564239232-f94gsenprde6m8csolnnsr4o0kf38sjt.apps.googleusercontent.com';
```

## 🔍 **What This Fixes**

### **Before (Google OAuth Issues):**
- ❌ Google button shows "invalid width" error
- ❌ Google login fails in production
- ❌ CORS errors with Google OAuth
- ❌ Hardcoded client ID

### **After (Fixed):**
- ✅ Google button works properly
- ✅ Google login works in production
- ✅ No CORS errors
- ✅ Environment-aware configuration

## 📋 **Complete Environment Variables**

### **Frontend (Netlify)**
```env
VITE_GOOGLE_CLIENT_ID=196564239232-f94gsenprde6m8csolnnsr4o0kf38sjt.apps.googleusercontent.com
VITE_API_URL=https://s85-moksh-capstone-skillbridge.onrender.com
```

### **Backend (Render)**
```env
DB_URI=mongodb+srv://vsmokshsharma688:skillbridge123@skillbridge.2b1itpi.mongodb.net/skillbridge?retryWrites=true&w=majority
FRONTEND_URL=https://skillbridgeweb.netlify.app
GOOGLE_CLIENT_ID=196564239232-f94gsenprde6m8csolnnsr4o0kf38sjt.apps.googleusercontent.com
NODE_ENV=production
```

## 🚀 **Implementation Steps**

### **1. Update Google Cloud Console**
- Add your Netlify domain to authorized origins
- Add redirect URIs

### **2. Update Frontend Code**
```bash
# Navigate to frontend
cd frontend

# Create production environment file
echo "VITE_GOOGLE_CLIENT_ID=196564239232-f94gsenprde6m8csolnnsr4o0kf38sjt.apps.googleusercontent.com" > .env.production
```

### **3. Update Backend Code**
- Update `authController.js` to use environment variable
- Add `GOOGLE_CLIENT_ID` to Render environment variables

### **4. Redeploy**
- Frontend: Push to GitHub (Netlify auto-deploys)
- Backend: Render auto-redeploys when you save environment variables

## 🔧 **Alternative: Multiple Client IDs**

If you want separate client IDs for dev and production:

### **Google Cloud Console**
Create two OAuth 2.0 Client IDs:
1. **Development**: `http://localhost:5173`
2. **Production**: `https://skillbridgeweb.netlify.app`

### **Frontend Configuration**
```javascript
// In main.jsx
const isDevelopment = import.meta.env.DEV;
const googleClientId = isDevelopment 
  ? 'your-dev-client-id.apps.googleusercontent.com'
  : 'your-prod-client-id.apps.googleusercontent.com';
```

## 📞 **Troubleshooting**

### **Common Issues:**

1. **"Invalid width" error**:
   - Make sure Google button has proper width styling
   - Check if Google scripts are loading properly

2. **"CORS error" with Google**:
   - Verify authorized origins in Google Console
   - Check if domain is exactly correct (no trailing slash)

3. **"Client ID not found"**:
   - Verify environment variables are set correctly
   - Check if client ID is valid in Google Console

4. **"Redirect URI mismatch"**:
   - Add exact redirect URIs to Google Console
   - Include both with and without trailing slash

### **Debug Steps:**
1. **Check browser console** for specific error messages
2. **Verify Google Console** settings match your domain
3. **Test in incognito mode** to avoid cache issues
4. **Check environment variables** are loaded correctly

## 🎯 **Expected Result**

After implementing these fixes:

- ✅ **Google button renders properly**
- ✅ **Google login works in production**
- ✅ **No console errors**
- ✅ **Users can sign in with Google**
- ✅ **Backend properly validates Google tokens**

## 🔗 **Useful Links**

- **Google Cloud Console**: https://console.cloud.google.com/
- **OAuth 2.0 Documentation**: https://developers.google.com/identity/protocols/oauth2
- **Google Sign-In Documentation**: https://developers.google.com/identity/sign-in/web

---

**🎉 Once you update the Google OAuth configuration, both regular login and Google login will work perfectly!** 