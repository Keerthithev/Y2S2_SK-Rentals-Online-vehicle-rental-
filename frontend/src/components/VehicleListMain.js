import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./VehicleListMain.css";
import * as XLSX from "xlsx"; // Import the xlsx library

function VehicleListMain() {
  const [vehicles, setVehicles] = useState([]);
  const [searchVehicleId, setSearchVehicleId] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchType, setSearchType] = useState("");
  const [reminders, setReminders] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    axios.get("http://localhost:1111/api/v1/maintenances")
      .then((response) => {
        setVehicles(response.data);
        checkReminders(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const checkReminders = (records) => {
    const today = new Date();
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(today.getDate() - 10);

    const overdue = records.filter(record => new Date(record.date) < tenDaysAgo);
    setReminders(overdue);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await axios.delete(`http://localhost:1111/api/v1/maintenances/delete/${id}`);
        setVehicles(vehicles.filter((vehicle) => vehicle._id !== id));
        checkReminders(vehicles.filter((vehicle) => vehicle._id !== id));
      } catch (error) {
        console.error("Error deleting record:", error);
      }
    }
  };

  const handleEdit = (vehicle) => {
    setEditingId(vehicle._id);
    setEditData({ ...vehicle });
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:1111/api/v1/maintenances/edit/${editingId}`, editData);
      setVehicles(vehicles.map(v => v._id === editingId ? editData : v));
      setEditingId(null);
    } catch (error) {
      console.error("Error updating record:", error);
    }
  };

  const handleReminderPageNavigate = () => {
    navigate("/reminder", { state: { reminders } });
  };

  const handleLogout = () => {
    alert("You have been logged out.");
    navigate("/login");
  };

  // Generate Report Function
  const generateReport = () => {
    const ws = XLSX.utils.json_to_sheet(vehicles); // Convert vehicles data to a worksheet
    const wb = XLSX.utils.book_new(); // Create a new workbook
    XLSX.utils.book_append_sheet(wb, ws, "Vehicle Maintenance"); // Append the sheet to the workbook
    XLSX.writeFile(wb, "VehicleMaintenanceReport.xlsx"); // Write the file to the user's machine
  };

  return (
    <div className="container">
      <header className="header">
        <div className="logo">Vehicle Maintenance</div>
        <nav className="navbar">
          <ul>
            <li onClick={() => navigate("/add")} className={location.pathname === "/add" ? "active" : ""}>Add Maintenance</li>
            <li onClick={() => navigate("/list")} className={location.pathname === "/list" ? "active" : ""}>Maintenance List</li>
            <li onClick={handleReminderPageNavigate} className={location.pathname === "/reminder" ? "active" : ""}>Reminder Page</li>
        <li onClick={generateReport} className="generate-report-btn">Generate Report</li>
      
            <li className="logout-btn" onClick={handleLogout}>Logout</li>
          </ul>
        </nav>
      </header>

      {/* Search Section */}
      <div className="top-section">
        <div className="search-container">
          <input type="text" placeholder="Search by Vehicle ID" value={searchVehicleId} onChange={(e) => setSearchVehicleId(e.target.value)} />
          <input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} />
          <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
            <option value="">All Types</option>
            <option value="Oil Change">Oil Change</option>
            <option value="Tire Replacement">Tire Replacement</option>
            <option value="Brake Service">Brake Service</option>
            <option value="Battery Replacement">Battery Replacement</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      

      {/* Table Section */}
      <table className="vehicle-table">
        <thead>
          <tr>
            <th>Vehicle ID</th>
            <th>Date</th>
            <th>Type</th>
            <th>Description</th>
            <th>Cost</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicles
            .filter((v) =>
              (searchVehicleId === "" || v.vehicleId.includes(searchVehicleId)) &&
              (searchDate === "" || v.date.split("T")[0] === searchDate) &&
              (searchType === "" || v.type === searchType)
            )
            .map((v) => (
              <tr key={v._id}>
                {editingId === v._id ? (
                  <>
                    <td><input type="text" name="vehicleId" value={editData.vehicleId} onChange={handleChange} /></td>
                    <td><input type="date" name="date" value={editData.date.split("T")[0]} onChange={handleChange} /></td>
                    <td><input type="text" name="type" value={editData.type} onChange={handleChange} /></td>
                    <td><input type="text" name="description" value={editData.description} onChange={handleChange} /></td>
                    <td><input type="number" name="cost" value={editData.cost} onChange={handleChange} /></td>
                    <td>
                      <button className="save-btn" onClick={handleSave}>Save</button>
                      <button className="cancel-btn" onClick={() => setEditingId(null)}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{v.vehicleId}</td>
                    <td>{new Date(v.date).toLocaleDateString()}</td>
                    <td>{v.type}</td>
                    <td>{v.description}</td>
                    <td>Rs.{v.cost}</td>
                    <td>
                      <button className="edit-btn" onClick={() => handleEdit(v)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDelete(v._id)}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default VehicleListMain;
