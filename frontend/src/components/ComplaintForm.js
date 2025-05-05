import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function ComplaintForm() {
  const [customerName, setCustomerName] = useState('');
  const [issueType, setIssueType] = useState('');
  const [vehicleID, setVehicleID] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [customerID, setCustomerID] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:1111/api/v1/myprofile", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        setCustomerName(response.data.user.name);
        setCustomerID(response.data.user._id);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user:", error);
        setLoading(false);
        setCustomerName('');
        setCustomerID('');
      }
    };
  
    fetchUser();
  }, []);
  

  const validateForm = () => {
    let tempErrors = {};
    if (!customerName.trim()) tempErrors.customerName = "Customer name is required.";
    if (!issueType) tempErrors.issueType = "Issue type is required.";
    if (issueType === 'vehicle' && !vehicleID.trim()) tempErrors.vehicleID = "Vehicle ID is required.";
    if (!issueDescription.trim()) tempErrors.issueDescription = "Issue description is required.";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    const complaintData = {
      customerID,
      customerName,
      issueType,
      vehicleID: issueType === 'vehicle' ? vehicleID : null,
      issueDescription,
    };
  
    try {
      await axios.post('http://localhost:1111/api/v1/complaintform', complaintData);
      Swal.fire({
        icon: 'success',
        title: 'Complaint Submitted!',
        text: 'Your complaint has been submitted successfully.',
      }).then(() => navigate('/profile'));
    } catch (error) {
      console.error('Error submitting complaint:', error);
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: 'There was an error submitting your complaint.',
      });
    }
  };
  
  return (
    <div className="complaint-form-container">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="complaint-form">
          <h2>Submit a Complaint</h2>

          <div className="form-group">
            <label>Customer Name:</label>
            <input type="text" value={customerName} readOnly />
            {errors.customerName && <span className="error">{errors.customerName}</span>}
          </div>

          <div className="form-group">
            <label>Issue Type:</label>
            <select value={issueType} onChange={(e) => setIssueType(e.target.value)}>
            <option value="">Select Issue Type</option>
            <option value="vehicle">Vehicle</option>
            <option value="payment">Payment</option>
            <option value="staff">Staff Behavior</option>
            <option value="other">Other</option>
          </select>

            {errors.issueType && <span className="error">{errors.issueType}</span>}
          </div>

          {issueType === 'vehicle' && (
            <div className="form-group">
              <label>Vehicle ID:</label>
              <input type="text" value={vehicleID} onChange={(e) => setVehicleID(e.target.value)} />
              {errors.vehicleID && <span className="error">{errors.vehicleID}</span>}
            </div>
          )}

          <div className="form-group">
            <label>Issue Description:</label>
            <textarea value={issueDescription} onChange={(e) => setIssueDescription(e.target.value)} />
            {errors.issueDescription && <span className="error">{errors.issueDescription}</span>}
          </div>

          <button type="submit">Submit Complaint</button>
        </form>
      )}
    </div>
  );
}

export default ComplaintForm;