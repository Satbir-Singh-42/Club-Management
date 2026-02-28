import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaMoon, FaSun } from "react-icons/fa";
import axios from "axios";
import { getToken } from "@/utils/getLoginDetails";
import { API_BASE_URL } from "@/config/api";

interface LoginProps {
  setLoginStatus: React.Dispatch<React.SetStateAction<boolean>>;
  setUserType: React.Dispatch<
    React.SetStateAction<"student" | "club" | "superadmin" | undefined>
  >;
}

const Login: React.FC<LoginProps> = ({ setLoginStatus, setUserType }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Both email and password are required.");
    } else {
      setError("");
      try {
        const response = await axios.post(
          `${API_BASE_URL}/auth/token`,
          new URLSearchParams({
            username: email,
            password: password,
          }),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          },
        );
        // Store the token and navigate to the main page
        const { access_token } = response.data;
        localStorage.setItem("token", access_token); // Store token in localStorage
        setLoginStatus(true);
        setUserType(getToken()?.userType || undefined);
        navigate("/"); // Redirect to the main page
      } catch (err) {
        setError("Invalid email or password.");
      }
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
            src="/gndec.svg" // Replace with your logo's URL
            alt="gndec logo"
            className="h-24 mb-4"
          />
        </div>
        {/* Title */}
        <h1 className="text-center text-2xl font-semibold mb-4">Club Hub</h1>
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
        {/* Password Input */}
        <div className="mb-4">
          <label
            htmlFor="password"
            className={`block text-sm font-medium ${
              darkMode ? "text-white" : "text-gray-700"
            }`}>
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center px-2"
              aria-label="Toggle Password Visibility">
              {showPassword ? (
                <FaEye className="text-gray-500 dark:text-gray-300" />
              ) : (
                <FaEyeSlash className="text-gray-500 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
        {/* Validation Error */}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {/* Checkbox */}
        <div className="mb-4 flex items-center justify-between">
          <label className="flex items-center">
            <input type="checkbox" className="form-checkbox text-blue-500" />
            <span
              className={`ml-2 text-sm ${
                darkMode ? "text-white" : "text-gray-600"
              }`}>
              Remember Me
            </span>
          </label>
          <a
            href="#"
            className={`text-sm ${darkMode ? "text-white" : "text-blue-600"} hover:underline`}
            onClick={() => (window.location.href = "/forgot-password")} // Navigate to forgot-password page
          >
            Forgot Password?
          </a>
        </div>
        {/* Buttons */}
        <div className="space-y-4">
          <button
            className={`w-full py-2 rounded-lg shadow-md transition duration-300 ease-in-out ${
              darkMode
                ? "bg-blue-500 hover:bg-blue-700 text-white"
                : "bg-red-500 hover:bg-red-700 text-white"
            }`}
            onClick={handleLogin}>
            Login
          </button>
          <div className="text-center text-sm">OR</div>
          <button
            className={`w-full py-2 rounded-lg shadow-md transition duration-300 ease-in-out ${
              darkMode
                ? "bg-blue-500 hover:bg-blue-700 text-white"
                : "bg-red-500 hover:bg-red-700 text-white"
            }`}>
            <Link to="/register">Sign Up</Link>
          </button>
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

export default Login;
