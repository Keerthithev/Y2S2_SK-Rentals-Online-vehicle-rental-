import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../layouts/Header";
import "./AdminUserList.css";

const AdminUserList = () => {
    const [users, setUsers] = useState([]);
    const [email, setEmail] = useState("");  // State to store the email for staff invitation
    const [invitationMessage, setInvitationMessage] = useState(""); // Message for status

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get("http://localhost:1111/api/v1/admin/users", {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setUsers(response.data.users);
        } catch (error) {
            console.error("Error fetching users:", error.response?.data?.message);
        }
    };

    const toggleBan = async (id, isCurrentlyBanned) => {
        const message = isCurrentlyBanned
            ? "Are you sure you want to unban this user?"
            : "Are you sure you want to ban this user for 30 days?";

        const shouldProceed = window.confirm(message);

        if (shouldProceed) {
            if (!isCurrentlyBanned) {
                const reasonInput = prompt("Please provide a reason for banning this user:");
                if (reasonInput) {
                    try {
                        await axios.put(
                            `http://localhost:1111/api/v1/admin/user/ban/${id}`,
                            { 
                                isBanned: true, 
                                reason: reasonInput 
                            },
                            {
                                withCredentials: true,
                                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                            }
                        );
                        setUsers(users.map(user => 
                            user._id === id
                                ? { ...user, bannedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
                                : user
                        ));
                    } catch (error) {
                        console.error("Error toggling ban:", error.response?.data?.message);
                    }
                } else {
                    alert("Please provide a reason for the action.");
                }
            } else {
                try {
                    await axios.put(
                        `http://localhost:1111/api/v1/admin/user/ban/${id}`,
                        { isBanned: false },
                        {
                            withCredentials: true,
                            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                        }
                    );
                    setUsers(users.map(user => 
                        user._id === id ? { ...user, bannedUntil: null } : user
                    ));
                } catch (error) {
                    console.error("Error unbanning user:", error.response?.data?.message);
                }
            }
        }
    };

    const handleStaffInvite = async () => {
        try {
            const response = await axios.post(
                "http://localhost:1111/api/v1/admin/staff/invite",
                { email },
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );
            setInvitationMessage(response.data.message); // Display success message
            setEmail(""); // Clear email input field
        } catch (error) {
            setInvitationMessage(error.response?.data?.message || "Error sending invitation.");
        }
    };

    // Filter users based on role
    const customers = users.filter(user => user.role === "user");
    const staff = users.filter(user => user.role === "staff");

    return (
        <div className="user-list-container">
            <Header />

           

            {/* Customer Details */}
            <h1>Customer Details</h1>
            <table>
                <thead>
                    <tr>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Phone Number</th>
                        <th>Address</th>
                        <th>Date of Birth</th>
                        <th>Driver's License</th>
                        <th>Ban Status</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map((user) => (
                        <tr key={user._id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.phone}</td>
                            <td>{user.address}</td>
                            <td>{new Date(user.dateOfBirth).toLocaleDateString()}</td>
                            <td>{user.driversLicense}</td>
                            <td>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={!!user.bannedUntil && new Date(user.bannedUntil) > new Date()}
                                        onChange={() => toggleBan(user._id, !!user.bannedUntil && new Date(user.bannedUntil) > new Date())}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            
              
            {/* Staff Details */}
         <br></br>        
         <br></br>       
         <br></br>
            <h1>Staff Details</h1>
               {/* Staff Invitation Form */}
               <div className="staff-invite">
                               
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter staff email"
                                />
                                <button onClick={handleStaffInvite}>Invite Staff</button>
                                {invitationMessage && <p>{invitationMessage}</p>}
                            </div>
            <table>
                <thead>
                    <tr>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Phone Number</th>
                        <th>Department</th>
                        <th>Role</th>
                        <th>Ban Status</th>
                    </tr>
                </thead>
                <tbody>
                    {staff.map((user) => (
                        <tr key={user._id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.phone}</td>
                            <td>{user.department || "N/A"}</td>
                            <td>{user.role}</td>
                            <td>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={!!user.bannedUntil && new Date(user.bannedUntil) > new Date()}
                                        onChange={() => toggleBan(user._id, !!user.bannedUntil && new Date(user.bannedUntil) > new Date())}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </td>
                        </tr>
                    ))}
                </tbody>
                </table>
                         

        </div>
    );
};

export default AdminUserList;
