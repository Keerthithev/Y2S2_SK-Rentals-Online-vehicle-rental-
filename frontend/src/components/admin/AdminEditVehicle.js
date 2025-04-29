import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './AdminEditVehicle.css';
import Header from '../layouts/Header';
import Footer from '../layouts/Footer';
// Upload function to Cloudinary
const uploadImagesToCloudinary = async (files) => {
  const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/dpcl7yv77/image/upload';
  const cloudinaryPreset = 'ml_default';

  let uploadedUrls = [];

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
      return [];
    }
  }

  return uploadedUrls;
};

const EditVehicle = () => {
  const [vehicle, setVehicle] = useState({
    name: '',
    brand: '',
    model: '',
    year: '',
    fuelType: '',
    transmission: '',
    seatingCapacity: '',
    rentPerDay: '',
    description: '',
    images: [], // To store Cloudinary URLs
  });

  const [selectedImages, setSelectedImages] = useState([]); // To store selected File objects
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch vehicle data when component mounts
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:1111/api/v1/admin/vehicle/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setVehicle(response.data.vehicle || {});
      } catch (err) {
        console.error('Error fetching vehicle:', err);
        setError('Failed to fetch vehicle data.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVehicle();
    } else {
      setError('Invalid vehicle ID');
    }
  }, [id]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVehicle((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle new image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);

    // Clear existing previews and add new selected ones
    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setVehicle((prevState) => ({
      ...prevState,
      images: previewUrls, // Replace with newly selected images
    }));
  };

  // Handle form submission (upload images and update vehicle)
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    setLoading(true);
    setError('');
  
    try {
      let imageUrls = vehicle.images;

      // Ensure imageUrls contains valid strings before filtering
      if (Array.isArray(imageUrls)) {
        imageUrls = imageUrls.filter(img => typeof img === 'string' && img.startsWith('http'));
      } else {
        imageUrls = []; // Reset to empty array if not valid
      }

      // Check if there are new image files to upload
      const fileInput = e.target.querySelector('input[type="file"]');
      if (fileInput?.files.length > 0) {
        const uploadedUrls = await uploadImagesToCloudinary(fileInput.files);
        imageUrls = [...imageUrls, ...uploadedUrls]; // Merge existing and newly uploaded URLs
      }

      // Update vehicle data with the correct image URLs
      const updatedVehicle = { ...vehicle, images: imageUrls };

      // Send updated data to the backend
      await axios.put(`http://localhost:1111/api/v1/admin/vehicle/${id}`, updatedVehicle, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      alert('Vehicle updated successfully');
      navigate('/listvehicle');
    } catch (err) {
      console.error('Error updating vehicle:', err);
      setError('Failed to update vehicle');
    } finally {
      setLoading(false);
    }
  };
// Cancel and navigate back to vehicle list
const handleCancel = () => {
  navigate(`/admin/vehicle/${id}`);
};
  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!vehicle.name) return <p>No vehicle data available.</p>;

  return (
    <div className="edit-vehicle-container">
      <h1>Edit Vehicle</h1>
      <Header />
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" value={vehicle.name} onChange={handleInputChange} placeholder="Vehicle Name" required />
        <input type="text" name="brand" value={vehicle.brand} onChange={handleInputChange} placeholder="Brand" required />
        <input type="text" name="model" value={vehicle.model} onChange={handleInputChange} placeholder="Model" required />
        <input type="number" name="year" value={vehicle.year} onChange={handleInputChange} placeholder="Year" required />
        <input type="text" name="fuelType" value={vehicle.fuelType} onChange={handleInputChange} placeholder="Fuel Type" required />
        <input type="text" name="transmission" value={vehicle.transmission} onChange={handleInputChange} placeholder="Transmission" required />
        <input type="number" name="seatingCapacity" value={vehicle.seatingCapacity} onChange={handleInputChange} placeholder="Seating Capacity" required />
        <input type="number" name="rentPerDay" value={vehicle.rentPerDay} onChange={handleInputChange} placeholder="Rent per Day" required />
        <textarea name="description" value={vehicle.description} onChange={handleInputChange} placeholder="Description" required />

        <input type="file" multiple onChange={handleImageChange} />

        {/* Display selected and existing images */}
        {vehicle.images.length > 0 && (
          <div>
            <h3>Images:</h3>
            {vehicle.images.map((image, index) => (
              <img key={index} src={image} alt={`Preview ${index}`} style={{ width: '100px', height: '100px', objectFit: 'cover', margin: '5px' }} />
            ))}
          </div>
        )}
<button type="button" onClick={handleCancel} className="cancel-button">Cancel</button>
        <button type="submit">Update Vehicle</button>
      </form>
      <Footer/>
    </div>
  );
};

export default EditVehicle;
