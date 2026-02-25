import React, { useEffect, useState } from "react";
import { FaEye, FaEyeSlash, FaMoon, FaSun } from "react-icons/fa";
import { useNavigate } from "react-router";

function PasswordChange() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [token, setToken] = useState("");

  const handlePasswordToggle = () => setShowPassword(!showPassword);
  const handleConfirmPasswordToggle = () => setShowConfirmPassword(!showConfirmPassword);

  
    useEffect(() => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        setToken(params.get("token") || "");
      }
    }, []);

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const formData = new FormData();
    formData.append("token", token); 
    formData.append("new_password", password); 

    try {
      const response = await fetch(`http://localhost:8000/password-reset/reset`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Password Changed Successfully");
        navigate("/");
      } else {
        alert("Password Change Failed"); // Show error message if registration fails
      }
    } catch (error) {
      alert("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"} min-h-screen flex flex-col items-center justify-center`}>
      {/* Form Container */}
      <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-6 rounded-lg shadow-md text-center w-full max-w-md`}>
        {/* Logo */}
        <img
          src="https://via.placeholder.com/150" // Replace with your logo URL
          alt="College Logo"
          className="h-24 mb-4 mx-auto"
        />

        {/* Title */}
        <h1 className="text-xl font-bold mb-2">Club Hub</h1>

        {/* Dark Mode Toggle Button */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="absolute top-4 right-4 text-xl"
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>

        {/* Password Change Form */}
        <h2 className="text-lg font-semibold mb-4 flex items-center justify-center gap-2">
          Set new password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div className="relative">
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
              className={`${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"} w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500`}
            />
            <button
              type="button"
              onClick={handlePasswordToggle}
              className="absolute right-3 bottom-3 text-gray-500 hover:text-black"
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>

          {/* Confirm New Password */}
          <div className="relative">
            <label className="block text-sm font-medium mb-1">New Password Confirmation</label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              className={`${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"} w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500`}
            />
            <button
              type="button"
              onClick={handleConfirmPasswordToggle}
              className="absolute right-3 bottom-3 text-gray-500 hover:text-black"
            >
              {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>

<button
  type="submit"
  className={`${darkMode ? "bg-red-600" : "bg-red-500"} text-white py-2 mx-auto rounded-lg hover:bg-red-600 w-108`}
>
  Submit11
</button>

        </form>
      </div>
    </div>
  );
}

export default PasswordChange;
