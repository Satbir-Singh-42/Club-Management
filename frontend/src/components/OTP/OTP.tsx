"use client";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaMoon, FaSun } from "react-icons/fa";
import { API_BASE_URL } from "@/config/api";

const Otp: React.FC = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setStudentId(params.get("student_id") || "");
    }
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Automatically move to the next input if value is entered
      if (value && index < otp.length - 1) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) (nextInput as HTMLElement).focus();
      }
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    const data = { student_id: studentId, otp: enteredOtp };
    try {
      const response = await fetch(`${API_BASE_URL}/register/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(data).toString(),
      });

      if (response.ok) {
        navigate("/login");
      } else {
        const result = await response.json();
        setError(result.detail[0].msg); // Show error message if registration fails
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <div
      className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"} min-h-screen flex flex-col items-center justify-center p-4`}>
      {/* OTP Form Container */}
      <div
        className={`${darkMode ? "bg-gray-800" : "bg-white"} p-6 rounded-lg shadow-lg text-center w-full max-w-md`}>
        {/* Logo */}
        <img
          src="https://via.placeholder.com/150" // Replace with your logo URL
          alt="College Logo"
          className="h-24 mb-4 mx-auto"
        />

        {/* Title */}
        <h1 className="text-2xl font-bold mb-2">Club Hub</h1>

        {/* Dark Mode Toggle Button */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="absolute top-4 right-4 text-xl">
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>

        {/* OTP Form Content */}
        <h2 className="text-lg font-semibold mb-4">Verify Your Mail</h2>
        <p className="text-sm mb-6">
          We sent a 6-digit OTP to your email. Enter it below to proceed.
        </p>

        {/* OTP Input */}
        <form onSubmit={handleOtpSubmit} className="flex flex-col items-center">
          <div className="flex justify-center space-x-3 mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                maxLength={1}
                className={`${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"} w-12 h-12 text-center border border-gray-300 rounded-md text-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {/* Resend Link */}
          <p className="text-sm text-green-500 mb-4">OTP sent successfully.</p>
          <p className="text-sm">
            Didn’t receive the email?{" "}
            <a href="#" className="text-blue-500 underline">
              Resend OTP
            </a>
          </p>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          {/* Submit Button */}
          <button
            type="submit"
            className={`${darkMode ? "bg-red-600" : "bg-red-500"} text-white py-2 rounded-md mt-8 hover:bg-red-600`}>
            Validate OTP
          </button>
        </form>
      </div>
    </div>
  );
};

export default Otp;
