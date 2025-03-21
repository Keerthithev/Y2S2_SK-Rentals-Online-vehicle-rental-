import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "./layouts/Header";
import './profile.css'; // Import the profile styles

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

  return (
    <div className="profile-container">
      <Header />
      <h2 className="profile-header">Profile</h2>
      {error && <div>{error}</div>}
      {user ? (
        <div className="profile-details">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
          <p><strong>Address:</strong> {user.address}</p>
          <p><strong>Date of Birth:</strong> {user.dateOfBirth}</p>
          <p><strong>Driver's License:</strong> {user.driversLicense}</p>
          <div className="profile-buttons">
            <button className="logout" onClick={handleLogout}>Logout</button>
            <button className="edit" onClick={handleEditProfile}>Edit Profile</button>
          </div>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
};

export default Profile;
