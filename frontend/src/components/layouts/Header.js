import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../Header.css';

const Header = () => {
    const [visible, setVisible] = useState(false);

    return (
        <div 
            className={`sidebar ${visible ? 'visible' : 'hidden'}`} 
            onMouseEnter={() => setVisible(true)} 
            onMouseLeave={() => setVisible(false)}
        >
<h2><i className="fas fa-car-side"></i> SK Rentals</h2>
<ul>
    <li>
        <Link to="/admindashboard">
            <div className="icon-container">
                <i className="fas fa-tachometer-alt"></i>
            </div>
            <span className="text">Dashboard</span>
        </Link>
    </li>
    <li>
        <Link to="/adminuserlist">
            <div className="icon-container">
                <i className="fas fa-users"></i>
            </div>
            <span className="text">Users</span>
        </Link>
    </li>
    <li>
        <Link to="/listvehicle">
            <div className="icon-container">
                <i className="fas fa-car"></i>
            </div>
            <span className="text">Vehicles</span>
        </Link>
    </li>
    <li>
        <Link to="/profile">
            <div className="icon-container">
                <i className="fas fa-user"></i>
            </div>
            <span className="text">My Profile</span>
        </Link>
    </li>

    {/* New Sections */}
    <li>
        <Link to="/bookinghistory">
            <div className="icon-container">
                <i className="fas fa-history"></i>
            </div>
            <span className="text">Booking History</span>
        </Link>
    </li>
    <li>
        <Link to="/staffactivities">
            <div className="icon-container">
                <i className="fas fa-tasks"></i>
            </div>
            <span className="text">Staff Activities</span>
        </Link>
    </li>
    <li>
        <Link to="/adminblacklist">
            <div className="icon-container">
                <i className="fas fa-ban"></i>
            </div>
            <span className="text">Blacklist</span>
        </Link>
    </li>
    <li>
        <Link to="/reports">
            <div className="icon-container">
                <i className="fas fa-chart-line"></i>
            </div>
            <span className="text">Reports</span>
        </Link>
    </li>
    <li>
        <Link to="/revenue">
            <div className="icon-container">
                <i className="fas fa-dollar-sign"></i>
            </div>
            <span className="text">Revenue</span>
        </Link>
    </li>
    <li>
        <Link to="/messages">
            <div className="icon-container">
                <i className="fas fa-envelope"></i>
            </div>
            <span className="text">Messages</span>
        </Link>
    </li>

    <li className="logout">
        <Link to="/logout">
            <div className="icon-container">
                <i className="fas fa-sign-out-alt"></i>
            </div>
            <span className="text">Logout</span>
        </Link>
    </li>
</ul>







        </div>
    );
};

export default Header;
