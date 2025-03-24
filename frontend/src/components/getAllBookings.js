import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:1111/api/v1/booking/all")
      .then(response => {
        setBookings(response.data.bookings);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const handleOpenModal = (bookingId) => {
    setSelectedBookingId(bookingId);
    setShowModal(true);
  };

  const handleCancelBooking = () => {
    if (!selectedBookingId) return;

    axios.delete(`http://localhost:1111/api/v1/booking/all/${selectedBookingId}`)
      .then(() => {
        setBookings(prevBookings => prevBookings.filter(booking => booking._id !== selectedBookingId));
        alert("Booking canceled successfully");
      })
      .catch(error => {
        alert("Error canceling booking: " + (error.response?.data?.message || error.message));
      })
      .finally(() => {
        setShowModal(false);
        setSelectedBookingId(null);
      });
};


  const handleEditBooking = (bookingId) => {
    navigate(`/edit-booking/${bookingId}`);
  };

  if (loading) return <p className="text-center text-gray-600">Loading bookings...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">All Bookings</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-4 py-2 border">User</th>
              <th className="px-4 py-2 border">Vehicle Name</th>
              <th className="px-4 py-2 border">Pickup</th>
              <th className="px-4 py-2 border">Dropoff</th>
              <th className="px-4 py-2 border">Start Date</th>
              <th className="px-4 py-2 border">End Date</th>
              <th className="px-4 py-2 border">Total</th>
              <th className="px-4 py-2 border">Payment</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <tr key={booking._id} className="border-b">
                  <td className="px-4 py-2 border">{booking.user}</td>
                  <td className="px-4 py-2 border">{booking.vehicleName}</td>
                  <td className="px-4 py-2 border">{booking.pickUpLocation}</td>
                  <td className="px-4 py-2 border">{booking.dropOffLocation}</td>
                  <td className="px-4 py-2 border">{booking.rentalStartDate}</td>
                  <td className="px-4 py-2 border">{booking.rentalEndDate}</td>
                  <td className="px-4 py-2 border">${booking.totalAmount}</td>
                  <td className="px-4 py-2 border">{booking.paymentMethod}</td>
                  <td className="px-4 py-2 border flex space-x-2">
                    <div style={{ display: 'flex', flexFlow: 'column', gap: '3px' }}>
                      <button
                        onClick={() => handleOpenModal(booking._id)}
                        className="btn btn-danger"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEditBooking(booking._id)}
                        className="btn btn-warning"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-4">No bookings found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg font-semibold">Are you sure you want to cancel this booking?</p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={handleCancelBooking}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Yes, Cancel
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                No, Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
