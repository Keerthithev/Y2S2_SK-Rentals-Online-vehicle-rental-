import React, { useState, useEffect } from "react";
import axios from "axios";



const BookingVehicle = () => {
  const [formData, setFormData] = useState({
    user: "60b8f1d5f4d1b6cd91f6b74b",
    vehicle: "605c72ef1532071b1c8bdbeb",
    vehicleName: "",
    rentalStartDate: "",
    rentalEndDate: "",
    pickUpLocation: "",
    dropOffLocation: "",
    totalAmount: "",
    paymentMethod: "Credit Card",
  });

  const [error, setError] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [vehicls, setVehicls] = useState(["Honda","Toyota", "Maruthi Suzuki","KIA","BMW"]); // Store fetched vehicles

  useEffect(() => {
    // Fetch user ID from local storage
    const userId = localStorage.getItem("userId");
    if (userId) {
      setFormData((prev) => ({ ...prev, user: userId }));
    }

    // Fetch available vehicles
    const fetchVehicles = async () => {
      try {
        const response = await axios.get("http://localhost:1111/api/v1/admin/vehicles/available");
        setVehicles(response.data.vehicles); 
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        setError("Failed to fetch vehicles.");
      }
    };

    fetchVehicles();
  }, []);

/* const handleChange = (e) => {
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
}; */

const handleChange = (e) => {
 
  const { name, value } = e.target;

  if (name === "vehicleName") {
    // Since vehicls is now an array of strings, just store the selected value
    setFormData({
      ...formData,
       // Store the vehicle name directly
      vehicleName: value, // Store the same value in vehicleName (optional)
    });
  } else {
    setFormData({ ...formData, [name]: value });
  }
};



  const validateDates = () => {
    //const today=new Date

  //   if(formData.rentalStartDate < today){
  //     return res.status(400).json({
  //       success: false,
  //       message: "Booking date cannot be in the past.",
      
  //   });
  // }

    if (formData.rentalEndDate && formData.rentalStartDate) {
      return new Date(formData.rentalEndDate) >= new Date(formData.rentalStartDate);
    }
    return true;
  };

  const location =()=>{
    

  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(formData)

    if (!validateDates()) {
      setError("Rental end date must be after the start date.");
      return;
    }
    
    // if(!isNaN (pickUpLocation) &&!isNaN (pickUpLocation)){
    //   setError("Locations should be text.");
    //   return ;
    // }
    const locationRegex = /^[A-Za-z\s]+$/; // Regular expression to match only letters and spaces
    if (!locationRegex.test(formData.pickUpLocation)) {
      setError("Pick-up location must be text only.");
      return;
    }
    if (!locationRegex.test(formData.dropOffLocation)) {
      setError("Drop-off location must be text only.");
      return;
    }

    setError("");

    try {
      const response = await axios.post(
        "http://localhost:1111/api/v2/booking/new",
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
      <h2 className="h2">
        Vehicle Booking Form
      </h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit} className="ml-auto mr-auto" style={{ maxHeight: "80vh", overflowY: "auto", width: "90vw" }}>
        {/* User ID */}
        <div className="mb-3">
          <label htmlFor="user" className="form-label">User Email:</label>
          <input
            type="text"
            id="user"
            name="user"
            className="form-control"
            value={formData.user}
            onChange={handleChange}
            required
            readOnly
          />
        </div>

        {/* Vehicle Selection Dropdown */}
        <div className="mb-3">
          <label htmlFor="vehicleName" className="form-label">Select Vehicle:</label>
          <select
            id="vehicleName"
            name="vehicleName"
            className="form-select"
            value={formData.vehicleName}
            onChange={handleChange}
            required
          >
            <option value="">-- Select a Vehicle --</option>
                  {vehicls.map((vehicle, index) => (
            <option key={index} value={vehicle}>
                   {vehicle}
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
            <option value="PayPal">Cash on </option>
          </select>
        </div>

        {/* Submit Button */}
        <button type="submit" className="button">
          Submit Booking
        </button>
      </form>
    </div>
  );
};

export default BookingVehicle;
