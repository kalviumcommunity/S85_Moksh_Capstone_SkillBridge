import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const CompanySignup = () => {
  const [form, setForm] = useState({
    companyName: "",
    email: "",
    password: "",
    website: "",
    profilePicture: "",
    bio: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Utility function for combining classes
  const combineClasses = (...classes) => {
    return classes.filter(Boolean).join(" ");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/api/auth/signup", {
        ...form,
        role: "company",
      });
      setLoading(false);
      navigate("/homepage");
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl animate-bounce"></div>
        <div className="absolute bottom-20 left-40 w-28 h-28 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-40 right-40 w-20 h-20 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-bounce"></div>
      </div>

      {/* 3D Geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-10 w-16 h-16 border-2 border-emerald-400/30 rotate-45 transform-gpu animate-spin"
          style={{ animationDuration: "20s" }}
        ></div>
        <div className="absolute bottom-1/4 right-10 w-12 h-12 border-2 border-teal-400/30 rotate-12 transform-gpu animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rotate-45 animate-pulse"></div>
        <div
          className="absolute top-3/4 right-1/4 w-6 h-6 border border-cyan-400/25 rounded-full animate-bounce"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding & 3D Elements */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Logo/Brand area with 3D effect */}
            <div className="relative">
              <div className="w-24 h-24 mx-auto lg:mx-0 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl shadow-2xl transform rotate-12 hover:rotate-6 transition-transform duration-500">
                <div className="w-full h-full bg-gradient-to-tr from-white/20 to-transparent rounded-2xl flex items-center justify-center">
                  <div className="w-12 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-blue-600 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                Join as
                <span className="block bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                  Company Partner
                </span>
              </h1>
              <p className="text-lg text-slate-300 max-w-md mx-auto lg:mx-0">
                Connect with talented students, showcase opportunities, and
                build the future workforce together.
              </p>
            </div>

            {/* 3D Feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
              <div className="group bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg mb-2 group-hover:scale-110 transition-transform"></div>
                <h3 className="text-white font-semibold text-sm">Recruit</h3>
                <p className="text-slate-400 text-xs">Find top talent</p>
              </div>
              <div className="group bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg mb-2 group-hover:scale-110 transition-transform"></div>
                <h3 className="text-white font-semibold text-sm">
                  Collaborate
                </h3>
                <p className="text-slate-400 text-xs">Build partnerships</p>
              </div>
            </div>
          </div>

          {/* Right side - Registration Form with 3D effect */}
          <div className="relative">
            {/* 3D Card container */}
            <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden transform perspective-1000 hover:shadow-emerald-500/10 transition-all duration-500">
              {/* 3D highlight effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500"></div>

              <div className="relative p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Join as Company
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Enter your company details to get started
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Error Message */}
                  {error && (
                    <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      {error}
                    </div>
                  )}

                  {/* Form fields in compact grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Company Name */}
                    <div className="space-y-2">
                      <label
                        htmlFor="companyName"
                        className="text-xs font-medium text-slate-300 uppercase tracking-wide"
                      >
                        Company Name
                      </label>
                      <input
                        id="companyName"
                        name="companyName"
                        type="text"
                        value={form.companyName}
                        onChange={handleChange}
                        required
                        placeholder="Your company name"
                        className={combineClasses(
                          "flex h-11 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                          "bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400",
                          "focus:border-emerald-500 focus:ring-emerald-500/20 focus:bg-slate-700/70",
                          "transition-all duration-300 transform focus:scale-[1.02]",
                        )}
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
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
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="company@email.com"
                        className={combineClasses(
                          "flex h-11 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                          "bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400",
                          "focus:border-emerald-500 focus:ring-emerald-500/20 focus:bg-slate-700/70",
                          "transition-all duration-300 transform focus:scale-[1.02]",
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        value={form.password}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                        className={combineClasses(
                          "flex h-11 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                          "bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400",
                          "focus:border-emerald-500 focus:ring-emerald-500/20 focus:bg-slate-700/70",
                          "transition-all duration-300 transform focus:scale-[1.02]",
                        )}
                      />
                    </div>

                    {/* Website */}
                    <div className="space-y-2">
                      <label
                        htmlFor="website"
                        className="text-xs font-medium text-slate-300 uppercase tracking-wide"
                      >
                        Website
                      </label>
                      <input
                        id="website"
                        name="website"
                        type="text"
                        value={form.website}
                        onChange={handleChange}
                        placeholder="https://company.com"
                        className={combineClasses(
                          "flex h-11 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                          "bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400",
                          "focus:border-emerald-500 focus:ring-emerald-500/20 focus:bg-slate-700/70",
                          "transition-all duration-300 transform focus:scale-[1.02]",
                        )}
                      />
                    </div>
                  </div>

                  {/* Profile Picture URL - Full width */}
                  <div className="space-y-2">
                    <label
                      htmlFor="profilePicture"
                      className="text-xs font-medium text-slate-300 uppercase tracking-wide"
                    >
                      Profile Picture URL (Optional)
                    </label>
                    <input
                      id="profilePicture"
                      name="profilePicture"
                      type="text"
                      value={form.profilePicture}
                      onChange={handleChange}
                      placeholder="https://logo.company.com/image.jpg"
                      className={combineClasses(
                        "flex h-11 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        "bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400",
                        "focus:border-emerald-500 focus:ring-emerald-500/20 focus:bg-slate-700/70",
                        "transition-all duration-300 transform focus:scale-[1.02]",
                      )}
                    />
                  </div>

                  {/* Bio - Full width */}
                  <div className="space-y-2">
                    <label
                      htmlFor="bio"
                      className="text-xs font-medium text-slate-300 uppercase tracking-wide"
                    >
                      Company Bio (Optional)
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      placeholder="Tell us about your company..."
                      rows={4}
                      className={combineClasses(
                        "flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        "bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 resize-none",
                        "focus:border-emerald-500 focus:ring-emerald-500/20 focus:bg-slate-700/70",
                        "transition-all duration-300 transform focus:scale-[1.02]",
                      )}
                    />
                  </div>

                  {/* Submit Button with 3D effect */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={combineClasses(
                      "w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700",
                      "text-white font-semibold py-3 h-12 shadow-lg rounded-md",
                      "transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/25",
                      "active:translate-y-0 active:shadow-lg",
                      "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
                      "focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-slate-800",
                    )}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Signing Up...
                      </div>
                    ) : (
                      "Sign Up"
                    )}
                  </button>
                </form>

                {/* Login Link */}
                <div className="mt-6 text-center">
                  <p className="text-slate-400 text-sm">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors hover:underline"
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

export default CompanySignup;
