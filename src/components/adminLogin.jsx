import React, { useState } from "react";
import { ShieldCheck, LogIn, User } from "lucide-react"; // Added User icon
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../services/adminAPI";

export const AdminLogin = () => {
  const [userName, setUserName] = useState(""); // Changed from email to userName
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!userName || !password) { // Changed check from email to userName
      setError("Both username and password are required.");
      setIsLoading(false);
      return;
    }

    try {
      // API call now sends userName
      const response = await adminLogin({ userName, password });

      if (response.token) {
        localStorage.setItem("adminToken", response.token);
        navigate("/admin");
      } else {
        setError("Login failed. Please try again.");
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || "Invalid credentials. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        
        {/* Header */}
        <div className="text-center">
            <div className="flex justify-center mb-4">
                <ShieldCheck className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel Login</h1>
            <p className="mt-2 text-sm text-gray-600">Welcome back! Please sign in to continue.</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* UserName Input */}
          <div>
            <label 
              htmlFor="userName" 
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              id="userName"
              name="userName"
              type="text" // Changed type to text
              autoComplete="username" // Changed autocomplete
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)} // Updated state handler
              className="w-full px-4 py-2 mt-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="e.g., admin"
              disabled={isLoading}
            />
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between">
              <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-700"
              >
                  Password
              </label>
              <a href="#" className="text-sm text-red-600 hover:underline">
                  Forgot password?
              </a>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 text-sm text-center text-red-800 bg-red-100 rounded-lg">
                {error}
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center w-full px-4 py-3 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300 disabled:bg-red-400 disabled:cursor-not-allowed"
            >
              <LogIn className="w-5 h-5 mr-2" />
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};