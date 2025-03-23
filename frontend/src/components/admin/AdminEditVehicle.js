import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

// Upload function to Cloudinary
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
      return []; // Return an empty array if upload fails
    }
  }

  return uploadedUrls; // Return the uploaded URLs
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
    images: [], // To store image URLs
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch vehicle data when component mounts
  useEffect(() => {
    const fetchVehicle = async () => {
      console.log(`Fetching vehicle with ID: ${id}`);
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:1111/api/v1/admin/vehicle/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        console.log('Fetched vehicle data:', response.data);
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

  // Handle image input changes and store selected images (do not upload yet)
  const handleImageChange = (e) => {
    const files = e.target.files;
    const imageUrls = [];
    for (const file of files) {
      imageUrls.push(URL.createObjectURL(file)); // Temporarily store image URLs (no upload yet)
    }
    setVehicle((prevState) => ({
      ...prevState,
      images: imageUrls, // Update state with the selected images (no upload yet)
    }));
  };

  // Handle form submission (upload images to Cloudinary when submitting)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // If there are any new images selected, upload them to Cloudinary
    let imageUrls = vehicle.images;
    if (imageUrls.length > 0 && typeof imageUrls[0] !== 'string') {
      try {
        setLoading(true);
        // Only upload if imageUrls are not secure URLs
        imageUrls = await uploadImagesToCloudinary(e.target.files);
        setVehicle((prevState) => ({
          ...prevState,
          images: imageUrls, // Store the uploaded image URLs in state
        }));
      } catch (error) {
        setError('Failed to upload images');
        setLoading(false);
        return;
      }
    }

    try {
      // Now send the vehicle data, including the updated images, to your backend
      const response = await axios.put(`http://localhost:1111/api/v1/admin/vehicle/${id}`, vehicle, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      alert('Vehicle updated successfully');
      navigate('/admin/vehicles');
    } catch (err) {
      setError('Failed to update vehicle');
    } finally {
      setLoading(false);
    }
  };

  // Return loading or error message if applicable
  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  // Ensure vehicle data is available before rendering form
  if (!vehicle.name) {
    return <p>No vehicle data available.</p>;
  }

  return (
    <div className="edit-vehicle-container">
      <h1>Edit Vehicle</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={vehicle.name || ''}
          onChange={handleInputChange}
          placeholder="Vehicle Name"
          required
        />
        <input
          type="text"
          name="brand"
          value={vehicle.brand || ''}
          onChange={handleInputChange}
          placeholder="Brand"
          required
        />
        <input
          type="text"
          name="model"
          value={vehicle.model || ''}
          onChange={handleInputChange}
          placeholder="Model"
          required
        />
        <input
          type="number"
          name="year"
          value={vehicle.year || ''}
          onChange={handleInputChange}
          placeholder="Year"
          required
        />
        <input
          type="text"
          name="fuelType"
          value={vehicle.fuelType || ''}
          onChange={handleInputChange}
          placeholder="Fuel Type"
          required
        />
        <input
          type="text"
          name="transmission"
          value={vehicle.transmission || ''}
          onChange={handleInputChange}
          placeholder="Transmission"
          required
        />
        <input
          type="number"
          name="seatingCapacity"
          value={vehicle.seatingCapacity || ''}
          onChange={handleInputChange}
          placeholder="Seating Capacity"
          required
        />
        <input
          type="number"
          name="rentPerDay"
          value={vehicle.rentPerDay || ''}
          onChange={handleInputChange}
          placeholder="Rent per Day"
          required
        />
        <textarea
          name="description"
          value={vehicle.description || ''}
          onChange={handleInputChange}
          placeholder="Description"
          required
        />
        <input
          type="file"
          multiple
          onChange={handleImageChange}
        />

        {/* Display selected images as previews */}
        {vehicle.images.length > 0 && (
          <div>
            <h3>Selected Images:</h3>
            {vehicle.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Preview ${index}`}
                style={{ width: '100px', height: '100px', objectFit: 'cover', margin: '5px' }}
              />
            ))}
          </div>
        )}

        <button type="submit">Update Vehicle</button>
      </form>
    </div>
  );
};

export default EditVehicle;
