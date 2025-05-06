import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const EditBookingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    rentalStartDate: '',
    rentalEndDate: '',
    pickUpLocation: '',
    dropOffLocation: '',
    specialRequests: '',
  });

  useEffect(() => {
    axios.get(`/api/bookings/allbookings`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => {
      const booking = res.data.bookings.find(b => b._id === id);
      if (booking) {
        setFormData({
          rentalStartDate: booking.rentalStartDate.slice(0, 10),
          rentalEndDate: booking.rentalEndDate.slice(0, 10),
          pickUpLocation: booking.pickUpLocation,
          dropOffLocation: booking.dropOffLocation,
          specialRequests: booking.specialRequests,
        });
      }
    });
  }, [id]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/bookings/editbooking/${id}`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      Swal.fire('Success', 'Booking updated', 'success');
      navigate('/bookings');
    } catch (err) {
      Swal.fire('Error', 'Failed to update booking', 'error');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded">
      <h2 className="text-xl font-semibold mb-4 text-blue-700">Edit Booking</h2>
      <form onSubmit={handleUpdate} className="space-y-4">
        <input type="date" name="rentalStartDate" value={formData.rentalStartDate} onChange={handleChange} className="w-full border p-2 rounded" required />
        <input type="date" name="rentalEndDate" value={formData.rentalEndDate} onChange={handleChange} className="w-full border p-2 rounded" required />
        <input type="text" name="pickUpLocation" value={formData.pickUpLocation} onChange={handleChange} placeholder="Pick-up Location" className="w-full border p-2 rounded" required />
        <input type="text" name="dropOffLocation" value={formData.dropOffLocation} onChange={handleChange} placeholder="Drop-off Location" className="w-full border p-2 rounded" required />
        <textarea name="specialRequests" value={formData.specialRequests} onChange={handleChange} placeholder="Special Requests" className="w-full border p-2 rounded" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Update Booking</button>
      </form>
    </div>
  );
};

export default EditBookingForm;
