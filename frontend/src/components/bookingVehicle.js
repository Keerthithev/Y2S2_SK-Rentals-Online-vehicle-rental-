import React, { useState, useEffect } from "react";
import axios from "axios";

const BookingVehicle = () => {
  const [formData, setFormData] = useState({
    user: "",
    vehicle: "",
    vehicleName: "",
    rentalStartDate: "",
    rentalEndDate: "",
    pickUpLocation: "",
    dropOffLocation: "",
    totalAmount: "",
    paymentMethod: "Credit Card",
  });

  const [error, setError] = useState("");
  const [vehicles, setVehicles] = useState([]); // Store fetched vehicles

  useEffect(() => {
    // Fetch user ID from local storage
    const userId = localStorage.getItem("userId");
    if (userId) {
      setFormData((prev) => ({ ...prev, user: userId }));
    }

    // Fetch available vehicles
    const fetchVehicles = async () => {
      try {
        const response = await axios.post("http://localhost:1111/api/v1/booking/new");
        setVehicles(response.data.vehicles); // Store vehicles in state
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        setError("Failed to fetch vehicles.");
      }
    };

    fetchVehicles();
  }, []);

const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "vehicle") {
    // Find the selected vehicle
    const selectedVehicle = vehicles.find(vehicle => vehicle._id === value);
    console.log("Selected vehicle:", selectedVehicle);  // Log the selected vehicle
    setFormData({
      ...formData,
      vehicle: selectedVehicle._id, // Save vehicle_id
      vehicleName: selectedVehicle ? `${selectedVehicle.make} - ${selectedVehicle.model}` : "" // Save vehicle name
    });
  } else {
    setFormData({ ...formData, [name]: value });
  }
};


  const validateDates = () => {
    if (formData.rentalEndDate && formData.rentalStartDate) {
      return new Date(formData.rentalEndDate) >= new Date(formData.rentalStartDate);
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(formData)

    if (!validateDates()) {
      setError("Rental end date must be after the start date.");
      return;
    }

    setError("");

    try {
      const response = await axios.post(
        "http://localhost:1111/api/v1/booking/new",
        formData,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Response:", response.data);
      alert("Booking submitted successfully!");
      setFormData({
        user: "",
        vehicle: "",  // Reset vehicle field
        vehicleName: "", // Reset vehicle name field
        rentalStartDate: "",
        rentalEndDate: "",
        pickUpLocation: "",
        dropOffLocation: "",
        totalAmount: "",
        paymentMethod: "Credit Card",
      });
    } catch (error) {
      console.error("Error submitting booking:", error);
      setError("Failed to submit booking. Please try again.");
    }
  };

  return (
    <div className="mt-5">
      <h2 className="bg-success text-light p-3 text-center rounded">
        Vehicle Booking Form
      </h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit} className="ml-auto mr-auto" style={{ maxHeight: "80vh", overflowY: "auto", width: "90vw" }}>
        {/* User ID */}
        <div className="mb-3">
          <label htmlFor="user" className="form-label">User ID:</label>
          <input
            type="text"
            id="user"
            name="user"
            className="form-control"
            value={formData.user}
            onChange={handleChange}
            required
          />
        </div>

        {/* Vehicle Selection Dropdown */}
        <div className="mb-3">
          <label htmlFor="vehicle" className="form-label">Select Vehicle:</label>
          <select
            id="vehicle"
            name="vehicle"
            className="form-select"
            value={formData.vehicle}
            onChange={handleChange}
            required
          >
            <option value="">-- Select a Vehicle --</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.make} - {vehicle.model}
              </option>
            ))}
          </select>
        </div>

        {/* Rental Start Date */}
        <div className="mb-3">
          <label htmlFor="rentalStartDate" className="form-label">Rental Start Date:</label>
          <input
            type="date"
            id="rentalStartDate"
            name="rentalStartDate"
            className="form-control"
            value={formData.rentalStartDate}
            onChange={handleChange}
            required
          />
        </div>

        {/* Rental End Date */}
        <div className="mb-3">
          <label htmlFor="rentalEndDate" className="form-label">Rental End Date:</label>
          <input
            type="date"
            id="rentalEndDate"
            name="rentalEndDate"
            className="form-control"
            value={formData.rentalEndDate}
            onChange={handleChange}
            required
          />
        </div>

        {/* Pick-up Location */}
        <div className="mb-3">
          <label htmlFor="pickUpLocation" className="form-label">Pick-up Location:</label>
          <input
            type="text"
            id="pickUpLocation"
            name="pickUpLocation"
            className="form-control"
            value={formData.pickUpLocation}
            onChange={handleChange}
            required
          />
        </div>

        {/* Drop-off Location */}
        <div className="mb-3">
          <label htmlFor="dropOffLocation" className="form-label">Drop-off Location:</label>
          <input
            type="text"
            id="dropOffLocation"
            name="dropOffLocation"
            className="form-control"
            value={formData.dropOffLocation}
            onChange={handleChange}
            required
          />
        </div>

        {/* Total Amount */}
        <div className="mb-3">
          <label htmlFor="totalAmount" className="form-label">Total Amount:</label>
          <input
            type="number"
            id="totalAmount"
            name="totalAmount"
            className="form-control"
            value={formData.totalAmount}
            onChange={handleChange}
            required
            min="0"
          />
        </div>

        {/* Payment Method */}
        <div className="mb-3">
          <label htmlFor="paymentMethod" className="form-label">Payment Method:</label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            className="form-select"
            value={formData.paymentMethod}
            onChange={handleChange}
            required
          >
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="PayPal">PayPal</option>
          </select>
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn btn-success w-100 mt-3">
          Submit Booking
        </button>
      </form>
    </div>
  );
};

export default BookingVehicle;
