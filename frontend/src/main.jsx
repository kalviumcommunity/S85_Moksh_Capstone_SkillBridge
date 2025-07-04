import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import axios from "axios";

// Add a global Axios response interceptor for 401 errors
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      // Dispatch a custom event for auth errors instead of redirecting
      window.dispatchEvent(new CustomEvent("authError", { detail: { message: "Your session has expired. Please log in again." } }));
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="196564239232-f94gsenprde6m8csolnnsr4o0kf38sjt.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
