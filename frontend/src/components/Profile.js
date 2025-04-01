import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:1111/api/v1/myprofile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.user);
      } catch (err) {
        setError(err.response?.data?.message || "Something went wrong!");
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleEditProfile = () => {
    navigate("/update");
  };

  const handleRaiseComplaint = () => {
    navigate("/complaintform");
  };

  const handleViewComplaints = () => {
    navigate("/complaintlist"); // Navigate to the complaint list page
  };

  const handleViewAllComplaints = () => {
    navigate("/allcomplaints"); // Navigate to the all complaints page (for staff)
  };

  const handleAdminDashboard = () => {
    navigate("/admin-dashboard"); // Navigate to the admin dashboard if the user is an admin
  };

  return (
    <div>
      <h2>Profile</h2>
      {error && <div>{error}</div>}
      {user ? (
        <div>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <p><strong>Address:</strong> {user.address}</p>
          <p><strong>Date of Birth:</strong> {user.dateOfBirth}</p>
          <p><strong>Driver's License:</strong> {user.driversLicense}</p>
          <button onClick={handleLogout}>Logout</button>
          <button onClick={handleEditProfile}>Edit Profile</button>

          {/* Conditionally render buttons based on user role */}
          {user.role === "user" ? (
            <>
              <button onClick={handleRaiseComplaint}>Raise Complaint</button>
              <button onClick={handleViewComplaints}>My Complaints</button>
            </>
          ) : user.role === "admin" ? (
            <button onClick={handleAdminDashboard}>Admin Dashboard</button> // Button for admin users
          ) : (
            <button onClick={handleViewAllComplaints}>All Complaints</button> // Navigate to all complaints page for staff
          )}
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
};

export default Profile;
