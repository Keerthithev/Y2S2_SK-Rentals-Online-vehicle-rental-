import React, { useState, useEffect } from 'react';
import axios from 'axios';
import defaultImage from "./0x0.webp";
import './FilterAll.css';

function FilterAll() {
  const [allVehicles, setAllVehicles] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [filterResults, setFilterResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    vehicleType: '',
    pickup: '',
    returnLocation: '',
    pickupDate: '',
    pickupTime: '',
    returnDate: '',
    returnTime: '',
    numberOfDays: ''
  });

  useEffect(() => {
    fetchAllVehicles();
  }, []);

  useEffect(() => {
    if (searchQuery) fetchSearchResults();
    else setSearchResults([]);
  }, [searchQuery]);

  const fetchAllVehicles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/vehicles');
      setAllVehicles(response.data);
    } catch (error) {
      console.error('Error fetching all vehicles:', error);
    }
  };

  const fetchSearchResults = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/vehicles', {
        params: { search: searchQuery }
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const fetchFilterResults = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/vehicles', {
        params: filters
      });
      setFilterResults(response.data);
    } catch (error) {
      console.error('Error fetching filter results:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    const hasFilters = Object.values(filters).some(value => value !== '');
    if (hasFilters) fetchFilterResults();
    else setFilterResults([]);
  };

  const handleNumberOfDaysChange = (e) => {
    const days = e.target.value;
    setFilters((prev) => {
      if (!prev.pickupDate || !days) {
        return { ...prev, numberOfDays: days, returnDate: '' };
      }
      const pickup = new Date(prev.pickupDate);
      const returnDate = new Date(pickup);
      returnDate.setDate(pickup.getDate() + parseInt(days));
      const formattedReturnDate = returnDate.toISOString().split('T')[0];
      return { ...prev, numberOfDays: days, returnDate: formattedReturnDate };
    });
  };

  const VehicleCard = ({ vehicle }) => (
    <div className="vehicle-card">
      <img
        src={defaultImage}
        alt={vehicle.vehicleName}
        className="vehicle-image"
        onError={(e) => (e.target.src = '/images/default-vehicle.jpg')}
      />
      <h3>{vehicle.vehicleName}</h3>
      <p>Type: {vehicle.vehicleType}</p>
      <p>Capacity: {vehicle.NoOfPeople}</p>
      <p>Pickup: {vehicle.Pickup}</p>
      <p>Return: {vehicle.ReturnLocation || vehicle.Pickup}</p>
      <p>Status: {vehicle.Booked === 'yes' ? 'Booked' : 'Available'}</p>
      <p>Owner: {vehicle.owner === 'yes' ? 'Yes' : 'No'}</p>
    </div>
  );

  return (
    <div className="FilterAll">
     

      {/* Search Section */}
      <section className="search-section">
        <h2>Search Vehicles</h2>
        <input
          type="text"
          placeholder="Search by vehicle name..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-bar"
        />
        <div className="results">
          {searchQuery && searchResults.length > 0 ? (
            searchResults.map((vehicle) => <VehicleCard key={vehicle._id} vehicle={vehicle} />)
          ) : searchQuery ? (
            <p>No results found</p>
          ) : null}
        </div>
      </section>

      {/* Filter Section */}
      <section className="filter-section">
        <h2>Filter Your Vehicle Rental</h2>
        <div className="filter-box">
          <div className="filter-row">
            <div className="filter-group">
              <label>From (Pickup Location):</label>
              <input
                type="text"
                name="pickup"
                placeholder="Enter pickup location"
                value={filters.pickup}
                onChange={handleFilterChange}
              />
            </div>
            <div className="filter-group">
              <label>To (Return Location):</label>
              <input
                type="text"
                name="returnLocation"
                placeholder="Enter return location"
                value={filters.returnLocation}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          <div className="filter-row">
            <div className="filter-group">
              <label>Vehicle Type:</label>
              <select name="vehicleType" onChange={handleFilterChange} value={filters.vehicleType}>
                <option value="">All Vehicles</option>
                <option value="cars">Cars</option>
                <option value="bikes">Bikes</option>
                <option value="vans">Vans</option>
                <option value="buses">Buses</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Pickup Date:</label>
              <input
                type="date"
                name="pickupDate"
                value={filters.pickupDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="filter-group">
              <label>Pickup Time:</label>
              <input
                type="time"
                name="pickupTime"
                value={filters.pickupTime}
                onChange={handleFilterChange}
              />
            </div>
            <div className="filter-group">
              <label>Return Date:</label>
              <input
                type="date"
                name="returnDate"
                value={filters.returnDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="filter-group">
              <label>Return Time:</label>
              <input
                type="time"
                name="returnTime"
                value={filters.returnTime}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          <div className="filter-row">
            <div className="filter-group">
              <label>Number of Days:</label>
              <input
                type="number"
                name="numberOfDays"
                min="1"
                value={filters.numberOfDays}
                onChange={handleNumberOfDaysChange}
              />
            </div>
          </div>
          <button className="apply-filter-btn" onClick={handleApplyFilters}>
            Apply Filter
          </button>
        </div>
        <div className="results">
          {filterResults.length > 0 ? (
            filterResults.map((vehicle) => <VehicleCard key={vehicle._id} vehicle={vehicle} />)
          ) : (
            <p>{Object.values(filters).every(value => value === '') ? 'Apply filters to see results' : 'No vehicles match the filters'}</p>
          )}
        </div>
      </section>

      {/* All Vehicles Section */}
      <section className="all-vehicles-section">
        <h2>All Vehicles</h2>
        <div className="results">
          {allVehicles.length > 0 ? (
            allVehicles.map((vehicle) => <VehicleCard key={vehicle._id} vehicle={vehicle} />)
          ) : (
            <p>Loading vehicles...</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default FilterAll;
