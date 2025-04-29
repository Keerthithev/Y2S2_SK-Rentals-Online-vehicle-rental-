import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
  
import Header from '../layouts/Header';

const UserSingleVehicle = () => {
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
      const response = await axios.get(`http://localhost:1111/api/v1/vehicle/${id}`);
      console.log("Vehicle data fetched:", response.data);

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

  // Handle Next & Previous Image Navigation
  const nextImage = () => {
    if (vehicle?.images?.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % vehicle.images.length);
    }
  };

  const prevImage = () => {
    if (vehicle?.images?.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? vehicle.images.length - 1 : prevIndex - 1
      );
    }
  };

  // Open & Close Image Modal
  const openModal = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  // Navigate to Booking Page
  const handleBookVehicle = () => {
    navigate(`/book/${id}`);
  };

  return (
    <div className="user-single-vehicle-container">

      <h1 className="vehicle-title">Vehicle Details</h1>

      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p className="loading-message">Loading vehicle details...</p>
      ) : (
        vehicle && (
          <div className="vehicle-content">
            {/* Vehicle Details Section */}
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
              <p><strong>Available:</strong> {vehicle.availableStatus ? 'Yes' : 'No'}</p>
              <p><strong>Description:</strong> {vehicle.description}</p>

              {/* Book Vehicle Button */}
              <button className="book-button" onClick={handleBookVehicle}>
                Book Vehicle
              </button>
            </div>

            {/* Vehicle Image Carousel */}
            <div className="vehicle-image-container">
              {vehicle.images && vehicle.images.length > 0 ? (
                <>
                  <img
                    src={vehicle.images[currentImageIndex]?.url}
                    alt={`${vehicle.name}-image`}
                    className="vehicle-main-image"
                    onClick={() => openModal(vehicle.images[currentImageIndex]?.url)}
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

      {/* Image Modal for Large View */}
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

export default UserSingleVehicle;
