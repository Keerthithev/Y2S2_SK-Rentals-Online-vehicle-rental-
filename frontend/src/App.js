// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// Your custom styles


import Login from './components/Login';  // Import Login component
import Register from './components/Register';  // Import Register component
import Logout from "./components/Logout";  // Import Logout component
import ForgotPassword from "./components/ForgotPassword";  // Import ForgotPassword component
import Profile from "./components/Profile";  // Import Profile component
import UpdateProfile from "./components/updateProfile";  // Import UpdateProfile component
import EnterOtp from "./components/EnterOtp";  // Import EnterOtp component

import './Header.css'; 
import VehicleList from './components/VehicleList';

import AdminUserList from './components/admin/AdminUserList';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminAddVehicle from './components/admin/AdminAddvehicle';
import AdminVehicleList from './components/admin/AdminVehicleList';
import AdminEditVehicle from './components/admin/AdminEditVehicle';
import AdminSingleVehicle from './components/admin/AdminSingleVehicle';
import BookingVehicle from './components/bookingVehicle';
import GetAllBookings from './components/getAllBookings';

function App() {
  return (
    
    <Router>
     
      <main>
    
      </main>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/password/forgot" element={<ForgotPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/update" element={<UpdateProfile />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/EnterOtp" element={<EnterOtp />} />
       
        <Route path="/vehiclelist" element={<VehicleList />} />

        <Route path="/adminuserlist" element={<AdminUserList />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/addvehicle" element={<AdminAddVehicle />} />
        <Route path="/listvehicle" element={<AdminVehicleList />} />
        <Route path="/editvehicle/:id" element={<AdminEditVehicle />} />
        <Route path="/admin/vehicle/:id" element={<AdminSingleVehicle />} /> {/* Updated route */}
        <Route path="/allBookings" element={<GetAllBookings />} />
        <Route path="/bookingVehicle" element={<BookingVehicle />} />

      </Routes>
    </Router>
  );
}

export default App;
