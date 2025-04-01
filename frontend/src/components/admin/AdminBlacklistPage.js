import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../layouts/Header";

const AdminBlacklist = () => {
    const [blacklistedUsers, setBlacklistedUsers] = useState([]);

    useEffect(() => {
        fetchBlacklistedUsers();
    }, []);

    const fetchBlacklistedUsers = async () => {
        try {
            const response = await axios.get("http://localhost:1111/api/v1/admin/blacklist", {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            console.log("API Response:", JSON.stringify(response.data, null, 2));
            setBlacklistedUsers(response.data.blacklistedUsers);
        } catch (error) {
            console.error("Error fetching blacklisted users:", error.response?.data?.message);
        }
    };

    const getBanDates = (bannedUntil, banStartDate, banEndDate) => {
        if (!bannedUntil) {
          // Use original ban start and end date if user is unbanned
          return {
            startDate: banStartDate ? new Date(banStartDate).toLocaleDateString() : "Not banned",
            endDate: banEndDate ? new Date(banEndDate).toLocaleDateString() : "Not banned",
            status: "Not banned"
          };
        }
      
        const currentDate = new Date();
        const endDate = new Date(bannedUntil);
        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 30);  // Assuming a 30-day ban
      
        if (endDate < currentDate) {
          return {
            startDate: startDate.toLocaleDateString(),
            endDate: endDate.toLocaleDateString(),
            status: "Expired"
          };
        } else {
          const daysRemaining = Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24));
          return {
            startDate: startDate.toLocaleDateString(),
            endDate: endDate.toLocaleDateString(),
            status: `${daysRemaining} days remaining`
          };
        }
      };
      
      const getBanReason = (banReason, bannedUntil, unbanReason) => {
        const currentDate = new Date();
        const banEndDate = new Date(bannedUntil);
      
        if (bannedUntil && banEndDate > currentDate) {
          return `Banned. Reason: ${banReason || "No reason provided"}`;
        }
      
        if (bannedUntil && banEndDate < currentDate) {
          return `Ban expired. Reason: ${banReason || "Ban expired"}`;
        }
      
        if (!bannedUntil && unbanReason) {
          return `Unbanned. Reason: ${unbanReason || "No reason provided"}`;
        }
      
        return "No ban/unban reason available";
      };
      

    return (
        <div className="blacklist-container">
            <Header />
            <h1>Blacklisted Customers</h1>
            <table>
                <thead>
                    <tr>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Phone Number</th>
                        <th>Address</th>
                        <th>Date of Birth</th>
                        <th>Ban Start Date</th>
                        <th>Ban End Date</th>
                        <th>Ban Status</th>
                        <th>Ban/Unban Reason</th>
                    </tr>
                </thead>
                <tbody>
                    {blacklistedUsers.map((user) => {
                        const { startDate, endDate, status } = getBanDates(user.bannedUntil);
                        return (
                            <tr key={user._id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.phone}</td>
                                <td>{user.address}</td>
                                <td>{new Date(user.dateOfBirth).toLocaleDateString()}</td>
                                <td>{startDate}</td>
                                <td>{endDate}</td>
                                <td>{status}</td>
                                <td>{getBanReason(user.banReason, user.bannedUntil, user.unbanReason)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default AdminBlacklist;
