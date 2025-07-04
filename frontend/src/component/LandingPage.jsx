import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-20 left-20 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-60 right-20 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-bounce"></div>
        <div className="absolute bottom-40 left-40 w-36 h-36 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-40 w-28 h-28 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-bounce"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
      </div>

      {/* 3D Geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-16 w-20 h-20 border-2 border-blue-400/30 rotate-45 transform-gpu animate-spin"
          style={{ animationDuration: "25s" }}
        ></div>
        <div className="absolute bottom-1/3 right-16 w-16 h-16 border-2 border-purple-400/30 rotate-12 transform-gpu animate-bounce"></div>
        <div className="absolute top-2/3 left-1/4 w-12 h-12 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rotate-45 animate-pulse"></div>
        <div
          className="absolute top-1/3 right-1/3 w-8 h-8 border border-pink-400/25 rounded-full animate-bounce"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/3 w-14 h-14 border border-cyan-400/25 rotate-45 animate-spin"
          style={{ animationDuration: "15s" }}
        ></div>
      </div>

      {/* Main scrollable content wrapper */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="relative z-20 flex items-center justify-between p-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg transform rotate-12">
              <div className="w-full h-full bg-gradient-to-tr from-white/20 to-transparent rounded-xl flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded-md"></div>
              </div>
            </div>
            <span className="text-2xl font-bold text-white">SkillBridge</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-slate-300 hover:text-white transition-colors"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Pricing
            </a>
            <a
              href="#contact"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Contact
            </a>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative z-10 min-h-screen flex items-center justify-center px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                  Bridge the Gap
                  <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Between Dreams
                  </span>
                  <span className="block text-4xl lg:text-5xl">and Reality</span>
                </h1>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0">
                  Where ambitious students meet real-world challenges and
                  companies discover tomorrow's innovators. Transform your
                  potential into portfolio-worthy achievements.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start max-w-md mx-auto lg:mx-0">
                <Link
                  to="/signup/student"
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-blue-500/25"
                >
                  <span className="flex items-center justify-center gap-2">
                    Start as Student
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>
                </Link>
                <Link
                  to="/signup/company"
                  className="group bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 hover:border-emerald-500/50 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
                >
                  Join as Company
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 max-w-md mx-auto lg:mx-0">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">10K+</div>
                  <div className="text-sm text-slate-400">Active Students</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">500+</div>
                  <div className="text-sm text-slate-400">Partner Companies</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">95%</div>
                  <div className="text-sm text-slate-400">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden p-8 transform perspective-1000">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

                <div className="relative space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Real Projects</h3>
                      <p className="text-slate-400 text-sm">
                        From Fortune 500 companies
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">
                        Expert Mentorship
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Direct guidance from industry leaders
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">
                        Verified Skills
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Industry-recognized certifications
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative z-10 py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Why Choose SkillBridge?
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                We're not just another platform. We're the bridge between your
                potential and your future career.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Real-World Projects
                </h3>
                <p className="text-slate-400">
                  Work on authentic challenges from leading companies. Build a
                  portfolio that employers actually want to see.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Industry Mentorship
                </h3>
                <p className="text-slate-400">
                  Get direct feedback and guidance from senior professionals at
                  top-tier companies.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Verified Achievements
                </h3>
                <p className="text-slate-400">
                  Earn industry-recognized certificates and endorsements that
                  carry real weight with employers.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Career Acceleration
                </h3>
                <p className="text-slate-400">
                  Fast-track your career with direct pathways to interviews and
                  job opportunities.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 hover:border-orange-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Skill Development
                </h3>
                <p className="text-slate-400">
                  Learn cutting-edge technologies and methodologies used by
                  industry leaders.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 hover:border-yellow-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Global Network
                </h3>
                <p className="text-slate-400">
                  Connect with peers and professionals from around the world.
                  Build relationships that last.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="relative z-10 py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                How It Works
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                A simple, proven process that transforms potential into
                professional success.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="relative">
                <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold">
                    1
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Sign Up & Profile
                  </h3>
                  <p className="text-slate-400">
                    Create your profile showcasing your skills, interests, and
                    career goals. Get matched with relevant projects.
                  </p>
                </div>
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold">
                    2
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Work on Projects
                  </h3>
                  <p className="text-slate-400">
                    Collaborate on real industry challenges with guidance from
                    company mentors. Build tangible solutions that matter.
                  </p>
                </div>
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold">
                    3
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Land Your Dream Job
                  </h3>
                  <p className="text-slate-400">
                    Showcase your proven abilities to potential employers. Get
                    direct introductions and fast-track interviews.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="relative z-10 py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Choose Your Plan
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Flexible pricing options to match your ambition and budget.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Basic Plan */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 transition-all duration-300 hover:border-blue-500/50">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">Starter</h3>
                  <div className="text-5xl font-bold text-white mb-6">
                    $0<span className="text-lg text-slate-400">/mo</span>
                  </div>
                  <ul className="space-y-4 mb-8 text-slate-300">
                    <li className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      3 Projects per month
                    </li>
                    <li className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Basic portfolio tools
                    </li>
                    <li className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Community access
                    </li>
                  </ul>
                  <button className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-all duration-300">
                    Get Started
                  </button>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl p-8 border-2 border-blue-500 relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full">
                  Most Popular
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Professional
                  </h3>
                  <div className="text-5xl font-bold text-white mb-6">
                    $29<span className="text-lg text-slate-400">/mo</span>
                  </div>
                  <ul className="space-y-4 mb-8 text-slate-300">
                    <li className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Unlimited projects
                    </li>
                    <li className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Priority mentor matching
                    </li>
                    <li className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Advanced portfolio tools
                    </li>
                    <li className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Company introductions
                    </li>
                  </ul>
                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:-translate-y-1">
                    Choose Pro
                  </button>
                </div>
              </div>

              {/* Enterprise Plan */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 transition-all duration-300 hover:border-emerald-500/50">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Enterprise
                  </h3>
                  <div className="text-5xl font-bold text-white mb-6">Custom</div>
                  <ul className="space-y-4 mb-8 text-slate-300">
                    <li className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Custom project volumes
                    </li>
                    <li className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Dedicated account manager
                    </li>
                    <li className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      White-label solutions
                    </li>
                  </ul>
                  <button className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-all duration-300">
                    Contact Sales
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Testimonial Style */}
        <section className="relative z-10 py-24 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            {/* Floating background elements */}
            <div className="absolute left-1/4 top-12 w-6 h-6 bg-blue-400/20 rounded-full animate-pulse"></div>
            <div className="absolute right-1/3 bottom-12 w-4 h-4 bg-purple-400/20 rounded-full animate-bounce"></div>
            <div className="absolute left-1/2 top-1/3 w-2 h-2 bg-pink-400/30 rounded-full"></div>

            {/* Main Content */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full px-6 py-2 mb-8">
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="text-slate-300 text-sm font-medium">
                  Success Stories
                </span>
              </div>

              <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                What Our Students Say
              </h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                Real stories from students who transformed their careers through
                SkillBridge
              </p>
            </div>

            {/* Testimonials Grid */}
            <div className="grid lg:grid-cols-3 gap-8 mb-16">
              {/* Testimonial 1 */}
              <div className="group relative h-full">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-blue-500/30 transition-all duration-300 h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      S
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Sarah Chen</h4>
                      <p className="text-slate-400 text-sm">
                        Software Engineer @ Google
                      </p>
                    </div>
                  </div>
                  <blockquote className="text-slate-300 italic mb-4 flex-grow">
                    "SkillBridge connected me with a real project at a Fortune 500
                    company. The mentorship was incredible, and I landed my dream
                    job within 3 months."
                  </blockquote>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="group relative h-full">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-purple-500/30 transition-all duration-300 h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      M
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">
                        Marcus Rodriguez
                      </h4>
                      <p className="text-slate-400 text-sm">
                        Product Manager @ Microsoft
                      </p>
                    </div>
                  </div>
                  <blockquote className="text-slate-300 italic mb-4 flex-grow">
                    "The hands-on experience was game-changing. I went from no
                    experience to managing products at Microsoft. The industry
                    connections are real."
                  </blockquote>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="group relative h-full">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-emerald-500/30 transition-all duration-300 h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      A
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Aisha Patel</h4>
                      <p className="text-slate-400 text-sm">
                        Data Scientist @ Netflix
                      </p>
                    </div>
                  </div>
                  <blockquote className="text-slate-300 italic mb-4 flex-grow">
                    "From bootcamp graduate to Netflix in 6 months. SkillBridge
                    gave me the portfolio and confidence I needed to stand out."
                  </blockquote>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Section */}
            <div className="text-center space-y-12">
              {/* Main CTA Content */}
              <div className="space-y-6">
                <h3 className="text-4xl lg:text-5xl font-bold text-white">
                  Ready to Write Your
                  <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Success Story?
                  </span>
                </h3>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of students building careers through real-world
                  experience
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link
                  to="/signup/student"
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-5 px-10 rounded-2xl shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-blue-500/25"
                >
                  <span className="flex items-center justify-center gap-3">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Start Your Journey
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>
                </Link>
                <Link
                  to="/signup/company"
                  className="group bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 hover:border-slate-500 text-white font-semibold py-5 px-10 rounded-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <span className="flex items-center justify-center gap-3">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    Partner With Us
                  </span>
                </Link>
              </div>

              {/* Trust Metrics */}
              <div className="grid grid-cols-3 gap-8 max-w-md mx-auto pt-8">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    4.9
                  </div>
                  <div className="flex justify-center mb-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="text-xs text-slate-400">Student Rating</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    30
                  </div>
                  <div className="text-xs text-slate-400 leading-relaxed">
                    Days Avg.
                    <br />
                    to Hire
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    $75k
                  </div>
                  <div className="text-xs text-slate-400 leading-relaxed">
                    Average
                    <br />
                    Salary
                  </div>
                </div>
              </div>

              {/* Subtle separator line */}
              <div className="max-w-xs mx-auto">
                <div className="h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          id="contact"
          className="relative z-10 py-16 px-6 border-t border-slate-700/50"
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg transform rotate-12">
                    <div className="w-full h-full bg-gradient-to-tr from-white/20 to-transparent rounded-xl flex items-center justify-center">
                      <div className="w-5 h-5 bg-white rounded-md"></div>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-white">
                    SkillBridge
                  </span>
                </div>
                <p className="text-slate-400 mb-6 max-w-md">
                  Connecting ambitious students with real-world opportunities and
                  helping companies discover tomorrow's talent.
                </p>
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.719-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 2.567-1.645 0-2.861-2.245-3.347-3.449-1.253z" />
                    </svg>
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-4">Platform</h3>
                <ul className="space-y-2 text-slate-400">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      For Students
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      For Companies
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Success Stories
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-slate-400">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Contact Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-700/50 mt-12 pt-8 text-center text-slate-400">
              <p>
                &copy; 2024 SkillBridge. All rights reserved. Built with passion
                for connecting talent and opportunity.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
