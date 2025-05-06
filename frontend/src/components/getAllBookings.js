import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);

  // Fetch bookings from the backend
  const fetchBookings = async () => {
    try {
      // Make a GET request to fetch all bookings
      const res = await axios.get('http://localhost:1111/api/v1/allbookings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      // Set the bookings state with the fetched data
      setBookings(res.data.bookings);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to load bookings', 'error');
    }
  };

  // Cancel a booking
  const cancelBooking = async (id) => {
    const confirm = await Swal.fire({
      title: 'Cancel Booking?',
      text: 'Are you sure you want to cancel this booking?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it!',
    });

    if (confirm.isConfirmed) {
      try {
        // Make a DELETE request to cancel the booking
        await axios.delete(`http://localhost:1111/api/v1/cancelbooking/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        // Show a success message and refresh the list
        Swal.fire('Cancelled!', 'Booking cancelled successfully.', 'success');
        fetchBookings(); // Refresh list after cancellation
      } catch (err) {
        Swal.fire('Error', 'Failed to cancel booking', 'error');
      }
    }
  };

  // Fetch bookings when the component mounts
  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-blue-800 mb-4">All Bookings</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border">
          <thead>
            <tr className="bg-blue-100">
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Vehicle</th>
              <th className="px-4 py-2">From</th>
              <th className="px-4 py-2">To</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id} className="text-sm border-t">
                <td className="px-4 py-2">{booking.userId?.name}</td>  {/* Accessing full user details */}
                <td className="px-4 py-2">{booking.vehicleId?.brand} {booking.vehicleId?.model}</td>  {/* Accessing full vehicle details */}
                <td className="px-4 py-2">{new Date(booking.rentalStartDate).toLocaleDateString()}</td>
                <td className="px-4 py-2">{new Date(booking.rentalEndDate).toLocaleDateString()}</td>
                <td className="px-4 py-2">Rs. {booking.totalAmount}</td>
                <td className="px-4 py-2 flex gap-2">
                  {/* Cancel button */}
                  <button
                    onClick={() => cancelBooking(booking._id)}  // Trigger cancel booking
                    className="bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600"
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">No bookings found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingList;
