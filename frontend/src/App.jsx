import React, { useEffect, useState } from 'react';
import './index.css'; // Import your CSS file 
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './component/HomePage';
import StudentSignup from './component/StudentSignup';
import LandingPage from './component/LandingPage';
import LoginPage from './component/LoginPage';
import CompanySignup from './component/CompanySignup';
import { SocketProvider } from './SocketContext';

function App() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserId(payload.userId);
      } catch {
        setUserId(null);
      }
    } else {
      setUserId(null);
    }
  }, []);

  return (
    <SocketProvider userId={userId}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup/student" element={<StudentSignup />} />
          <Route path="/signup/company" element={<CompanySignup />} />
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          {/* Add more routes as needed */}
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;