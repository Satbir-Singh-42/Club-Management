import Navbar from "@/components/Navbar/Navbar";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "@/config/api";

const StudentProfileSetup = () => {
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [stuId, setStuId] = useState<number | null>(null);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fillInitialData();
  }, []);

  const fillInitialData = async () => {
    try {
      const response: any = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setStuId(response.data.id);

      (document.getElementById("name") as HTMLInputElement).value =
        response.data.name;
      (document.getElementById("crn") as HTMLInputElement).value =
        response.data.crn;
      (document.getElementById("urn") as HTMLInputElement).value =
        response.data.urn;
      (document.getElementById("branch") as HTMLInputElement).value =
        response.data.branch;
      (document.getElementById("batch") as HTMLInputElement).value =
        response.data.batch;
      (document.getElementById("email") as HTMLInputElement).value =
        response.data.email;
      (document.getElementById("phone") as HTMLInputElement).value =
        response.data.phone;
      (document.getElementById("gender") as HTMLInputElement).value =
        response.data.gender;

      // set user details in state
    } catch (err: any) {
      console.log(`Failed to load user details:${err}`);
    }
  };

  // Handle profile image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file type and size
      if (file.size > 2000000) {
        alert("File size should not exceed 2MB");
      } else if (!file.type.startsWith("image/")) {
        alert("Please upload a valid image file.");
      } else {
        setProfileImage(file);
      }
    }
  };

  // Handle keypress to allow only alphabets and spaces
  const handleTextInputKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    const key = e.key;

    // Check if the pressed key is not a letter (a-z, A-Z) or space
    if (!/^[A-Za-z\s]$/.test(key)) {
      e.preventDefault(); // Prevent the default action (entering the character)
    }
  };

  // Handle keypress to allow only numbers
  const handleNumberInputKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    const key = e.key;

    // Allow only numbers (0-9)
    if (!/^\d$/.test(key)) {
      e.preventDefault(); // Prevent non-numeric input
    }
  };

  // Handle change to restrict the length of the input to 7 digits
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length > 7) {
      e.preventDefault(); // Prevent entering more than 7 digits
    }
  };

  // Handle form validation and submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Collect form data
    const name = (document.getElementById("name") as HTMLInputElement)?.value;
    const branch = (document.getElementById("branch") as HTMLSelectElement)
      ?.value;
    const crn = (document.getElementById("crn") as HTMLInputElement)?.value;
    const urn = (document.getElementById("urn") as HTMLInputElement)?.value;
    const batch = parseInt(
      (document.getElementById("batch") as HTMLSelectElement)?.value,
    );
    const email = (document.getElementById("email") as HTMLInputElement)?.value;
    const phone = (document.getElementById("phone") as HTMLInputElement)?.value;
    let gender = (document.getElementById("gender") as HTMLSelectElement)
      ?.value;
    const password = (document.getElementById("password") as HTMLInputElement)
      ?.value;
    const confirmPassword = (
      document.getElementById("confirmPassword") as HTMLInputElement
    )?.value;

    // Validation for empty fields
    if (
      !name ||
      !branch ||
      !crn ||
      !urn ||
      !batch ||
      !email ||
      !phone ||
      !gender ||
      !password ||
      !confirmPassword
    ) {
      alert("Please fill out all fields correctly.");
      return;
    }

    if (!stuId) {
      alert("Student ID is missing.");
      return;
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // Map gender to 'M' or 'F'
    gender = gender === "Male" ? "M" : "F";

    // Validate password length
    if (password.length < 8) {
      alert("Password should be at least 8 characters.");
      return;
    }

    // Validate phone number format (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      alert("Please enter a valid phone number.");
      return;
    }
    const phoneNumber = `+91 ${phone}`;
    // Create the data object
    const data = {
      name,
      branch,
      crn,
      urn,
      batch,
      email,
      phone: phoneNumber,
      gender,
      password,
    };

    console.log("Sending data:", data); // Check the data before sending

    try {
      // Send the form data as JSON
      const response = await fetch(`${API_BASE_URL}/students/${stuId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      // Handle server response
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save profile: ${errorText}`);
      }
      alert("Profile saved successfully!");
    } catch (error) {
      alert("Error: " + error);
    }
  };

  // Handle cancel button action (reset form or navigate)
  const handleCancel = () => {
    setProfileImage(null);
    alert("Form reset.");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto py-10">
        <section className="text-center">
          <div className="relative inline-block">
            {/* Profile Image */}
            <div className="flex justify-center items-center">
              <img
                src={
                  profileImage
                    ? URL.createObjectURL(profileImage)
                    : "/profile.png"
                }
                alt="Profile"
                className="w-36 h-36 rounded-full border-0 border-gray-300 shadow-xl"
              />
            </div>
            {/* Upload Button */}
            <label
              htmlFor="profileImage"
              className="mt-3 inline-flex items-center px-4 py-2 bg-gray-800 text-white text-sm font-semibold rounded-md shadow-md cursor-pointer hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500">
              Upload your photo
            </label>
            <input
              id="profileImage"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-lg p-6 mt-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4 text-center">
            Basic Information
          </h2>
          <div className="grid grid-cols-2 gap-6">
            {/* Name */}
            <input
              type="text"
              id="name"
              placeholder="Name"
              onKeyPress={handleTextInputKeyPress}
              className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* Branch Select */}
            <select
              className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              id="branch"
              required>
              <option value="">Select Branch</option>
              <option value="Civil">Civil Engineering</option>
              <option value="CSE">Computer Science Engineering</option>
              <option value="Electrical">Electrical Engineering</option>
              <option value="ECE">
                Electronics & Communication Engineering
              </option>
              <option value="IT">Information Technology</option>
              <option value="Mechanical_Production">
                Mechanical & Production Engineering
              </option>
            </select>

            {/* College Roll Number */}
            <input
              type="text"
              id="crn"
              placeholder="College Roll Number"
              maxLength={7} // Restrict to 7 digits
              onKeyPress={handleNumberInputKeyPress}
              onChange={handleNumberInputChange}
              className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* University Roll Number */}
            <input
              type="text"
              id="urn"
              placeholder="University Roll Number"
              maxLength={7} // Restrict to 7 digits
              onKeyPress={handleNumberInputKeyPress}
              onChange={handleNumberInputChange}
              className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* Batch Start Year Select */}
            <select
              className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              id="batch"
              required>
              <option value="">Select Batch Start Year</option>
              {[...Array(currentYear - 2021 + 1).keys()].map((i) => {
                const year = 2021 + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>

            {/* Personal Email */}
            <input
              type="email"
              id="email"
              placeholder="Personal Email"
              className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* Contact */}
            <input
              type="text"
              id="phone"
              placeholder="Phone Number"
              maxLength={10} // Restrict to 7 digits
              onKeyPress={handleNumberInputKeyPress}
              onChange={handleNumberInputChange}
              className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* Gender Select */}
            <select
              className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              id="gender"
              required>
              <option value="">Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            {/* Password */}
            <input
              type="password"
              id="password"
              placeholder="Password"
              className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* Confirm Password */}
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm Password"
              className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-center gap-4 mt-12">
            <button
              type="button"
              className="w-[220px] h-[40px] bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              onClick={handleCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className="w-[220px] h-[40px] bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={handleSubmit}>
              Save
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default StudentProfileSetup;
