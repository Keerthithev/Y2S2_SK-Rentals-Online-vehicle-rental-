// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes , Navigate } from 'react-router-dom';
// Your custom styles


import Login from './components/Login';  // Import Login component
import Register from './components/Register';  // Import Register component
import Logout from "./components/Logout";  // Import Logout component
import ForgotPassword from "./components/ForgotPassword";  // Import ForgotPassword component
import Profile from "./components/Profile";  // Import Profile component
import UpdateProfile from "./components/updateProfile";  // Import UpdateProfile component
import EnterOtp from "./components/EnterOtp";  // Import EnterOtp component
import Header from './components/layouts/Header';
import AboutPage from "./components/user/AboutPage";
import ContactPage from "./components/user/ContactPage";
import MyBookings from './components/MyBookings';


import VehicleForm from './components/VehicleForm';
// import VehicleListMain from "./components/VehicleListMain";
// import AddMaintenance from "./components/AddMaintenance";
import ReminderPage from "./components/ReminderPage";






import UserVehicleList from './components/user/UserVehicleList';
import UserSingleVehicleList from './components/user/UserSinglevehicleList';
import VehicleFilter from './components/user/VehicleFilter';
import VehicleListMain from './components/VehicleListMain.js';
import AddMaintenance from './components/AddMaintenance.js';
import StaffDashboard from './components/StaffDashboard.js';

import Hedaer from "./components/layouts/Header.js";

import Bookings from './components/user/Bookings'; 

import Top from './components/layouts/Top';
import VehicleList from './components/VehicleList';




import AdminUserList from './components/admin/AdminUserList';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminAddVehicle from './components/admin/AdminAddvehicle';
import AdminVehicleList from './components/admin/AdminVehicleList';
import AdminEditVehicle from './components/admin/AdminEditVehicle';
import AdminSingleVehicle from './components/admin/AdminSingleVehicle';
import AdminBlacklistPage from './components/admin/AdminBlacklistPage'




import FeedbackForm from './components/FeedbackForm';
import FeedbackList from './components/FeedbackList';
import ComplaintForm from './components/ComplaintForm';
import ComplaintList from './components/ComplaintList';
//import ComplaintDetails from './components/ComplaintDetails'; 
import AllComplaints from './components/AllComplaints';
import BookingVehicle from './components/bookingVehicle';
import GetAllBookings from './components/getAllBookings';


import Home from './components/user/Home.js';
function App() {
  return (
    
    <Router>
      
     
      <main>
        
    
    
      </main>
      <Routes>

      <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/password/forgot" element={<ForgotPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/update" element={<UpdateProfile />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/EnterOtp" element={<EnterOtp />} />
       
        <Route path="/vehiclelist" element={<VehicleList />} />
        <Route path="/bookings" element={<Bookings />} />  {/* Bookings page route */}
        <Route path="/mybookings" element={<MyBookings />} />

        <Route path="/adminuserlist" element={<AdminUserList />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/addvehicle" element={<AdminAddVehicle />} />
        <Route path="/listvehicle" element={<AdminVehicleList />} />
        <Route path="/editvehicle/:id" element={<AdminEditVehicle />} />
        <Route path="/admin/vehicle/:id" element={<AdminSingleVehicle />} /> {/* Updated route */}

        <Route path="/adminblacklist" element={<AdminBlacklistPage />} /> {/* Updated route */}


        <Route path="/uservehiclelist" element={<UserVehicleList />} />
        <Route path="/vehicle/:id" element={<UserSingleVehicleList />} />
        <Route path="/vehiclefilter" element={<VehicleFilter />} />

        <Route path="/list" element={<VehicleListMain />} />
        <Route path="/add" element={<AddMaintenance />} />
        <Route path="/staff" element={<StaffDashboard/>} />
        <Route path="/list" element={<VehicleListMain />} />
        <Route path="/reminder" element={<ReminderPage />} /> {/* ✅ Add this line */}


        <Route path="/feedbackform" element={<FeedbackForm />} />
        
        <Route path="/feedbacklist" element={<FeedbackList />} />
        <Route path="/complaintform" element={<ComplaintForm />} />
        <Route path="/complaintlist/:customerID" element={<ComplaintList />} />
        <Route path="/complaintlist" element={<ComplaintList />} />
       
        
         <Route path="/allcomplaints" element={<AllComplaints />} />
         <Route path="/bookingVehicle/:id" element={<BookingVehicle />} />
        <Route path="/allBookings" element={<GetAllBookings />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contactus" element={<ContactPage />} />

      </Routes>
    </Router>
  );
}

export default App;