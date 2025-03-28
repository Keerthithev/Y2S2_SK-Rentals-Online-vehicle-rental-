import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
    "Oil Change",
    "Brake Inspection",
    "Tire Replacement",
    "Engine Repair",
    "Battery Replacement",
    "Other"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cost === "" || isNaN(cost) || parseFloat(cost) < 0) {
      setCostError("Please enter a valid cost (positive number).");
      return;
    }

    const data = {
      vehicleId,
      date,
      type,
      description,
      cost,
    };

    try {
      await axios.post("http://localhost:1111/api/v1/add", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      alert("Maintenance record saved successfully!");
      navigate("/list");  
    } catch (error) {
      console.error("There was an error adding the maintenance record:", error);
      setErrorMessage("There was an error adding the maintenance record.");
    }
  };

  return (
    <div className="add-maintenance-page">
      <div className="maintenance-form">
        <h2>Add Maintenance Record</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              required
              placeholder="Vehicle ID"
            />
          </div>
          <div className="form-group">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <select value={type} onChange={(e) => setType(e.target.value)} required>
              <option value="">Select Maintenance Type</option>
              {maintenanceTypes.map((maintenance, index) => (
                <option key={index} value={maintenance}>
                  {maintenance}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Maintenance Description"
            ></textarea>
          </div>
          <div className="form-group">
            <input
              type="number"
              value={cost}
              onChange={(e) => {
                const value = e.target.value === "" ? "" : e.target.value;
                setCost(value);
                setCostError(""); 
              }}
              required
              placeholder="Cost"
            />
            {costError && <p style={{ color: "red" }}>{costError}</p>}
          </div>
          <button type="submit">Save Maintenance Record</button>
          <button type="button" onClick={() => navigate("/list")}>Cancel</button> 
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        </form>
      </div>
    </div>
  );
}

export default AddMaintenance;
