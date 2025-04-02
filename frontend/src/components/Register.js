import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./register.css"; 
const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const role = queryParams.get("role") || "user"; // Default to "user" if not provided

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    driversLicense: "",
    isPhoneVerified: true,
    role: role, // Set role from URL
  });

  const [error, setError] = useState("");

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:1111/api/v1/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Something went wrong");
      } else {
        alert("Registration successful! Please login.");
        navigate("/login"); // Redirect to login page
      }
    } catch (error) {
      setError("Failed to connect to server.");
      console.error("Error:", error);
    }
  };

  return (
    <div class="container2">
    <div class="form-wrapper">
      <h2 class="title">Register for Vehicle Rental</h2>
      {error && <div class="alert error">{error}</div>}
  
      <form onSubmit={handleSubmit} class="form-container">
        <div class="form-group">
          <label id="l" for="name">Full Name</label>
          <input type="text" id="name" name="name" class="form-input" required onChange={handleChange} />
        </div>
  
        <div class="form-group">
          <label id="l" for="email">Email</label>
          <input type="email" id="email" name="email" class="form-input" required onChange={handleChange} />
        </div>
  
        <div class="form-group">
          <label id="l" for="password">Password</label>
          <input type="password" id="password" name="password" class="form-input" onChange={handleChange} />
        </div>
  
        <div class="form-group">
          <label id="l" for="phone">Phone Number</label>
          <input type="text" id="phone" name="phone" class="form-input" required pattern="[0-9]{10}" onChange={handleChange} />
        </div>
  
        <div class="form-group">
          <label id="l" for="address">Address</label>
          <input type="text" id="address" name="address" class="form-input" required onChange={handleChange} />
        </div>
  
        <div class="form-group">
          <label id="l" for="dateOfBirth">Date of Birth</label>
          <input type="date" id="dateOfBirth" name="dateOfBirth" class="form-input" required onChange={handleChange} />
        </div>
  
        <div class="form-group">
          <label id="l" for="driversLicense">Driver's License</label>
          <input type="text" id="driversLicense" name="driversLicense" class="form-input" required pattern="[A-Z]{2}-\d{10}" placeholder="AB-1234567890" onChange={handleChange} />
        </div>
  
        <button type="submit" class="submit-btn">Register as {role}</button>
      </form>
    </div>
  </div>
  
  );
};

export default Register;
