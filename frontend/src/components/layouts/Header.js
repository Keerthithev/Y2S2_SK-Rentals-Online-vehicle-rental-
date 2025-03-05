// src/Header.js
import React from 'react';


const Header = () => {
    return (
        <header className="admin-header">
            <div className="logo">SK Rentals</div>
            <nav className="nav-links">
                <ul>
                    <li><a href="#dashboard">Dashboard</a></li>
                    <li><a href="#users">Users</a></li>
                    <li><a href="#settings">Settings</a></li>
                    <li><a href="#logout">Logout</a></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;