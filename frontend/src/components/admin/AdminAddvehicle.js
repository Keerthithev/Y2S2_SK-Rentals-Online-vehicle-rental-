import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import './AdminAddvehicle.css'; // Import your CSS file here
import Header from '../layouts/Header';
const AdminAddvehicle = () => {
  const navigate = useNavigate();
  const [vehicleData, setVehicleData] = useState({
    name: '',
    brand: '',
    model: '',
    year: '',
    fuelType: '',
    transmission: '',
    seatingCapacity: '',
    rentPerDay: '',
    description: '',
    images: [],
    adminId: '',
    licensePlateNumber: '',
    vehicleType: '',
    mileage: '',
    isTuned: false,
    lastInsuranceDate: '',
    availableStatus: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle input change for vehicle details
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVehicleData({
      ...vehicleData,
      [name]: value,
    });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setVehicleData({
      ...vehicleData,
      images: files, // Storing the selected files
    }); 
  };

  const uploadImagesToCloudinary = async (files) => {
    const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/dpcl7yv77/image/upload';
    const cloudinaryPreset = 'ml_default';
    
    let uploadedUrls = []; // Use a local array instead of a global one
  
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', cloudinaryPreset);
  
      try {
        const response = await axios.post(cloudinaryUrl, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedUrls.push(response.data.secure_url);
      } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        setError('Error uploading images');
        return []; // Return an empty array if upload fails
      }
    }
    return uploadedUrls;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (!vehicleData.name || vehicleData.images.length < 2) {
        if(vehicleData.images.length < 2){
          throw new Error('Please fill all fields and upload at least 2 images');
        }
        throw new Error('Please fill all fields and upload images');
      }

      // Upload images first
      const imageUrls = await uploadImagesToCloudinary(vehicleData.images);
      if (imageUrls.length === 0) {
        throw new Error('Error uploading images');
      }

      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authorization token is missing');
      }

      // Decode the token to get the payload
      const decodedToken = jwtDecode(token);

      // Assuming the correct field is found, extract the adminId
      const adminId = decodedToken.id;  // Update this based on the actual field name
      if (!adminId) {
        throw new Error('Admin ID not found in token');
      }

      const formData = new FormData();
      formData.append('name', vehicleData.name);
      formData.append('brand', vehicleData.brand);
      formData.append('model', vehicleData.model);
      formData.append('year', vehicleData.year);
      formData.append('fuelType', vehicleData.fuelType);
      formData.append('transmission', vehicleData.transmission);
      formData.append('seatingCapacity', vehicleData.seatingCapacity);
      formData.append('rentPerDay', vehicleData.rentPerDay);
      formData.append('description', vehicleData.description);
      formData.append('licensePlateNumber', vehicleData.licensePlateNumber);
      formData.append('vehicleType', vehicleData.vehicleType);
      formData.append('mileage', vehicleData.mileage);
      formData.append('isTuned', vehicleData.isTuned);
      formData.append('lastInsuranceDate', vehicleData.lastInsuranceDate);
      formData.append('availableStatus', vehicleData.availableStatus);
      
      // Append the uploaded image URLs
      imageUrls.forEach((url) => formData.append('images', url));
      
      // Add admin ID to the form data
      formData.append('adminId', adminId);

      // Send to the backend
      const response = await axios.post(
        'http://localhost:1111/api/v1/admin/vehicle/new',
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      alert('Vehicle added successfully!');
      // Reset form state
      setVehicleData({
        name: '',
        brand: '',
        model: '',
        year: '',
        fuelType: '',
        transmission: '',
        seatingCapacity: '',
        rentPerDay: '',
        description: '',
        images: [],
        adminId: '',
        licensePlateNumber: '',
        vehicleType: '',
        mileage: '',
        isTuned: false,
        lastInsuranceDate: '',
        availableStatus: true,
      });
    
      navigate("/listvehicle");

    } catch (err) {
      setError('Failed to add vehicle or must select more than one file. Please try again.');
      console.error('Error adding vehicle:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-add-vehicle-container"> <Header />
      <h1>Add New Vehicle</h1>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-group">
          <label>Vehicle Name</label>
          <input
            type="text"
            name="name"
            value={vehicleData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Brand</label>
          <input
            type="text"
            name="brand"
            value={vehicleData.brand}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Model</label>
          <input
            type="text"
            name="model"
            value={vehicleData.model}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Year</label>
          <input
            type="number"
            name="year"
            value={vehicleData.year}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Fuel Type</label>
          <select
            name="fuelType"
            value={vehicleData.fuelType}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Fuel Type</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
        <div className="form-group">
          <label>Transmission</label>
          <select
            name="transmission"
            value={vehicleData.transmission}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Transmission</option>
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
          </select>
        </div>
        <div className="form-group">
          <label>Seating Capacity</label>
          <input
            type="number"
            name="seatingCapacity"
            value={vehicleData.seatingCapacity}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Rent per Day</label>
          <input
            type="number"
            name="rentPerDay"
            value={vehicleData.rentPerDay}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={vehicleData.description}
            onChange={handleInputChange}
            required
          ></textarea>
        </div>
        <div className="form-group">
          <label>License Plate Number</label>
          <input
            type="text"
            name="licensePlateNumber"
            value={vehicleData.licensePlateNumber}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Vehicle Type</label>
          <select
            name="vehicleType"
            value={vehicleData.vehicleType}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Vehicle Type</option>
            <option value="Economy cars">Economy cars</option>
            <option value="Compact cars">Compact cars</option>
            <option value="SUVs">SUVs</option>
            <option value="Luxury cars">Luxury cars</option>
            <option value="Vans">Vans</option>
            <option value="KDH vans">KDH vans</option>
            <option value="Motorbikes">Motorbikes</option>
            <option value="Electric bikes">Electric bikes</option>
          </select>
        </div>
        <div className="form-group">
          <label>Mileage</label>
          <input
            type="number"
            name="mileage"
            value={vehicleData.mileage}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Tuned</label>
          <input
            type="checkbox"
            name="isTuned"
            checked={vehicleData.isTuned}
            onChange={() => setVehicleData({ ...vehicleData, isTuned: !vehicleData.isTuned })}
          />
        </div>
        <div className="form-group">
          <label>Last Insurance Date</label>
          <input
            type="date"
            name="lastInsuranceDate"
            value={vehicleData.lastInsuranceDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Available Status</label>
          <input
            type="checkbox"
            name="availableStatus"
            checked={vehicleData.availableStatus}
            onChange={() => setVehicleData({ ...vehicleData, availableStatus: !vehicleData.availableStatus })}
          />
        </div>
        <div className="form-group">
          <label>Upload Images</label>
          <input
            type="file"
            name="images"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Adding Vehicle...' : 'Add Vehicle'}
        </button>
      </form>
    </div>
  );
};

export default AdminAddvehicle;
