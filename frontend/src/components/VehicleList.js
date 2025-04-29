import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const VehicleList = () => {
  
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [vehiclesPerPage] = useState(2);
    const navigate = useNavigate();
  // Fetch vehicles function
  const fetchVehicles = async (page) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:1111/api/v1/admin/vehicles?page=${page}`);
      console.log(response.data); // Debugging

      if (response.data.success) {
        setVehicles(response.data.vehicles);
        setTotalCount(response.data.count); // Ensure count is set
      } else {
        setError('No vehicles found for the requested page.');
      }
    } catch (err) {
      setError('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  // UseEffect to fetch vehicles when component mounts or currentPage changes
  useEffect(() => {
    fetchVehicles(currentPage);
  }, [currentPage]);

  const totalPages = Math.ceil(totalCount / vehiclesPerPage);

  // Handle page change
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return; // Prevent invalid page changes
    setCurrentPage(page);
  };

  return ( 
    <div>
      <h1>Vehicles List</h1>
      {loading && <p>Loading vehicles...</p>}
      {error && <p>{error}</p>}
      <button onClick={() => navigate('/add-vehicle')} className="add-vehicle-btn">Add Vehicle</button>
      <div>
      
        <table>
          <thead>
            <tr>
              <th>Make</th>
              <th>Model</th>
              <th>Year</th>
              <th>Price per Day</th>
              <th>Type</th>
              <th>Status</th>
              <th>Location</th>
              <th>Fuel Type</th>
              <th>Transmission</th>
              <th>Seating Capacity</th>
              <th>Mileage</th>
              <th>Last Service Date</th>
              <th>Insurance Expiry</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(vehicle => (
              <tr key={vehicle._id}>
                <td>{vehicle.make}</td>
                <td>{vehicle.model}</td>
                <td>{vehicle.year}</td>
                <td>{vehicle.rental_price_per_day}</td>
                <td>{vehicle.type}</td>
                <td>{vehicle.availability_status}</td>
                <td>{vehicle.location}</td>
                <td>{vehicle.fuel_type}</td>
                <td>{vehicle.transmission}</td>
                <td>{vehicle.seating_capacity}</td>
                <td>{vehicle.mileage}</td>
                <td>{new Date(vehicle.last_service_date).toLocaleDateString()}</td>
                <td>{new Date(vehicle.insurance_expiry).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div>
        <button 
          onClick={() => handlePageChange(currentPage - 1)} 
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span> Page {currentPage} of {totalPages} </span>
        <button 
          onClick={() => handlePageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default VehicleList;