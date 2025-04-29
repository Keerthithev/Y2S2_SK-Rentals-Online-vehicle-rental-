import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Top from '../layouts/Top';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/bookings'); // Replace with your API URL
        if (response.data.success) {
          setBookings(response.data.bookings);
        } else {
          setError('No bookings found.');
        }
      } catch (err) {
        setError('Failed to fetch bookings. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="bookings-page">
        <Top />
      <h1>Your Bookings</h1>
      
      {loading ? (
        <p>Loading your bookings...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div className="booking-card" key={booking._id}>
              <h3>{booking.vehicleName}</h3>
              <p><strong>Booking Date:</strong> {new Date(booking.bookingDate).toLocaleDateString()}</p>
              <p><strong>Pickup Location:</strong> {booking.pickupLocation}</p>
              <p><strong>Return Location:</strong> {booking.returnLocation}</p>
              <p><strong>Status:</strong> {booking.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;
