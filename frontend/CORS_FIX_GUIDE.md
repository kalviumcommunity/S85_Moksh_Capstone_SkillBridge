# 🔧 CORS Fix Guide - Backend Environment Variables

## 🚨 **Issue Identified**

Your frontend is deployed and working, but you're getting **CORS errors** because your backend is still configured to only allow requests from `http://localhost:5173` instead of your Netlify domain.

## ✅ **Solution: Update Backend Environment Variables**

### **Step 1: Go to Render Dashboard**

1. Go to [render.com](https://render.com) and sign in
2. Navigate to your backend service: `s85-moksh-capstone-skillbridge`
3. Click on your service to open the dashboard

### **Step 2: Update Environment Variables**

1. Go to **"Environment"** tab
2. Add or update these environment variables:

```
FRONTEND_URL=https://skillbridgeweb.netlify.app
NODE_ENV=production
```

### **Step 3: Verify Current Environment Variables**

Make sure you have these environment variables set:

```
DB_URI=mongodb+srv://vsmokshsharma688:skillbridge123@skillbridge.2b1itpi.mongodb.net/skillbridge?retryWrites=true&w=majority
FRONTEND_URL=https://skillbridgeweb.netlify.app
NODE_ENV=production
```

### **Step 4: Redeploy Backend**

1. After saving the environment variables, Render will automatically redeploy
2. Wait for the deployment to complete (usually 2-3 minutes)
3. Check the deployment logs to ensure it's successful

## 🔍 **What This Fixes**

### **Before (CORS Error):**
```
Access-Control-Allow-Origin header has a value 'http://localhost:5173' 
that is not equal to the supplied origin 'https://skillbridgeweb.netlify.app'
```

### **After (Fixed):**
- ✅ Backend will allow requests from `https://skillbridgeweb.netlify.app`
- ✅ CORS errors will be resolved
- ✅ All API calls will work
- ✅ WebSocket connections will work

## 📋 **Backend Configuration**

Your backend is already properly configured to use the `FRONTEND_URL` environment variable:

```javascript
// In backend/app.js
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

// Socket.IO also uses the same configuration
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});
```

## 🚀 **After the Fix**

Once you update the environment variables and redeploy:

1. **✅ CORS Errors Will Disappear**
2. **✅ Login/Register Will Work**
3. **✅ All API Calls Will Work**
4. **✅ WebSocket Connections Will Work**
5. **✅ Real-time Features Will Work**

## 🔧 **Alternative: Multiple Origins**

If you want to support both development and production, you can set multiple origins:

```javascript
// In your backend app.js (if you want to modify it)
const allowedOrigins = [
  'http://localhost:5173',  // Development
  'https://skillbridgeweb.netlify.app'  // Production
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

But the **simpler solution** is to just set the environment variable as shown above.

## 📞 **Need Help?**

If you're still having issues after updating the environment variables:

1. **Check Render Logs**: Look for any deployment errors
2. **Verify Environment Variables**: Make sure they're saved correctly
3. **Wait for Redeploy**: Give it 2-3 minutes to complete
4. **Clear Browser Cache**: Hard refresh your frontend

## 🎯 **Expected Result**

After updating the environment variables:

- ✅ No more CORS errors in browser console
- ✅ Login form works properly
- ✅ All API calls succeed
- ✅ Real-time features work
- ✅ Your app is fully functional

---

**🎉 Once you update the `FRONTEND_URL` environment variable in Render, your app will work perfectly!** 