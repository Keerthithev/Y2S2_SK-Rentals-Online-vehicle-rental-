import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UserVehicleList.css';
import Top from '../layouts/Top';
import Slideshow from './Slideshow';
import Details from './Details';
import Footer from './Footer';
import Filter from './Filter';

const UserVehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get('http://localhost:1111/api/v1/vehicles');
        console.log("API Response:", response.data);

        if (response.data.success && response.data.vehicles.length > 0) {
          setVehicles(response.data.vehicles);
          setFilteredVehicles(response.data.vehicles);
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
    fetchVehicles();
  }, []);

  const handleSearch = (event) => {
    const query = event.target.value.trim().toLowerCase();
    setSearchTerm(query);

    if (!query) {
      setFilteredVehicles(vehicles);
    } else {
      const filtered = vehicles.filter(vehicle =>
        (vehicle.name?.toLowerCase().includes(query) ||
         vehicle.brand?.toLowerCase().includes(query) ||
         vehicle.model?.toLowerCase().includes(query) ||
         vehicle.year?.toString().includes(query) ||
         vehicle.licensePlateNumber?.toLowerCase().includes(query) ||
         vehicle.vehicleType?.toLowerCase().includes(query))
      );
      setFilteredVehicles(filtered);
    }
  };

  return (
    <div className="user-vehicle-list">
      <Top />
      <Slideshow />
      <input
        type="text"
        placeholder="Search vehicles...." 
        // Brand, Model, Year, License Plate, and Vehicle Type in"
        value={searchTerm}
        onChange={handleSearch}
        className="search-bar"
      />

      {error && <p className="error-message">{error}</p>}
      {loading ? (
        <p className="loading-message">Loading vehicles...</p>
      ) : (
        <div className="vehicle-grid">
          {filteredVehicles.map((vehicle) => (
            <div 
              key={vehicle._id} 
              className="vehicle-card" 
              onClick={() => navigate(`/vehicle/${vehicle._id}`)}
            >
              <img 
                src={vehicle.images?.[0]?.url || '/images/default-vehicle.jpg'} 
                alt={vehicle.name} 
                className="vehicle-image"
                onError={(e) => (e.target.src = '/images/default-vehicle.jpg')}
              />
              <h3>{vehicle.name}</h3>
              <p className="vehicle-price">${vehicle.rentPerDay} / day</p>
              <p className={`vehicle-status ${vehicle.availableStatus ? 'available' : 'unavailable'}`}>
                {vehicle.availableStatus ? "Available" : "Not Available"}
              </p>
            </div>
          ))}
        </div>
      )}
      
      <Filter />
      <Details />
      <Footer />
    </div>
  );
};

export default UserVehicleList;
