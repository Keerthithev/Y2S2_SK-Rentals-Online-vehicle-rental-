import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // useNavigate instead of useHistory

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Hook to navigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:1111/api/v1/password/forgot", { email });
      setMessage(response.data.message);
      
      // Navigate to OTP verification page after sending the email
      navigate("/EnterOtp"); // Navigate to the OTP verification page
    } catch (err) {
      // Check if the error response exists
      if (err.response) {
        setError(err.response.data.message || "Something went wrong!");
      } else {
        setError("Network error. Please try again later.");
      }
    }
  };

  return (
    <div>
      <h2>Forgot Password</h2>
      {message && <div>{message}</div>}
      {error && <div>{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default ForgotPassword;