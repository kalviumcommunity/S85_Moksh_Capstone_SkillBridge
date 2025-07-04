import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Typewriter } from "react-simple-typewriter";
import { SiGoogle } from "react-icons/si";
import { GoogleLogin } from "@react-oauth/google";
import api from "../utils/api";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post(`/api/auth/login`, {
        email: form.email,
        password: form.password,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/homepage");
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-60 right-20 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-bounce"></div>
        <div className="absolute bottom-40 left-40 w-36 h-36 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-40 w-28 h-28 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-bounce"></div>
      </div>

      {/* Geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div
          className="absolute top-1/4 left-16 w-20 h-20 border-2 border-blue-400/30 rotate-45 animate-spin"
          style={{ animationDuration: "25s" }}
        ></div>
        <div className="absolute bottom-1/3 right-16 w-16 h-16 border-2 border-purple-400/30 rotate-12 animate-bounce"></div>
        <div className="absolute top-2/3 left-1/4 w-12 h-12 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rotate-45 animate-pulse"></div>
      </div>

      <div className="relative z-10 h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-8 relative">
          <div className="max-w-md text-center space-y-6">
            {/* Logo */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl transform rotate-12 flex items-center justify-center">
                <div className="w-full h-full bg-gradient-to-tr from-white/20 to-transparent rounded-2xl flex items-center justify-center">
                  <div className="w-10 h-10 bg-white rounded-xl"></div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  SkillBridge
                </span>
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed">
                Where ambitious students meet real-world challenges and
                companies discover tomorrow's innovators.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="text-center">
                <div className="text-xl font-bold text-white">10K+</div>
                <div className="text-sm text-slate-400">Students</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">500+</div>
                <div className="text-sm text-slate-400">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">95%</div>
                <div className="text-sm text-slate-400">Success Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-8">
          <div className="w-full max-w-md space-y-6">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-6">
              <div className="flex items-center justify-center mb-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg transform rotate-12 flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-tr from-white/20 to-transparent rounded-2xl flex items-center justify-center">
                    <div className="w-8 h-8 bg-white rounded-lg"></div>
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white">SkillBridge</h2>
            </div>

            {/* Form Header */}
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold text-white mb-2">
                <Typewriter
                  words={["Sign in to your account"]}
                  loop={false}
                  cursor
                  cursorStyle="|"
                  typeSpeed={80}
                  deleteSpeed={50}
                  delaySpeed={1000}
                />
              </h2>
              <p className="text-slate-400">
                Continue your journey with SkillBridge
              </p>
            </div>

            {/* Google Sign In - Clean Professional Design */}
            <div className="space-y-4">
              <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-3 border border-slate-700/30 hover:bg-slate-800/50 transition-all duration-300">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    try {
                      const res = await api.post(
                        `/api/auth/google-login`,
                        {
                          token: credentialResponse.credential,
                        }
                      );
                      localStorage.setItem("token", res.data.token);
                      navigate("/homepage");
                    } catch (err) {
                      alert(
                        err?.response?.data?.message || "Google login failed"
                      );
                    }
                  }}
                  onError={() => {
                    alert("Google Sign In Failed");
                  }}
                  width="100%"
                  theme="outline"
                  text="signin_with"
                  shape="pill"
                  size="large"
                />
              </div>
            </div>

            {/* Divider - Clean Modern Design */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 py-1 bg-slate-900/80 backdrop-blur-sm text-slate-400 font-medium rounded-full border border-slate-700/30">
                  Or sign in with email
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-300"
                >
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 text-slate-200 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                    placeholder="Enter your email"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg
                      className="w-5 h-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-300"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={form.password}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, password: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 text-slate-200 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? (
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
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/50 focus:ring-2"
                  />
                  Remember me
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in to SkillBridge
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
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <p className="text-slate-400">
                Don't have an account?{" "}
                <Link
                  to="/signup/student"
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  Create one for free
                </Link>
              </p>
            </div>

            {/* Back to Home */}
            <div className="text-center pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-400 transition-colors text-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to SkillBridge
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
