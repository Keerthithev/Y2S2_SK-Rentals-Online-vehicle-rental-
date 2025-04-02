import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import './AddMaintenance.css';

function AddMaintenance() {
  const [vehicleId, setVehicleId] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [costError, setCostError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const maintenanceTypes = [
    "Oil Change", "Brake Inspection", "Tire Replacement",
    "Engine Repair", "Battery Replacement", "Other"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    if (date > today) {
      setErrorMessage("Future dates are not allowed.");
      return;
    }

    if (cost === "" || isNaN(cost) || parseFloat(cost) < 0) {
      setCostError("Please enter a valid cost (positive number).");
      return;
    }

    const data = { vehicleId, date, type, description, cost };
    try {
      await axios.post("http://localhost:1111/api/v1/add", data, {
        headers: { "Content-Type": "application/json" },
      });
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Maintenance record saved successfully!",
      });
      navigate("/list");
    } catch (error) {
      console.error("Error adding the maintenance record:", error);
      setErrorMessage("There was an error adding the maintenance record.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "There was an error adding the maintenance record.",
      });
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Logged out!',
        });
        navigate("/login");
      }
    });
  };

  return (
    <div className="page-container">
      <header className="header">
        <div className="logo">Vehicle Maintenance</div>
        <nav className="navbar">
          <ul>
            <li className="active">Add Maintenance</li>
            <li onClick={() => navigate("/list")}>Maintenance List</li>
            <li onClick={() => navigate("/reminder")}>Reminder Page</li>
            <li className="logout-btn" onClick={handleLogout}>Logout</li>
          </ul>
        </nav>
      </header>

      <div className="add-maintenance-page">
        <div className="maintenance-form">
          <h2>Add Maintenance Record</h2>
          <form onSubmit={handleSubmit} className="form-container">
            <div className="form-group">
              <input type="text" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} required placeholder="Vehicle ID" />
            </div>
            <div className="form-group">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <select value={type} onChange={(e) => setType(e.target.value)} required>
                <option value="">Select Maintenance Type</option>
                {maintenanceTypes.map((maintenance, index) => (
                  <option key={index} value={maintenance}>{maintenance}</option>
                ))}
              </select>
            </div>
            <div className="form-group full-width">
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Maintenance Description"></textarea>
            </div>
            <div className="form-group">
              <input type="number" value={cost} onChange={(e) => { setCost(e.target.value); setCostError(""); }} required placeholder="Cost" />
              {costError && <p className="error-message">{costError}</p>}
            </div>
            <div className="button-group">
              <button type="submit">Save Record</button>
              <button type="button" onClick={() => navigate("/list")}>Cancel</button>
            </div>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddMaintenance;
