"use client"
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaMoon, FaSun } from "react-icons/fa";

const SignUp: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [crn, setCrn] = useState(""); // Add CRN field
  const [urn, setUrn] = useState(""); // Add URN field
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!name || !email || password.length < 7 || !crn || !urn) {
      setError("Please fill in all fields correctly. Password must be at least 7 characters long.");
      return;
    }

    const data = { name, email, password, crn, urn };

    try {
      const response = await fetch(`http://localhost:8000/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(data).toString(),
      });
      console.log(response); // Logs the raw Response object

      if (response.ok) {
        const result = await response.json(); // Convert response to JSON
        console.log(result); // Logs the actual JSON response
        navigate(`/otp?student_id=${result.student_id}`);
      } else {
        const result = await response.json();
        setError(result.detail[0].msg); // Show error message if registration fails
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center transition-all duration-500 ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800"}`}>
      {/* Dark Mode Toggle */}
      <button onClick={toggleDarkMode} className="absolute top-4 right-4 text-2xl" aria-label="Toggle Dark Mode">
        {darkMode ? <FaSun className="text-gray-500" /> : <FaMoon className="text-gray-500" />}
      </button>

      <div className={`w-full max-w-sm p-6 rounded-lg shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        {/* Logo and Title Container */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="/gndec.svg" // Replace with your logo's URL
            alt="gndec logo"
            className="h-24 mb-2"
          />
          <h1 className="text-center text-3xl font-semibold">Club Hub</h1>
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className={`block text-sm font-medium ${darkMode ? "text-white" : "text-gray-700"}`}>
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`mt-1 block w-full px-4 py-2 rounded-lg  ${darkMode ? "bg-gray-700 text-white" : "bg-gray-50 text-gray-900"} shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200`}
              placeholder="Enter your name"
            />
          </div>
          {/* Email Input */}
          <div className="mb-4">
            <label htmlFor="email" className={`block text-sm font-medium ${darkMode ? "text-white" : "text-gray-700"}`}>
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-1 block w-full px-4 py-2 rounded-lg  ${darkMode ? "bg-gray-700 text-white" : "bg-gray-50 text-gray-900"} shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200`}
              placeholder="Enter your email"
            />
          </div>
          {/* Password Input */}
          <div className="mb-4">
            <label htmlFor="password" className={`block text-sm font-medium ${darkMode ? "text-white" : "text-gray-700"}`}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`mt-1 block w-full px-4 py-2 rounded-lg  ${darkMode ? "bg-gray-700 text-white" : "bg-gray-50 text-gray-900"} shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center px-2"
                aria-label="Toggle Password Visibility"
              >
                {showPassword ? <FaEye className="text-gray-500" /> : <FaEyeSlash className="text-gray-500" />}
              </button>
            </div>
          </div>
          {/* CRN Input */}
          <div className="mb-4">
            <label htmlFor="crn" className={`block text-sm font-medium ${darkMode ? "text-white" : "text-gray-700"}`}>
              CRN
            </label>
            <input
              type="text"
              id="crn"
              value={crn}
              onChange={(e) => setCrn(e.target.value)}
              className={`mt-1 block w-full px-4 py-2 rounded-lg  ${darkMode ? "bg-gray-700 text-white" : "bg-gray-50 text-gray-900"} shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200`}
              placeholder="Enter your CRN"
            />
          </div>
          {/* URN Input */}
          <div className="mb-4">
            <label htmlFor="urn" className={`block text-sm font-medium ${darkMode ? "text-white" : "text-gray-700"}`}>
              URN
            </label>
            <input
              type="text"
              id="urn"
              value={urn}
              onChange={(e) => setUrn(e.target.value)}
              className={`mt-1 block w-full px-4 py-2 rounded-lg  ${darkMode ? "bg-gray-700 text-white" : "bg-gray-50 text-gray-900"} shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200`}
              placeholder="Enter your URN"
            />
          </div>
          {/* Buttons */}
          <div className="space-y-4">
            <button
              type="submit"
              className={`w-full py-2 rounded-lg shadow-md transition duration-300 ease-in-out ${darkMode ? "bg-blue-500 hover:bg-blue-700 text-white" : "bg-red-500 hover:bg-red-700 text-white"}`}
            >
              Sign Up
            </button>
            <div className="text-center text-sm">OR</div>
            <button
              className={`w-full py-2 rounded-lg shadow-md transition duration-300 ease-in-out ${darkMode ? "bg-blue-500 hover:bg-blue-700 text-white" : "bg-red-500 hover:bg-red-700 text-white"}`}
            >
              <Link to="/login">Login</Link>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;