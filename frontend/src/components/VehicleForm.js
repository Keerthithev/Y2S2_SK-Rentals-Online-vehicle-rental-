import React, { useState } from "react";
import axios from "axios";

const VehicleForm = () => {
  const [vehicleData, setVehicleData] = useState({
    make: "",
    model: "",
    year: "",
    rental_price_per_day: "",
    type: "",
    availability_status: "available",
    location: "",
    fuel_type: "",
    transmission: "",
    seating_capacity: "",
    mileage: "",
    last_service_date: "",
    insurance_expiry: "",
  });

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Handle input change
  const handleChange = (e) => {
    setVehicleData({ ...vehicleData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    // Basic validation
    if (!vehicleData.year || vehicleData.year < 1886 || vehicleData.year > new Date().getFullYear()) {
      setError("Please enter a valid year.");
      return;
    }
    if (vehicleData.rental_price_per_day <= 0) {
      setError("Rental price must be a positive number.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:1111/api/v1/admin/vehicle/new",
        vehicleData
      );
      if (response.data.success) {
        setMessage("Vehicle added successfully!");
        setVehicleData({
          make: "",
          model: "",
          year: "",
          rental_price_per_day: "",
          type: "",
          availability_status: "available",
          location: "",
          fuel_type: "",
          transmission: "",
          seating_capacity: "",
          mileage: "",
          last_service_date: "",
          insurance_expiry: "",
        });
      }
    } catch (error) {
      console.error("Error adding vehicle:", error); // Log the error for debugging
      setError("Failed to add vehicle. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <h2>Add a New Vehicle</h2>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <input type="text" name="make" placeholder="Make" value={vehicleData.make} onChange={handleChange} required />
        <input type="text" name="model" placeholder="Model" value={vehicleData.model} onChange={handleChange} required />
        <input type="number" name="year" placeholder="Year" value={vehicleData.year} onChange={handleChange} required />
        <input type="number" name="rental_price_per_day" placeholder="Price per day" value={vehicleData.rental_price_per_day} onChange={handleChange} required />
        
        <select name="type" value={vehicleData.type} onChange={ handleChange} required>
          <option value="">Select Vehicle Type</option>
          <option value="Economy Cars">Economy Cars</option>
          <option value="Compact Cars">Compact Cars</option>
          <option value="Luxury Cars">Luxury Cars</option>
          <option value="Vans/KDH Vans">Vans/KDH Vans</option>
          <option value="Motor Bikes">Motor Bikes</option>
          <option value="Electric Bikes">Electric Bikes</option>
        </select>

        <select name="availability_status" value={vehicleData.availability_status} onChange={handleChange} required>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>

        <input type="text" name="location" placeholder="Location" value={vehicleData.location} onChange={handleChange} required />
        <input type="text" name="fuel_type" placeholder="Fuel Type" value={vehicleData.fuel_type} onChange={handleChange} required />
        <input type="text" name="transmission" placeholder="Transmission" value={vehicleData.transmission} onChange={handleChange} required />
        <input type="number" name="seating_capacity" placeholder="Seating Capacity" value={vehicleData.seating_capacity} onChange={handleChange} required />
        <input type="number" name="mileage" placeholder="Mileage" value={vehicleData.mileage} onChange={handleChange} required />

        <label>Last Service Date:</label>
        <input type="date" name="last_service_date" value={vehicleData.last_service_date} onChange={handleChange} required />

        <label>Insurance Expiry:</label>
        <input type="date" name="insurance_expiry" value={vehicleData.insurance_expiry} onChange={handleChange} required />

        <button type="submit">Add Vehicle</button>
      </form>
    </div>
  );
};

export default VehicleForm;