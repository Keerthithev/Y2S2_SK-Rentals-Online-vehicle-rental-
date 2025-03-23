import React, { useEffect, useState } from "react";
import axios from "axios";

import Header from "../layouts/Header";


const AdminUserList = () => {
    const [users, setUsers] = useState([]);

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
            console.log("Fetched Users:", response.data);
            setUsers(response.data.users);
        } catch (error) {
            console.error("Error fetching users:", error.response?.data?.message);
        }
    };

    const deleteUser = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await axios.delete(`http://localhost:1111/api/v1/admin/user/${id}`, {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setUsers(users.filter(user => user._id !== id));
            } catch (error) {
                console.error("Error deleting user:", error.response?.data?.message);
            }
        }
    };

    return (
        
        <div className="user-list-container"><Header/>
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
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.phone}</td>
                            <td>{user.address}</td>
                            <td>{new Date(user.dateOfBirth).toLocaleDateString()}</td> {/* Format the date */}
                            <td>{user.driversLicense}</td>
                            <td>
                               
                                <button onClick={() => deleteUser(user._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminUserList;
