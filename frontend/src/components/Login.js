import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
 //import '../login.css';  // Import your CSS here
import bgimg from '../images/bg.svg';
// import wave from '../images/wave.png'
import avatar from '../images/avatar.svg'
const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:1111/api/v1/login", formData);
      console.log("Login Response:", response.data); // Debugging: Check API response
  
      localStorage.setItem("token", response.data.token); // Save token
  
      // Check if the role exists and is 'admin'
      if (response.data.user.role && response.data.user.role.toLowerCase() === "admin") {
        console.log("Redirecting to Admin Dashboard");
        navigate("/admindashboard"); // Redirect admin
      } else {
        console.log("Redirecting to Profile Page");
        navigate("/profile"); // Redirect regular user
      }
    } catch (err) {
      console.error("Login Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Something went wrong!");
    }
  };
  

  useEffect(() => {
    // Select all input elements
    const inputs = document.querySelectorAll(".input");

    // Function to add the "focus" class when input is focused
    const addcl = (e) => {
      let parent = e.target.parentNode.parentNode;
      parent.classList.add("focus");
    };

    // Function to remove the "focus" class when input loses focus
    const remcl = (e) => {
      let parent = e.target.parentNode.parentNode;
      if (e.target.value === "") {
        parent.classList.remove("focus");
      }
    };

    // Add event listeners for focus and blur events
    inputs.forEach((input) => {
      input.addEventListener("focus", addcl);
      input.addEventListener("blur", remcl);
    });

    // Cleanup event listeners when the component unmounts
    return () => {
      inputs.forEach((input) => {
        input.removeEventListener("focus", addcl);
        input.removeEventListener("blur", remcl);
      });
    };
  }, []);

  return (
    <div className="container">
      <div className="img">
        <img src={bgimg} alt="login illustration" />
      </div>

      <div className="login-content">
        <img src={avatar} alt="logo" />
       
        {error && <div>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-div one">
            <div className="i">
              <i className="fas fa-envelope"></i>
            </div>
            <div>
              <h5>Email</h5>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
          </div>

          <div className="input-div pass">
            <div className="i">
              <i className="fas fa-lock"></i>
            </div>
            <div>
              <h5>Password</h5>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn">Login</button>

          <p>
            Don't have an account? <Link to="/register">Create Account</Link>
            <Link to="/password/forgot">Forgot password?  </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
