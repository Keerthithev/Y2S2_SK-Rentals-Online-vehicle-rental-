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
          <button onClick={handleEditProfile}>Edit Profile</button> {/* Edit Button */}
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
};

export default Profile;
