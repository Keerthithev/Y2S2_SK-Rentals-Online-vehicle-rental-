import React from "react";
import './AdminDashboard.css';
import Header from "../layouts/Header";
const AdminDashboard = () => {
    return (
       
            <div className="main-content"><Header/>
                <div id="overview" className="section">
                    <h2>Dashboard Overview</h2>
                    <p>Summary of SK Rentals performance.</p>
                </div>

                <div id="users" className="section">
                    <h2>Manage Users</h2>
                    <p>List of registered users, admins, and renters.</p>
                </div>

                <div id="bookings" className="section">
                    <h2>Bookings</h2>
                    <p>Track all rental bookings and approvals.</p>
                </div>

                <div id="settings" className="section">
                    <h2>Settings</h2>
                    <p>Manage website configurations and preferences.</p>
                </div>
            </div>
        
    );
};

export default AdminDashboard;
