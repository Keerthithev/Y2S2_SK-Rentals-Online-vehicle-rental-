import { useState, useEffect } from "react";
import axios from "axios";
import "./VehicleListMain.css";

function VehicleListMain() {
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [reminders, setReminders] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

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

  // Enable edit mode
  const handleEdit = (vehicle) => {
    setEditingId(vehicle._id);
    setEditData({ ...vehicle });
  };

  // Handle input change in edit mode
  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  // Save edited data
  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:1111/api/v1/maintenances/edit/${editingId}`, editData);
      setVehicles(vehicles.map(v => v._id === editingId ? editData : v));
      setEditingId(null); // Exit edit mode
    } catch (error) {
      console.error("Error updating record:", error);
    }
  };

  return (
    <div className="container">
      {reminders.length > 0 && (
        <div className="notification-box">
          <h3>🔔 Maintenance Reminders</h3>
          <ul>
            {reminders.map((r) => (
              <li key={r._id}>
                ID {r.vehicleId} vehicle is due for {r.type} maintenance on {new Date(r.date).toLocaleDateString()}.
                <button className="close-btn" onClick={() => handleDelete(r._id)}>Done</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="top-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by Vehicle ID, Date or Type"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="add-btn-container">
          <button className="add-btn">Add Maintenance</button>
        </div>
      </div>

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
              v.vehicleId.includes(search) ||
              v.type.toLowerCase().includes(search.toLowerCase()) ||
              new Date(v.date).toLocaleDateString().includes(search)
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
                    <td>${v.cost}</td>
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
