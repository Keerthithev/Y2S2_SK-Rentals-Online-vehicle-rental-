// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';  // Your custom styles

import Login from './components/Login';  // Import Login component
import Register from './components/Register';  // Import Register component
import Logout from "./components/Logout";  // Import Logout component
import ForgotPassword from "./components/ForgotPassword";  // Import ForgotPassword component
import Profile from "./components/Profile";  // Import Profile component
import UpdateProfile from "./components/updateProfile";  // Import UpdateProfile component
import EnterOtp from "./components/EnterOtp";  // Import EnterOtp component
import Header from './components/layouts/Header';
import './Header.css'; 
import VehicleList from './components/VehicleList';
import VehicleForm from './components/VehicleForm';


function App() {
  return (
    
    <Router>
      <Header/>
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
        <Route path="/add-vehicle" element={<VehicleForm />} />
      </Routes>
    </Router>
  );
}

export default App;
