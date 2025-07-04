# Netlify Deployment Guide

## Prerequisites
- Your backend deployed on Render
- Your Render backend URL (e.g., `https://your-app-name.onrender.com`)
- MongoDB database (MongoDB Atlas or Render MongoDB service)

## Steps to Deploy on Netlify

### 1. Prepare Your Repository
- Make sure your code is pushed to GitHub/GitLab
- Ensure the `netlify.toml` file is in your frontend directory

### 2. Deploy to Netlify

#### Option A: Deploy via Netlify Dashboard
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "New site from Git"
3. Connect your GitHub/GitLab account
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Base directory**: `frontend` (if your frontend is in a subdirectory)
6. Click "Deploy site"

#### Option B: Deploy via Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Navigate to frontend directory
cd frontend

# Login to Netlify
netlify login

# Initialize and deploy
netlify init
```

### 3. Configure Environment Variables (Optional)
The application now uses centralized configuration, but you can still set environment variables if needed:

1. In your Netlify dashboard, go to Site settings > Environment variables
2. Add the following environment variable (optional):
   - **Key**: `VITE_API_URL`
   - **Value**: `https://s85-moksh-capstone-skillbridge.onrender.com`

**Note**: The application automatically detects the environment and uses the correct URL from `src/config/constants.js`

### 4. Backend Environment Variables (Render)
In your Render backend service dashboard:
1. Go to Environment tab
2. Add these variables:
   - **DB_URI**: `mongodb+srv://vsmokshsharma688:skillbridge123@skillbridge.2b1itpi.mongodb.net/skillbridge?retryWrites=true&w=majority`
   - **FRONTEND_URL**: `https://your-netlify-app.netlify.app` (update this after deploying frontend)
   - **NODE_ENV**: `production`

### 5. Redeploy
After setting environment variables, trigger a new deployment:
- Go to Deploys tab in Netlify dashboard
- Click "Trigger deploy" > "Deploy site"
- In Render, your backend will automatically redeploy when you save environment variables

### 6. Custom Domain (Optional)
1. In Site settings > Domain management
2. Add your custom domain
3. Configure DNS settings as instructed

## Troubleshooting

### Common Issues:
1. **Build fails**: Check if all dependencies are in `package.json`
2. **API calls fail**: Verify `VITE_API_URL` environment variable is set correctly
3. **Routing issues**: The `netlify.toml` file includes redirects for React Router
4. **MongoDB connection fails**: Ensure `DB_URI` is set correctly in Render environment variables
5. **CORS errors**: Verify `FRONTEND_URL` is set correctly in backend environment variables

### Environment Variables:

**Frontend (Netlify):**
- `VITE_API_URL`: `https://s85-moksh-capstone-skillbridge.onrender.com` (optional - uses centralized config)
- Make sure to use `https://` not `http://` for production
- **New**: Configuration is centralized in `src/config/constants.js`

**Backend (Render):**
- `DB_URI`: `mongodb+srv://vsmokshsharma688:skillbridge123@skillbridge.2b1itpi.mongodb.net/skillbridge?retryWrites=true&w=majority`
- `FRONTEND_URL`: Your Netlify frontend URL
- `NODE_ENV`: `production`

## Local Development
For local development, create a `.env` file in the frontend directory:
```
VITE_API_URL=http://localhost:5000
```

## Notes
- The `netlify.toml` file is already configured for React Router
- Environment variables prefixed with `VITE_` are exposed to the client
- Your backend URL must be accessible from the internet (which Render provides) 