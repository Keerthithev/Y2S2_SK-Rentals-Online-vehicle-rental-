import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './AllComplaints.css';

const AllComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replies, setReplies] = useState({}); // State to manage replies for each complaint
  const [statusUpdate, setStatusUpdate] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const navigate = useNavigate();

  // Fetch complaints from the backend
  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found.');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('http://localhost:1111/api/v1/complaints/all', { headers });
      setComplaints(response.data);
    } catch (error) {
      setError('Error fetching complaints');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (complaintID) => {
    const reply = replies[complaintID];
    if (!reply?.trim()) {
      setError('Please enter a reply before submitting.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.put(
        `http://localhost:1111/api/v1/complaints/reply/${complaintID}`,
        { reply },
        { headers }
      );

      if (response.status === 200) {
        setStatusUpdate(response.data.message);
        fetchComplaints(); // Re-fetch complaints after updating the status
        setReplies({ ...replies, [complaintID]: "" }); // Clear the reply input for that complaint
      } else {
        console.error('Failed to submit reply', response);
        setError('Failed to submit reply. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting the reply', error.response || error.message);
      setError('Error submitting the reply. Please try again.');
    }
  };

  const handleReplyChange = (complaintID, value) => {
    setReplies({ ...replies, [complaintID]: value });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(complaints.map(complaint => ({
      'Complaint ID': complaint._id,
      'Customer Name': complaint.customerID?.name || 'N/A',
      'Customer Email': complaint.customerID?.email || 'N/A',
      'Customer Phone': complaint.customerID?.phone || 'N/A',
      'Issue Type': complaint.issueType,
      'Vehicle ID': complaint.vehicleID || 'N/A',
      'Description': complaint.issueDescription,
      'Status': complaint.status,
      'Date Filed': new Date(complaint.dateFiled).toLocaleDateString(),
      'Resolution': complaint.resolutionDescription || 'N/A'
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Complaints Report');
    XLSX.writeFile(workbook, 'Complaints_Report.xlsx');
  };

  // Filter complaints based on the search query
  const filteredComplaints = complaints.filter((complaint) =>
    complaint.customerID?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h2 className="complaints-heading">All Complaints</h2>
      <button onClick={handleLogout} className="logout-button">Logout</button>
      <button onClick={exportToExcel} className="export-button">Export to Excel</button>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by Customer Name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {loading && <p className="loading-message">Loading complaints...</p>}
      {error && <p className="error-message">{error}</p>}
      {statusUpdate && <p className="status-update">{statusUpdate}</p>} 

      {!loading && filteredComplaints.length === 0 && <p className="no-complaints">No complaints found.</p>}

      {!loading && filteredComplaints.length > 0 && (
        <table className="complaints-table">
          <thead>
            <tr>
              <th>Complaint ID</th>
              <th>Customer Name</th>
              <th>Customer Email</th>
              <th>Customer Phone</th>
              <th>Issue Type</th>
              <th>Vehicle ID</th>
              <th>Description</th>
              <th>Status</th>
              <th>Date Filed</th>
              <th>Resolution</th>
              <th>Reply</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.map((complaint) => (
              <tr key={complaint._id}>
                <td>{complaint._id}</td>
                <td>{complaint.customerID?.name || 'N/A'}</td>
                <td>{complaint.customerID?.email || 'N/A'}</td>
                <td>{complaint.customerID?.phone || 'N/A'}</td>
                <td>{complaint.issueType}</td>
                <td>{complaint.vehicleID || 'N/A'}</td>
                <td>{complaint.issueDescription}</td>
                <td>{complaint.status}</td>
                <td>{new Date(complaint.dateFiled).toLocaleDateString()}</td>
                <td>{complaint.resolutionDescription || 'N/A'}</td>
                <td>
                  {complaint.status !== 'Resolved' && (
                    <div className="reply-section">
                      <textarea
                        value={replies[complaint._id] || ""}
                        onChange={(e) => handleReplyChange(complaint._id, e.target.value)}
                        placeholder="Enter your reply..."
                        className="reply-input"
                      />
                      <button onClick={() => handleReply(complaint._id)} className="reply-button">Submit Reply</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AllComplaints;
