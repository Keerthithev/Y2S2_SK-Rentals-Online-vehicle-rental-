import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './AdminSingleVehicle.css'; 
import Header from '../layouts/Header';

const AdminSingleVehicle = () => {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch single vehicle details
  const fetchVehicleDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authorization token is missing');
      }

      const response = await axios.get(`http://localhost:1111/api/v1/admin/vehicle/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success && response.data.vehicle) {
        setVehicle(response.data.vehicle);
      } else {
        setError('Vehicle not found');
      }
    } catch (err) {
      setError('Failed to fetch vehicle details');
      console.error('Error fetching vehicle details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleDetails();
  }, [id]);

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
        navigate("/listvehicle"); 
      }
    } catch (err) {
      setError('Failed to delete vehicle');
    }
  };

  // Handle Next Image
  const nextImage = () => {
    if (vehicle?.images?.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % vehicle.images.length);
    }
  };

  // Handle Previous Image
  const prevImage = () => {
    if (vehicle?.images?.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? vehicle.images.length - 1 : prevIndex - 1
      );
    }
  };

  // Open Modal for large image view
  const openModal = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  // Close Modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  return (
    <div className="admin-single-vehicle-container">
      <Header />
      <h1>Vehicle Details</h1>

      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p>Loading vehicle details...</p>
      ) : (
        vehicle && (
          <div className="vehicle-content">
            {/* Vehicle Details on Left */}
            <div className="vehicle-details">
              <h2>{vehicle.name}</h2>
              <p><strong>Brand:</strong> {vehicle.brand}</p>
              <p><strong>Model:</strong> {vehicle.model}</p>
              <p><strong>Year:</strong> {vehicle.year}</p>
              <p><strong>Fuel Type:</strong> {vehicle.fuelType}</p>
              <p><strong>Transmission:</strong> {vehicle.transmission}</p>
              <p><strong>Seating Capacity:</strong> {vehicle.seatingCapacity}</p>
              <p><strong>Rent Per Day:</strong> ${vehicle.rentPerDay}</p>
              <p><strong>License Plate:</strong> {vehicle.licensePlateNumber}</p>
              <p><strong>Vehicle Type:</strong> {vehicle.vehicleType}</p>
              <p><strong>Mileage:</strong> {vehicle.mileage} km</p>
              <p><strong>Tuned:</strong> {vehicle.isTuned ? 'Yes' : 'No'}</p>
              <p><strong>Last Insurance Date:</strong> {new Date(vehicle.lastInsuranceDate).toLocaleDateString()}</p>
              <p><strong>Available:</strong> {vehicle.availableStatus ? 'Yes' : 'No'}</p>
              <p><strong>Description:</strong> {vehicle.description}</p>



              <div className="button-group">
                <button onClick={() => vehicle._id && navigate(`/editvehicle/${vehicle._id}`)} className="action-button">Edit</button>
                <button onClick={() => deleteVehicle(vehicle._id)} className="action-button">Delete</button>
                <button onClick={() => navigate('/listvehicle')} className="action-button back-button">Back to Vehicle List</button>
              </div>
            </div>

            {/* Vehicle Image Carousel on Right */}
            <div className="vehicle-image-container">
              {vehicle.images && vehicle.images.length > 0 ? (
                <>
                  <img
                    src={vehicle.images[currentImageIndex]?.url}
                    alt={`${vehicle.name}-image`}
                    className="vehicle-main-image"
                    onClick={() => openModal(vehicle.images[currentImageIndex]?.url)} // Open large image modal on click
                  />
                  <div className="image-navigation">
                    <button onClick={prevImage}>&#10094; Prev</button>
                    <button onClick={nextImage}>Next &#10095;</button>
                  </div>
                </>
              ) : (
                <p>No images available</p>
              )}
            </div>
          </div>
        )
      )}

      {/* Modal for large image */}
      {isModalOpen && (
        <div className="image-modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-button" onClick={closeModal}>&times;</span>
            <img src={selectedImage} alt="Large view" className="large-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSingleVehicle;
