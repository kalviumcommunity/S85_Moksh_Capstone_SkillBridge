// src/components/Navbar.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';

// Smooth scroll helper
const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

const Navbar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleNavClick = (e, id) => {
    e.preventDefault();
    if (pathname !== '/') {
      navigate('/');
      setTimeout(() => scrollToId(id), 100);
    } else {
      scrollToId(id);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-900/40 backdrop-blur-sm text-white px-6 py-3 z-50 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <img src="/assets/logo.png" alt="SkillBridge" className="h-8" />
        <span className="text-xl font-bold">SkillBridge</span>
      </div>
      <div className="hidden md:flex space-x-6 text-sm font-medium">
        {[
          ['Home', 'hero'],
          ['About', 'about'],
          ['Pricing', 'pricing'],
          ['Contact', 'contact'],
        ].map(([label, id]) => (
          <Link
            key={id}
            to="/"
            onClick={(e) => handleNavClick(e, id)}
            className="hover:text-blue-300"
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="flex items-center space-x-3">
        <Link
          to="/"
          onClick={(e) => handleNavClick(e, 'signup')}
          className="bg-blue-500 hover:bg-blue-600 px-4 py-1.5 rounded-full text-sm"
        >
          Sign up
        </Link>
        <Link
          to="/"
          onClick={(e) => handleNavClick(e, 'signin')}
          className="bg-gray-800 hover:bg-gray-700 px-4 py-1.5 rounded-full text-sm"
        >
          Sign in
        </Link>
      </div>
      <button className="md:hidden text-2xl">
        <FiMenu />
      </button>
    </nav>
  );
};

export default Navbar;