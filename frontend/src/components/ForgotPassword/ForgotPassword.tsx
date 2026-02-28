import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import { FaMoon, FaSun } from "react-icons/fa";
import { API_BASE_URL } from "@/config/api";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = async () => {
    if (!email) {
      setError("Please enter your email.");
      return;
    }

    setError("");
    const formData = new FormData();
    formData.append("email", email);

    try {
      // Send the email to the backend
      const response = await fetch(`${API_BASE_URL}/password-reset/request`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to send reset link. Please try again.");
      }

      // If successful, redirect to the OTP page
      navigate("/otp"); // Redirect to the OTP page
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-all duration-500 ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800"
      }`}>
      <div
        className={`${
          darkMode ? "bg-gray-800" : "bg-white"
        } rounded-lg shadow-lg p-6 w-full max-w-sm`}>
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img
            src="https://via.placeholder.com/80"
            alt="Logo"
            className="h-20 w-20"
          />
        </div>
        {/* Title */}
        <h1 className="text-center text-2xl font-semibold mb-4">
          Forgot Password
        </h1>
        {/* Email Input */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className={`block text-sm font-medium ${
              darkMode ? "text-white" : "text-gray-700"
            }`}>
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-4 py-2 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email"
          />
        </div>
        {/* Validation Error */}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {/* Buttons */}
        <div className="space-y-4">
          <button
            className={`w-full py-2 rounded-lg shadow-md transition duration-300 ease-in-out ${
              darkMode
                ? "bg-blue-500 hover:bg-blue-700 text-white"
                : "bg-red-500 hover:bg-red-700 text-white"
            }`}
            onClick={handleSubmit}>
            Send Reset Link
          </button>
          <div className="text-center text-sm">OR</div>
          <Link
            to="/login"
            className={`block text-center appearance-none focus:outline-none w-full py-2 rounded-lg shadow-md transition duration-300 ease-in-out ${
              darkMode
                ? "bg-blue-500 hover:bg-blue-700 text-white"
                : "bg-red-500 hover:bg-red-700 text-white"
            }`}>
            Back to Login
          </Link>
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleDarkMode}
          aria-label="Toggle Dark Mode"
          className="text-gray-500 dark:text-white">
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
