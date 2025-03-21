import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import './AdminVehicleList.css';  // Adjust the path if necessary
import Header from '../layouts/Header';

const AdminVehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);  // New state for filtered vehicles
  const [searchTerm, setSearchTerm] = useState('');  // New state for the search term
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Define fetchVehicles function outside useEffect to be accessible everywhere in the component
  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authorization token is missing');
      }

      const decodedToken = jwtDecode(token);
      const adminId = decodedToken.id;
      if (!adminId) {
        throw new Error('Admin ID not found in token');
      }

      // Fetch vehicles for the admin
      const response = await axios.get('http://localhost:1111/api/v1/admin/vehicles', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      console.log(response.data); // Log API response to check what is returned
      if (response.data.success && response.data.vehicles && response.data.vehicles.length > 0) {
        setVehicles(response.data.vehicles);
        setFilteredVehicles(response.data.vehicles);  // Initialize filteredVehicles
      } else {
        setError('No vehicles found.');
      }
    } catch (err) {
      setError('Failed to fetch vehicles. Please try again.');
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  // Call fetchVehicles when the component is mounted
  useEffect(() => {
    fetchVehicles();
  }, []);

  // Delete vehicle function
  const deleteVehicle = async (id) => {
    try {
      const confirmDelete = window.confirm('Are you sure you want to delete this vehicle?');
      if (confirmDelete) {
        await axios.delete(`http://localhost:1111/api/v1/admin/vehicle/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        alert('Vehicle deleted successfully');
        fetchVehicles();  // Re-fetch the list of vehicles after deletion
      }
    } catch (err) {
      setError('Failed to delete vehicle');
    }
  };

  // Handle the search input change
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  
    // Filter vehicles based on search term
    if (event.target.value === '') {
      setFilteredVehicles(vehicles);  // If search term is empty, show all vehicles
    } else {
      const filtered = vehicles.filter(vehicle => 
        (vehicle.name?.toLowerCase().includes(event.target.value.toLowerCase()) || 
        vehicle.brand?.toLowerCase().includes(event.target.value.toLowerCase()) ||
        vehicle.model?.toLowerCase().includes(event.target.value.toLowerCase()) ||
        vehicle.year?.toString().includes(event.target.value) || // Allow filtering by year
        vehicle.licensePlateNumber?.toLowerCase().includes(event.target.value.toLowerCase()) || // License Plate
        vehicle.vehicleType?.toLowerCase().includes(event.target.value.toLowerCase())) // Vehicle Type
      );
      setFilteredVehicles(filtered); // Update filtered vehicles
    }
  };
  
  return (
    <div className="admin-vehicle-list-container"> 
      <Header />
      <h1>AVAILABLE VEHICLES</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by name, brand, model, year, license plate, or vehicle type"
        value={searchTerm}
        onChange={handleSearch}
        className="search-bar"
      />

      <button onClick={() => navigate('/addvehicle')}>
        <i className="fa fa-plus"></i> Add Vehicle
      </button>

      {error && <p className="error-message">{error}</p>}
      {loading ? (
        <p>Loading vehicles...</p>
      ) : (
        <table className="vehicle-table">
          <thead>
            <tr>
              <th>Name</th>
             
              <th>Model</th>
              <th>Year</th>
              <th>Fuel Type</th>
              <th>Transmission</th>
              <th>Seats</th>
             
              <th>License Plate</th>
              <th>Vehicle Type</th>
              
              <th>Tuned</th>
            
              <th>Available Status</th>
              <th>Images</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map((vehicle) => (
              <tr key={vehicle._id}>
                <td>{vehicle.name}</td>
               
                <td>{vehicle.model}</td>
                <td>{vehicle.year}</td>
                <td>{vehicle.fuelType}</td>
                <td>{vehicle.transmission}</td>
                <td>{vehicle.seatingCapacity}</td>
               
                <td>{vehicle.licensePlateNumber}</td>
                <td>{vehicle.vehicleType}</td>
               
                <td>{vehicle.isTuned ? 'Yes' : 'No'}</td>
                
                <td>{vehicle.availableStatus ? 'Available' : 'Not Available'}</td>
                <td>
                  {vehicle.images && vehicle.images.length > 0 ? (
                    vehicle.images.map((image, index) => (
                      <img
                        key={index}
                        src={image.url}  // Access the 'url' property of each image object
                        alt={`${vehicle.name}-image-${index}`}
                        style={{ width: '100px', height: '100px', marginRight: '5px' }}
                      />
                    ))
                  ) : (
                    'No Images Available'
                  )}
                </td>

                <td>
                  <button onClick={() => {
                    if (vehicle._id) {
                      navigate(`/admin/vehicle/${vehicle._id}`);
                    } else {
                      console.error("Vehicle ID is undefined");
                    }
                  }}>
                    View Details
                  </button>
                  <button onClick={() => deleteVehicle(vehicle._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminVehicleList;
