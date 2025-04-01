import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="text-center mb-4">Register for Vehicle Rental</h2>
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} className="border p-4 rounded shadow">
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-control" name="name" required onChange={handleChange} />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" name="email" required onChange={handleChange} />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" name="password" onChange={handleChange} />
            </div>

            <div className="mb-3">
              <label className="form-label">Phone Number</label>
              <input type="text" className="form-control" name="phone" required pattern="[0-9]{10}" onChange={handleChange} />
            </div>

            <div className="mb-3">
              <label className="form-label">Address</label>
              <input type="text" className="form-control" name="address" required onChange={handleChange} />
            </div>

            <div className="mb-3">
              <label className="form-label">Date of Birth</label>
              <input type="date" className="form-control" name="dateOfBirth" required onChange={handleChange} />
            </div>

            <div className="mb-3">
              <label className="form-label">Driver's License</label>
              <input type="text" className="form-control" name="driversLicense" required pattern="[A-Z]{2}-\d{10}" placeholder="AB-1234567890" onChange={handleChange} />
            </div>

            <button type="submit" className="btn btn-primary w-100">Register as {role}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
