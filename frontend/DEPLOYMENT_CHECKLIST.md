# 🚀 Deployment Checklist

## ✅ Backend (Render) - COMPLETED
- **URL**: https://s85-moksh-capstone-skillbridge.onrender.com/
- **Status**: Deployed (needs MongoDB configuration)

## 🔧 Backend Environment Variables (Render Dashboard)
Add these in your Render backend service → Environment tab:

```
DB_URI=mongodb+srv://vsmokshsharma688:skillbridge123@skillbridge.2b1itpi.mongodb.net/skillbridge?retryWrites=true&w=majority
FRONTEND_URL=https://your-netlify-app.netlify.app
NODE_ENV=production
```

## 🌐 Frontend (Netlify) - READY TO DEPLOY

### Step 1: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect GitHub and select your repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Base directory**: `frontend`

### Step 2: Set Environment Variable
In Netlify dashboard → Site settings → Environment variables:
- **Key**: `VITE_API_URL`
- **Value**: `https://s85-moksh-capstone-skillbridge.onrender.com`

### Step 3: Update Backend CORS
After getting your Netlify URL, update the `FRONTEND_URL` in Render:
- **Key**: `FRONTEND_URL`
- **Value**: `https://your-netlify-app.netlify.app`

## 🔗 URLs Summary
- **Backend**: https://s85-moksh-capstone-skillbridge.onrender.com/
- **Frontend**: https://your-netlify-app.netlify.app (after deployment)

## 📝 Notes
- Your frontend is already configured to use environment variables
- The `netlify.toml` file is set up for React Router
- MongoDB connection string is ready for Render configuration 