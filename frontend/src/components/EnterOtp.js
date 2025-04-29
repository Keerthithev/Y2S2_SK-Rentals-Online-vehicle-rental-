import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // useNavigate instead of useHistory


const EnterOtp = () => {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate(); // Hook to navigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    try {
      const response = await axios.post("http://localhost:1111/api/v1/password/reset", {
        otp,
        newPassword,
        confirmPassword,
      });
      setSuccess(response.data.message);
      
      // Redirect to login page after successful reset
      navigate("/login"); // Navigate to the login page
    } catch (err) {
      setError(err.response.data.message || "Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black flex items-center justify-center px-4">
      <div className="bg-white/5 backdrop-blur-lg shadow-2xl rounded-2xl overflow-hidden w-full max-w-lg p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-blue-400 mb-2">Verify OTP and Reset Password</h2>
          <p className="text-gray-400 mb-4">Please enter the OTP sent to your email and choose a new password.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-600 text-white text-sm rounded-md shadow-md flex items-center justify-between">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-600 text-white text-sm rounded-md shadow-md flex items-center justify-between">
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="w-full pl-4 pr-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="relative">
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full pl-4 pr-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="relative">
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full pl-4 pr-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-700 hover:bg-blue-800 transition duration-300 text-white font-bold py-2 rounded-md shadow-md"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default EnterOtp;
