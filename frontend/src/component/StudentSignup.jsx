/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const Index = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    university: "",
    degree: "",
    skills: "",
    bio: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Utility function for combining classes
  const combineClasses = (...classes) => {
    return classes.filter(Boolean).join(" ");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const {
      fullName,
      email,
      password,
      confirmPassword,
      university,
      degree,
      skills,
      bio,
    } = formData;

    const newErrors = {};

    // Validation
    if (!fullName.trim()) newErrors.fullName = "Full Name is required.";
    if (!email.trim()) newErrors.email = "Email is required.";
    if (!password) newErrors.password = "Password is required.";
    if (!confirmPassword)
      newErrors.confirmPassword = "Please confirm your password.";
    if (!university.trim())
      newErrors.university = "University Name is required.";
    if (!degree.trim()) newErrors.degree = "Degree/Major is required.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    setSuccess("");

    if (Object.keys(newErrors).length === 0) {
      try {
        await api.post("/api/auth/signup", {
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          university: formData.university,
          degree: formData.degree,
          skills: formData.skills.split(",").map((s) => s.trim()),
          bio: formData.bio,
          role: "student",
        });
        setSuccess("Account created successfully!");
        setFormData({
          fullName: "",
          email: "",
          password: "",
          confirmPassword: "",
          university: "",
          degree: "",
          skills: "",
          bio: "",
        });
        navigate("/homepage");
      } catch (err) {
        setErrors({ api: err.response?.data?.message || "Server error. Please try again later." });
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-bounce"></div>
        <div className="absolute bottom-20 left-40 w-28 h-28 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-40 right-40 w-20 h-20 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-bounce"></div>
      </div>

      {/* 3D Geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-10 w-16 h-16 border-2 border-blue-400/30 rotate-45 transform-gpu animate-spin"
          style={{ animationDuration: "20s" }}
        ></div>
        <div className="absolute bottom-1/4 right-10 w-12 h-12 border-2 border-purple-400/30 rotate-12 transform-gpu animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rotate-45 animate-pulse"></div>
      </div>

      <div className="relative z-10 h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding & 3D Elements */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Logo/Brand area with 3D effect */}
            <div className="relative">
              <div className="w-24 h-24 mx-auto lg:mx-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl transform rotate-12 hover:rotate-6 transition-transform duration-500">
                <div className="w-full h-full bg-gradient-to-tr from-white/20 to-transparent rounded-2xl flex items-center justify-center">
                  <div className="w-12 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                Join Our
                <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Innovation Hub
                </span>
              </h1>
              <p className="text-lg text-slate-300 max-w-md mx-auto lg:mx-0">
                Connect with brilliant minds, showcase your skills, and embark
                on extraordinary academic adventures.
              </p>
            </div>

            {/* 3D Feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
              <div className="group bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg mb-2 group-hover:scale-110 transition-transform"></div>
                <h3 className="text-white font-semibold text-sm">Connect</h3>
                <p className="text-slate-400 text-xs">Network globally</p>
              </div>
              <div className="group bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-2 group-hover:scale-110 transition-transform"></div>
                <h3 className="text-white font-semibold text-sm">Learn</h3>
                <p className="text-slate-400 text-xs">Grow together</p>
              </div>
            </div>
          </div>

          {/* Right side - Registration Form with 3D effect */}
          <div className="relative">
            {/* 3D Card container */}
            <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden transform perspective-1000 hover:shadow-blue-500/10 transition-all duration-500">
              {/* 3D highlight effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

              <div className="relative p-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-white mb-1">
                    Create Account
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Enter your details to get started
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Form fields in compact grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label
                        htmlFor="fullName"
                        className="text-xs font-medium text-slate-300 uppercase tracking-wide"
                      >
                        Full Name
                      </label>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className={combineClasses(
                          "flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                          "bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400",
                          "focus:border-blue-500 focus:ring-blue-500/20 focus:bg-slate-700/70",
                          "transition-all duration-300 transform focus:scale-[1.02]",
                          errors.fullName &&
                            "border-red-500/50 focus:border-red-500",
                        )}
                      />
                      {errors.fullName && (
                        <p className="text-red-400 text-xs">
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label
                        htmlFor="email"
                        className="text-xs font-medium text-slate-300 uppercase tracking-wide"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className={combineClasses(
                          "flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                          "bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400",
                          "focus:border-blue-500 focus:ring-blue-500/20 focus:bg-slate-700/70",
                          "transition-all duration-300 transform focus:scale-[1.02]",
                          errors.email &&
                            "border-red-500/50 focus:border-red-500",
                        )}
                      />
                      {errors.email && (
                        <p className="text-red-400 text-xs">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Password */}
                    <div className="space-y-2">
                      <label
                        htmlFor="password"
                        className="text-xs font-medium text-slate-300 uppercase tracking-wide"
                      >
                        Password
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className={combineClasses(
                          "flex h-11 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                          "bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400",
                          "focus:border-blue-500 focus:ring-blue-500/20 focus:bg-slate-700/70",
                          "transition-all duration-300 transform focus:scale-[1.02]",
                          errors.password &&
                            "border-red-500/50 focus:border-red-500",
                        )}
                      />
                      {errors.password && (
                        <p className="text-red-400 text-xs">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <label
                        htmlFor="confirmPassword"
                        className="text-xs font-medium text-slate-300 uppercase tracking-wide"
                      >
                        Confirm
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className={combineClasses(
                          "flex h-11 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                          "bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400",
                          "focus:border-blue-500 focus:ring-blue-500/20 focus:bg-slate-700/70",
                          "transition-all duration-300 transform focus:scale-[1.02]",
                          errors.confirmPassword &&
                            "border-red-500/50 focus:border-red-500",
                        )}
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-400 text-xs">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* University */}
                    <div className="space-y-2">
                      <label
                        htmlFor="university"
                        className="text-xs font-medium text-slate-300 uppercase tracking-wide"
                      >
                        University
                      </label>
                      <input
                        id="university"
                        name="university"
                        type="text"
                        value={formData.university}
                        onChange={handleChange}
                        placeholder="Your university"
                        className={combineClasses(
                          "flex h-11 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                          "bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400",
                          "focus:border-blue-500 focus:ring-blue-500/20 focus:bg-slate-700/70",
                          "transition-all duration-300 transform focus:scale-[1.02]",
                          errors.university &&
                            "border-red-500/50 focus:border-red-500",
                        )}
                      />
                      {errors.university && (
                        <p className="text-red-400 text-xs">
                          {errors.university}
                        </p>
                      )}
                    </div>

                    {/* Degree */}
                    <div className="space-y-2">
                      <label
                        htmlFor="degree"
                        className="text-xs font-medium text-slate-300 uppercase tracking-wide"
                      >
                        Degree/Major
                      </label>
                      <input
                        id="degree"
                        name="degree"
                        type="text"
                        value={formData.degree}
                        onChange={handleChange}
                        placeholder="Computer Science"
                        className={combineClasses(
                          "flex h-11 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                          "bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400",
                          "focus:border-blue-500 focus:ring-blue-500/20 focus:bg-slate-700/70",
                          "transition-all duration-300 transform focus:scale-[1.02]",
                          errors.degree &&
                            "border-red-500/50 focus:border-red-500",
                        )}
                      />
                      {errors.degree && (
                        <p className="text-red-400 text-xs">{errors.degree}</p>
                      )}
                    </div>
                  </div>

                  {/* Skills - Full width */}
                  <div className="space-y-1">
                    <label
                      htmlFor="skills"
                      className="text-xs font-medium text-slate-300 uppercase tracking-wide"
                    >
                      Skills
                    </label>
                    <input
                      id="skills"
                      name="skills"
                      type="text"
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder="JavaScript, React, Python, AI/ML..."
                      className={combineClasses(
                        "flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        "bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400",
                        "focus:border-blue-500 focus:ring-blue-500/20 focus:bg-slate-700/70",
                        "transition-all duration-300 transform focus:scale-[1.02]",
                      )}
                    />
                  </div>

                  {/* Bio - Full width */}
                  <div className="space-y-1">
                    <label
                      htmlFor="bio"
                      className="text-xs font-medium text-slate-300 uppercase tracking-wide"
                    >
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself..."
                      rows={3}
                      className={combineClasses(
                        "flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        "bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 resize-none",
                        "focus:border-blue-500 focus:ring-blue-500/20 focus:bg-slate-700/70",
                        "transition-all duration-300 transform focus:scale-[1.02]",
                      )}
                    />
                  </div>

                  {/* Error/Success Messages */}
                  {errors.api && (
                    <p className="text-red-400 text-sm text-center">
                      {errors.api}
                    </p>
                  )}
                  {success && (
                    <p className="text-green-400 text-sm text-center">
                      {success}
                    </p>
                  )}

                  {/* Submit Button with 3D effect */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={combineClasses(
                      "w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                      "text-white font-semibold py-2.5 h-11 shadow-lg rounded-md",
                      "transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/25",
                      "active:translate-y-0 active:shadow-lg",
                      "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
                      "focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-800",
                    )}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating Account...
                      </div>
                    ) : (
                      "Join the Community"
                    )}
                  </button>
                </form>

                {/* Login Link */}
                <div className="mt-4 text-center">
                  <p className="text-slate-400 text-sm">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="text-blue-400 hover:text-blue-300 font-medium transition-colors hover:underline"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
