import React from 'react';
import './App.css'; // Importing the CSS file for styling

function App() {
  return (
    <div className="app">
      {/* Header Section */}
      <header className="header">
        <nav className="navigation">
          <div className="logo">SkillBridge</div>
          <div className="nav-links">
            <a href="#explore">Explore</a>
            <a href="#teams">For Teams</a>
            <a href="#pricing">Pricing</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="auth-buttons">
            <button className="sign-up">Sign Up</button>
            <button className="sign-in">Sign In</button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Empowering Fresh Talent through World Tasks</h1>
          <p>A modern platform where students meet real industry challenges.</p>
          <div className="cta-buttons">
            <button className="join-btn">Join as Student</button>
            <button className="join-btn">Join as Company</button>
          </div>
        </div>
      </section>

      {/* Why SkillBridge Section */}
      <section className="why-section">
        <h2>Why SkillBridge?</h2>
        <p>At SkillBridge, we bridge the gap between academia and the industry by providing a platform for...</p>
      </section>
    </div>
  );
}

export default App;

