import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import '../login.css';  // Import your CSS here
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
      const response = await axios.post("http://localhost:1111/api/v1/login", formData)

      if (
        response.data.success === false ||
        response.data.message === "Your account is banned for 30 days temporary. Please contact support."
      ) {
        setError("Your account is banned for 30 days temporary. Please contact support.")
        setLoading(false)
        return
      }

      localStorage.setItem("token", response.data.token)
      localStorage.setItem("username", response.data.user.name)
      localStorage.setItem("email", response.data.user.email)

      // Redirect based on user role
const role = response.data.user.role?.toLowerCase();

if (role === "admin") {
  navigate("/admindashboard");
} else if (role === "user") {
  navigate("/uservehiclelist");
} else if (role === "staff") {
  navigate("/staff");
} else {
  // Optional: if role is unknown, navigate to a default page
  navigate("/profile");
}

    } catch (err) {
      setError(err.response.data.message || "Something went wrong!");
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
