import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Filter.css';

function Filter() {

  const [filterResults, setFilterResults] = useState([]);
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
    <div className="vehicle-card bg-[#1e1e1e] text-white rounded-xl shadow-lg p-6 hover:scale-105 transition-transform duration-300 ease-in-out">
      <img
        src={vehicle.imagePath}
        alt={vehicle.vehicleName}
        className="vehicle-image w-full h-48 object-cover rounded-lg mb-4"
        onError={(e) => (e.target.src = '/images/default-vehicle.jpg')}
      />
      <h3 className="text-xl font-semibold">{vehicle.vehicleName}</h3>
      <p className="text-sm mt-2">Type: {vehicle.vehicleType}</p>
      <p className="text-sm">Capacity: {vehicle.NoOfPeople}</p>
      <p className="text-sm">Pickup: {vehicle.Pickup}</p>
      <p className="text-sm">Return: {vehicle.ReturnLocation || vehicle.Pickup}</p>
      <p className={`text-sm ${vehicle.Booked === 'yes' ? 'text-red-500' : 'text-green-500'}`}>
        Status: {vehicle.Booked === 'yes' ? 'Booked' : 'Available'}
      </p>
      <p className="text-sm">Owner: {vehicle.owner === 'yes' ? 'Yes' : 'No'}</p>
    </div>
  );

  return (
    <div className="FilterAll">

      {/* Filter Section */}
      <section id="sect" className="filter-section p-8 bg-[#121212] rounded-3xl shadow-xl max-w-4xl mx-auto mt-12">
        <h2 className="text-3xl text-white font-bold mb-6 text-center">Filter For Vehicles</h2>
        <div className="filter-box bg-[#1e1e1e] rounded-xl p-6 shadow-md">
          <div className="filter-row grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="filter-group">
              <label className="text-white">From (Pickup Location):</label>
              <input
                type="text"
                name="pickup"
                placeholder="Enter pickup location"
                value={filters.pickup}
                onChange={handleFilterChange}
                className="w-full p-3 mt-2 rounded-xl bg-[#2e2e2e] text-white border-2 border-[#00f2ff] focus:ring-2 focus:ring-[#00f2ff]"
              />
            </div>
            <div className="filter-group">
              <label className="text-white">To (Return Location):</label>
              <input
                type="text"
                name="returnLocation"
                placeholder="Enter return location"
                value={filters.returnLocation}
                onChange={handleFilterChange}
                className="w-full p-3 mt-2 rounded-xl bg-[#2e2e2e] text-white border-2 border-[#00f2ff] focus:ring-2 focus:ring-[#00f2ff]"
              />
            </div>
          </div>
          <div className="filter-row grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="filter-group">
              <label className="text-white">Vehicle Type:</label>
              <select
                name="vehicleType"
                onChange={handleFilterChange}
                value={filters.vehicleType}
                className="w-full p-3 mt-2 rounded-xl bg-[#2e2e2e] text-white border-2 border-[#00f2ff] focus:ring-2 focus:ring-[#00f2ff]"
              >
                <option value="">All Vehicles</option>
                <option value="cars">Cars</option>
                <option value="bikes">Bikes</option>
                <option value="vans">Vans</option>
                <option value="buses">Buses</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="text-white">Pickup Date:</label>
              <input
                type="date"
                name="pickupDate"
                value={filters.pickupDate}
                onChange={handleFilterChange}
                className="w-full p-3 mt-2 rounded-xl bg-[#2e2e2e] text-white border-2 border-[#00f2ff] focus:ring-2 focus:ring-[#00f2ff]"
              />
            </div>
            <div className="filter-group">
              <label className="text-white">Pickup Time:</label>
              <input
                type="time"
                name="pickupTime"
                value={filters.pickupTime}
                onChange={handleFilterChange}
                className="w-full p-3 mt-2 rounded-xl bg-[#2e2e2e] text-white border-2 border-[#00f2ff] focus:ring-2 focus:ring-[#00f2ff]"
              />
            </div>
          </div>
          <div className="filter-row grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="filter-group">
              <label className="text-white">Return Date:</label>
              <input
                type="date"
                name="returnDate"
                value={filters.returnDate}
                onChange={handleFilterChange}
                className="w-full p-3 mt-2 rounded-xl bg-[#2e2e2e] text-white border-2 border-[#00f2ff] focus:ring-2 focus:ring-[#00f2ff]"
              />
            </div>
            <div className="filter-group">
              <label className="text-white">Return Time:</label>
              <input
                type="time"
                name="returnTime"
                value={filters.returnTime}
                onChange={handleFilterChange}
                className="w-full p-3 mt-2 rounded-xl bg-[#2e2e2e] text-white border-2 border-[#00f2ff] focus:ring-2 focus:ring-[#00f2ff]"
              />
            </div>
            <div className="filter-group">
              <label className="text-white">Number of Days:</label>
              <input
                type="number"
                name="numberOfDays"
                min="1"
                value={filters.numberOfDays}
                onChange={handleNumberOfDaysChange}
                className="w-full p-3 mt-2 rounded-xl bg-[#2e2e2e] text-white border-2 border-[#00f2ff] focus:ring-2 focus:ring-[#00f2ff]"
              />
            </div>
          </div>
          <button
            className="apply-filter-btn bg-[#00f2ff] text-black rounded-xl py-3 px-6 mt-6 w-full hover:bg-[#00c4c4] transition-all ease-in-out duration-300"
            onClick={handleApplyFilters}
          >
            Apply Filter
          </button>
        </div>
        <div className="results mt-8">
          {filterResults.length > 0 ? (
            filterResults.map((vehicle) => <VehicleCard key={vehicle._id} vehicle={vehicle} />)
          ) : (
            <p className="text-white text-center">
              {Object.values(filters).every(value => value === '') 
                ? 'Apply filters to see results' 
                : 'No vehicles match the filters'}
            </p>
          )}
        </div>
      </section>

    </div>
  );
}

export default Filter;
