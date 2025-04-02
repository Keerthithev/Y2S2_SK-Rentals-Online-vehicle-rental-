import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // useNavigate instead of useHistory
import { Mail, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import "./forgotPassword.css";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    
    <div className="forgot-password-container">
    <div className="forgot-password-card">
      <div className="card-header">
        <h2 className="card-title">Forgot Password?</h2>
        <p className="card-description">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>
        {message && (
          <div className="success-message">
            <CheckCircle2 size={20} />
            <span>{message}</span>
          </div>
        )}
   {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

<form onSubmit={handleSubmit} className="form-container">
          <div className="input-group">
            <Mail className="input-icon" size={20} />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="email-input"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="submit-button"
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Reset Password</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="back-button"
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;