import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "./AddMaintenance.css";


function ReminderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [reminders, setReminders] = useState(location.state?.reminders || []);

  useEffect(() => {
    if (!reminders.length) {
      fetchReminders();
    }
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await axios.get("http://localhost:1111/api/v1/maintenances/reminders");
      setReminders(response.data);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    }
  };

  // const handleMarkAsDone = async (id) => {
  //   try {
  //     const response = await fetch(`http://localhost:1111/api/v1/maintenances/done/${id}`, {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ status: "Done" }),
  //     });
  
  //     if (response.ok) {
  //       setReminders(reminders.filter((r) => r._id !== id));
  //       alert("Maintenance status updated to Done.");
  //     } else {
  //       alert("Failed to update maintenance status.");
  //     }
  //   } catch (error) {
  //     console.error("Error updating status:", error);
  //     alert("Something went wrong.");
  //   }
  // };

  const handleLogout = () => {
    // Perform logout logic here (e.g., clear session, token, etc.)
    alert("Logged out successfully.");
    // Redirect to login page
    navigate("/login"); // Adjust the login page route if needed
  };

  return (
    <div className="container">
      <header className="header">
        <div className="logo">Vehicle Maintenance</div>
        <nav className="navbar">
          <ul>
            <li onClick={() => navigate("/add")} className={location.pathname === "/add" ? "active" : ""}>Add Maintenance</li>
            <li onClick={() => navigate("/list")} className={location.pathname === "/list" ? "active" : ""}>Maintenance List</li>
            <li className="active">Reminder Page</li>
          </ul>
          {/* Logout Button */}
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </header>

      {reminders.length > 0 && (
        <div className="notification-box">
          <ul>
            {reminders.map((r) => (
              <li key={r._id} className="reminder-item">
                ID {r.vehicleId} vehicle's last {r.type} maintenance was on {new Date(r.date).toLocaleDateString()}.
            
               {/* <button className="close-btn" onClick={() => handleMarkAsDone(r._id)}>Done</button> */}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ReminderPage;
