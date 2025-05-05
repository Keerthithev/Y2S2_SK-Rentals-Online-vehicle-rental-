import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState({ dropOffLocation: "", rentalStartDate: "", rentalEndDate: "" });
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:1111/api/v2/booking/all")
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

    axios.delete(`http://localhost:1111/api/v2/booking/delete/${selectedBookingId}`)
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

  const handleEditBookingClick = (booking) => {
    setSelectedBookingId(booking._id);
    setEditData({
      dropOffLocation: booking.dropOffLocation,
      rentalStartDate: booking.rentalStartDate,
      rentalEndDate: booking.rentalEndDate
    });
    setEditModal(true);
  };

  const handleEditBookingSubmit = () => {
    if (!selectedBookingId) {
      alert("Invalid booking ID. Please try again.");
      return;
    }

    axios.put(`http://localhost:1111/api/v2/booking/edit/${selectedBookingId}`, editData)
      .then(response => {
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking._id === selectedBookingId ? response.data.booking : booking
          )
        );
        alert("Booking updated successfully");
      })
      .catch(error => {
        alert("Error updating booking: " + (error.response?.data?.message || error.message));
      })
      .finally(() => {
        setEditModal(false);
        setSelectedBookingId(null);
      });
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
                  <td className="px-4 py-2 border">Rs.{booking.totalAmount}</td>
                  <td className="px-4 py-2 border">{booking.paymentMethod}</td>
                  <td className="px-4 py-2 border flex space-x-2">
                    <div style={{ display: 'flex', flexFlow: 'column', gap: '3px' }}>
                      <button onClick={() =>  handleCancelBooking (booking._id)} className="btn btn-danger">Delete</button>
                      <button onClick={() => handleEditBookingClick(booking)} className="btn btn-warning">Edit</button>
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

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold">Edit Booking</h3>
            <label>Dropoff Location: <input type="text" value={editData.dropOffLocation} onChange={(e) => setEditData({ ...editData, dropOffLocation: e.target.value })} /></label>
            <label>Start Date: <input type="date" value={editData.rentalStartDate} onChange={(e) => setEditData({ ...editData, rentalStartDate: e.target.value })} /></label>
            <label>End Date: <input type="date" value={editData.rentalEndDate} onChange={(e) => setEditData({ ...editData, rentalEndDate: e.target.value })} /></label>
            <button onClick={handleEditBookingSubmit} className="bg-blue-500 text-white px-4 py-2 rounded">Update</button>
            <button onClick={() => setEditModal(false)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
