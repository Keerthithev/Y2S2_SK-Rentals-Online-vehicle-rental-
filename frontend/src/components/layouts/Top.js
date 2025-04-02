import React from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate hook
import './Top.css';

const Top = () => {
    const navigate = useNavigate();  // Initialize the navigate function

    const handleLogout = () => {
        // Here you can perform any logout logic if needed (like clearing localStorage, etc.)
        
        // After that, navigate to the login page
        navigate('/login');
    };

    const goToBookings = () => {
        // Navigate to the bookings page
        navigate('/bookings');
    };

    const goToUserVehicleList = () => {
        // Navigate to the user vehicle list page
        navigate('/UserVehicleList');
    };

    return (
        <header className="admin-header1">
            <div className="logo1">SK Rentals</div>
            <nav className="nav-links1">
                <ul>
                    <li><a id="a_img" href="#dashboard" onClick={goToUserVehicleList}>Dashboard</a></li>
                    <li><a id="a_img" href="#myBookings" onClick={goToBookings}>My Bookings</a></li>
                    <li><a id="a_img" href="#settings">Settings</a></li>
                    <li>
                        {/* Call the handleLogout function when logout is clicked */}
                        <a id="a_img" href="#logout" onClick={handleLogout}>Logout</a>
                    </li>
                    <li>
                        <a href="/login">
                            <img id="logim" src="/image/th.jpg" alt="Login" className="nav-image" />
                        </a>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Top;
