import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Corrected import
import './ComplaintList.css';

function ComplaintList() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [editedComplaint, setEditedComplaint] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchComplaints();
    }
  }, [userId]);

  const fetchUserId = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError('No token found.');
        return;
      }

      const decodedToken = jwtDecode(token);
      if (!decodedToken || !decodedToken.id) {
        setError('Invalid token.');
        return;
      }

      const response = await axios.get("http://localhost:1111/api/v1/myprofile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserId(response.data.user._id);
    } catch (error) {
      setError('Error fetching user data');
    }
  };

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("token");

      let userID = null;
      let role = null;

      if (token) {
        const decodedToken = jwtDecode(token);
        console.log(decodedToken);  // Check if 'role' exists in the token

        userID = decodedToken.id;
        role = decodedToken.role; // Extract role
      }

      if (!userID) {
        setError("User ID is required.");
        return;
      }

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Construct the correct API URL based on role
      const url = `http://localhost:1111/api/v1/complaints/${userID}`;

      const response = await axios.get(url, { headers });

      setComplaints(response.data);
    } catch (error) {
      setError("Error fetching complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (complaintID) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;

    try {
      await axios.delete(`http://localhost:1111/api/v1/complaints/${complaintID}`);
      setComplaints(complaints.filter((complaint) => complaint._id !== complaintID));
    } catch (error) {
      alert('Error deleting complaint');
    }
  };

  const handleEdit = (complaint) => {
    if (complaint.status !== 'Resolved') {
      setEditedComplaint(complaint);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'issueType' && value === 'service') {
      setEditedComplaint((prevState) => ({
        ...prevState,
        [name]: value,
        vehicleID: '',
      }));
    } else {
      setEditedComplaint((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleSaveEdit = async () => {
    const { issueType, vehicleID, issueDescription } = editedComplaint;
  
    if (!issueType || !issueDescription) {
      alert('All fields are required!');
      return;
    }
  
    const complaintData = {
      issueType,
      issueDescription,
    };
  
    if (issueType === 'vehicle' && vehicleID) {
      complaintData.vehicleID = vehicleID;
    }
  
    try {
      const response = await axios.put(
        `http://localhost:1111/api/v1/complaints/${editedComplaint._id}`,
        complaintData
      );
      alert('Complaint updated successfully!');
      fetchComplaints();  // Fetch complaints again to update the UI
      setEditedComplaint(null);  // Reset the edited state
    } catch (error) {
      console.error('Error updating complaint:', error);
      alert('Error updating complaint');
    }
  };

  if (loading) return <p className="loading">Loading complaints...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="complaint-dashboard">
      <div className="dashboard-header">
        <h2>My Complaints</h2>
      </div>

      {complaints.length === 0 ? (
        <p className="no-complaints">No complaints found.</p>
      ) : (
        <div className="table-container">
          <table className="complaint-table">
            <thead>
              <tr>
                <th>Issue Type</th>
                <th>Vehicle ID</th>
                <th>Status</th>
                <th>Date Filed</th>
                <th>Issue Description</th>
                <th>Resolution</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint) => (
                <tr key={complaint._id}>
                  <td>
                    {editedComplaint && editedComplaint._id === complaint._id ? (
                      <select
                        name="issueType"
                        value={editedComplaint.issueType}
                        onChange={handleChange}
                      >
                        <option value="vehicle">Vehicle Issue</option>
                        <option value="service">Service Issue</option>
                      </select>
                    ) : (
                      complaint.issueType
                    )}
                  </td>
                  <td>
                    {editedComplaint && editedComplaint._id === complaint._id ? (
                      editedComplaint.issueType === "service" ? null : (
                        <input
                          type="text"
                          name="vehicleID"
                          value={editedComplaint.vehicleID || ''}
                          onChange={handleChange}
                        />
                      )
                    ) : (
                      complaint.vehicleID || 'N/A'
                    )}
                  </td>
                  <td>
                    <span className={`status ${complaint.status.toLowerCase()}`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td>{new Date(complaint.dateFiled).toLocaleDateString()}</td>
                  <td>
                    {editedComplaint && editedComplaint._id === complaint._id ? (
                      <input
                        type="text"
                        name="issueDescription"
                        value={editedComplaint.issueDescription}
                        onChange={handleChange}
                      />
                    ) : (
                      complaint.issueDescription
                    )}
                  </td>
                  <td>
                    {complaint.resolutionDescription ? (
                      <span>{complaint.resolutionDescription}</span>
                    ) : (
                      <span>N/A</span>
                    )}
                  </td>
                  <td>
                    {complaint.customerID === userId && complaint.status !== 'Resolved' && (
                      <>
                        {editedComplaint && editedComplaint._id === complaint._id ? (
                          <button onClick={handleSaveEdit}>Save</button>
                        ) : (
                          <button onClick={() => handleEdit(complaint)}>
                            Edit
                          </button>
                        )}
                        <button className="delete-btn" onClick={() => handleDelete(complaint._id)}>
                          ❌ Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ComplaintList;
