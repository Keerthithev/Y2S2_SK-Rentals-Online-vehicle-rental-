import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen bg-gradient-to-br from-[#0c0f23] via-[#101c3a] to-[#0f1d2e] text-white font-sans">
      <Top />
      <Slideshow />

      {/* Search */}
      <div className="flex justify-center mt-6 px-4">
        <input
          type="text"
          placeholder="Search brand, model, year or type"
          value={searchTerm}
          onChange={handleSearch}
          className="w-full max-w-3xl px-5 py-3 rounded-xl bg-[#1e2a45] text-white border border-blue-600 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
      </div>

      {/* Status/Error */}
      {error && <p className="text-red-400 text-center mt-4">{error}</p>}
      {loading ? (
        <p className="text-center text-gray-300 mt-10">Loading vehicles...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 p-6 max-w-7xl mx-auto">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle._id}
              onClick={() => navigate(`/vehicle/${vehicle._id}`)}
              className="bg-[#162035] hover:bg-[#1c2a45] border border-blue-700 rounded-2xl p-4 shadow-lg hover:shadow-xl transition cursor-pointer transform hover:-translate-y-1"
            >
              <img
                src={vehicle.images?.[0]?.url || '/images/default-vehicle.jpg'}
                alt={vehicle.name}
                className="w-full h-48 object-cover rounded-xl mb-4"
                onError={(e) => (e.target.src = '/images/default-vehicle.jpg')}
              />
              <h3 className="text-lg font-bold text-blue-300">{vehicle.name}</h3>
              <p className="text-sm text-gray-300">Type: {vehicle.vehicleType}</p>
              <p className="text-sm text-gray-300">Rent: ${vehicle.rentPerDay} / day</p>
              <p className={`text-sm font-semibold mt-2 ${vehicle.availableStatus ? 'text-green-400' : 'text-red-500'}`}>
                {vehicle.availableStatus ? 'Available' : 'Not Available'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="mt-10">
        <Filter />
      </div>

      <Details />
      <Footer />
    </div>
  );
};

export default UserVehicleList;
