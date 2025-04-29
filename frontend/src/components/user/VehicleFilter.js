import React from 'react';
// import './VehicleFilter.css';

const VehicleFilter = ({ filters = {}, setFilters, applyFilters }) => {
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="filter-container">
      <h2>Filter Vehicles</h2>
      <div className="filter-group">
        <label>Vehicle Type:</label>
        <select name="vehicleType" value={filters.vehicleType || ''} onChange={handleFilterChange}>
          <option value="">All Vehicles</option>
          <option value="cars">Cars</option>
          <option value="bikes">Bikes</option>
          <option value="vans">Vans</option>
          <option value="buses">Buses</option>
          <option value="auto">Auto</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Pickup Location:</label>
        <input type="text" name="pickup" value={filters.pickup || ''} onChange={handleFilterChange} />
      </div>

      <div className="filter-group">
        <label>Return Location:</label>
        <input type="text" name="returnLocation" value={filters.returnLocation || ''} onChange={handleFilterChange} />
      </div>

      <button className="apply-filter-btn" onClick={applyFilters}>Apply Filters</button>
    </div>
  );
};

export default VehicleFilter;
