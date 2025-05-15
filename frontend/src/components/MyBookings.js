"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Swal from "sweetalert2"

const MyBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingBookingId, setEditingBookingId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [editForm, setEditForm] = useState({
    pickUpLocation: "",
    dropOffLocation: "",
    specialRequests: "",
    rentalStartDate: "",
    rentalEndDate: "",
  })
  const [filterStatus, setFilterStatus] = useState("all")

  const fetchMyBookings = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("You are not logged in. Please log in to view your bookings.")
        setLoading(false)
        return
      }

      const res = await axios.get("http://localhost:1111/api/v1/mybookings", {
        headers: { Authorization: `Bearer ${token}` },
      })

      console.log("Bookings API response:", res.data)

      if (res.data.success && Array.isArray(res.data.bookings)) {
        setBookings(res.data.bookings)
      } else {
        console.error("Invalid response format:", res.data)
        setError("Invalid response from server")
      }
    } catch (err) {
      console.error("Error fetching bookings:", err)
      setError(err.response?.data?.message || "Unable to load bookings")
    } finally {
      setLoading(false)
    }
  }

  const cancelBooking = async (id) => {
    const confirm = await Swal.fire({
      title: "Cancel Booking?",
      text: "Do you really want to cancel this booking?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel it!",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    })

    if (confirm.isConfirmed) {
      try {
        const res = await axios.delete(`http://localhost:1111/api/v1/cancelbooking/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })

        if (res.data.success) {
          Swal.fire({
            title: "Cancelled",
            text: "Your booking has been cancelled",
            icon: "success",
            confirmButtonColor: "#10b981",
          })
          fetchMyBookings()
        } else {
          Swal.fire({
            title: "Error",
            text: res.data.message || "Failed to cancel booking",
            icon: "error",
            confirmButtonColor: "#10b981",
          })
        }
      } catch (err) {
        console.error("Error cancelling booking:", err)
        Swal.fire({
          title: "Error",
          text: err.response?.data?.message || "Failed to cancel booking",
          icon: "error",
          confirmButtonColor: "#10b981",
        })
      }
    }
  }

  const handleEditClick = (booking) => {
    setEditingBookingId(booking._id)
    setEditForm({
      pickUpLocation: booking.pickUpLocation || "",
      dropOffLocation: booking.dropOffLocation || "",
      specialRequests: booking.specialRequests || "",
      rentalStartDate: booking.rentalStartDate?.split("T")[0] || "",
      rentalEndDate: booking.rentalEndDate?.split("T")[0] || "",
    })
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const submitEdit = async (id) => {
    const { rentalStartDate, rentalEndDate } = editForm

    // Validate dates
    if (!rentalStartDate || !rentalEndDate) {
      Swal.fire("Error", "Both pickup and return dates are required", "error")
      return
    }

    if (new Date(rentalEndDate) <= new Date(rentalStartDate)) {
      Swal.fire("Error", "Return date must be after pickup date", "error")
      return
    }

    // Validate locations
    if (!editForm.pickUpLocation || !editForm.dropOffLocation) {
      Swal.fire("Error", "Both pickup and return locations are required", "error")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await axios.put(`http://localhost:1111/api/v1/editbooking/${id}`, editForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })

      if (res.data.success) {
        Swal.fire({
          title: "Success",
          text: "Booking updated successfully",
          icon: "success",
          confirmButtonColor: "#10b981",
        })
        setEditingBookingId(null)
        fetchMyBookings()
      } else {
        Swal.fire({
          title: "Error",
          text: res.data.message || "Failed to update booking",
          icon: "error",
          confirmButtonColor: "#10b981",
        })
      }
    } catch (err) {
      console.error("Error updating booking:", err)
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message || "Failed to update booking",
        icon: "error",
        confirmButtonColor: "#10b981",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const showDetails = (booking) => {
    setSelectedBooking(booking)
    setShowDetailsModal(true)
  }

  const closeDetailsModal = () => {
    setShowDetailsModal(false)
    setSelectedBooking(null)
  }

  useEffect(() => {
    fetchMyBookings()
  }, [])

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString()

  const formatCurrency = (amount) => `Rs. ${amount}`

  const getVehicleName = (booking) => {
    if (booking.vehicleId && typeof booking.vehicleId === "object" && booking.vehicleId.name) {
      return booking.vehicleId.name
    }
    return booking.vehicleName || "N/A"
  }

  const getVehicleImage = (booking) => {
    if (
      booking.vehicleId &&
      typeof booking.vehicleId === "object" &&
      booking.vehicleId.images &&
      Array.isArray(booking.vehicleId.images) &&
      booking.vehicleId.images.length > 0
    ) {
      return booking.vehicleId.images[0].url
    }
    return "/placeholder.svg"
  }

  const getVehicleDetails = (booking) => {
    if (
      booking.vehicleId &&
      typeof booking.vehicleId === "object" &&
      booking.vehicleId.brand &&
      booking.vehicleId.model
    ) {
      return `${booking.vehicleId.brand} ${booking.vehicleId.model} ${
        booking.vehicleId.year ? `(${booking.vehicleId.year})` : ""
      }`
    }
    return ""
  }

  // Filter bookings based on status
  const filteredBookings = bookings.filter((booking) => {
    if (filterStatus === "all") return true
    if (filterStatus === "active") return !booking.status || booking.status === "active"
    return booking.status === filterStatus
  })

  // Get status color class
  const getStatusColorClass = (status) => {
    switch (status) {
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  // Navigate to user vehicle list
  const goToVehicleList = () => {
    window.location.href = "http://localhost:2222/uservehiclelist"
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg mb-8 p-6 text-white">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold">My Bookings</h2>
            <p className="text-purple-100 mt-1">Manage your vehicle reservations</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center bg-white/20 rounded-lg px-3 py-2">
              <label htmlFor="statusFilter" className="mr-2 text-sm text-white">
                Filter by:
              </label>
              <select
                id="statusFilter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white/10 border border-white/30 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 text-white"
              >
                <option value="all">All Bookings</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <button
              onClick={fetchMyBookings}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-purple-700 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50 font-medium shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            
            <button
              onClick={goToVehicleList}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              View All Vehicles
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-3 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading && !error ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-purple-500 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-r-4 border-l-4 border-indigo-300 animate-spin animation-delay-150"></div>
            </div>
            <p className="mt-6 text-gray-600 font-medium">Loading your bookings...</p>
          </div>
        </div>
      ) : bookings.length === 0 && !error ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-purple-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Bookings Found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You don't have any bookings yet. Start exploring our vehicles and book your next ride!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={goToVehicleList}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
            >
              Browse Vehicles
            </button>
          </div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Matching Bookings</h3>
          <p className="text-gray-600 mb-6">No bookings found with the selected filter.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setFilterStatus("all")}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-md"
            >
              Show All Bookings
            </button>
            <button
              onClick={goToVehicleList}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md"
            >
              View All Vehicles
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Vehicle
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Rental Period
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Locations
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 rounded-md overflow-hidden shadow-sm border border-gray-200">
                          <img
                            className="h-12 w-12 object-cover"
                            src={getVehicleImage(booking) || "/placeholder.svg"}
                            alt={getVehicleName(booking)}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{getVehicleName(booking)}</div>
                          <div className="text-sm text-gray-500">{getVehicleDetails(booking)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="mr-3 text-purple-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(booking.rentalStartDate)} - {formatDate(booking.rentalEndDate)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.totalDays ||
                              Math.ceil(
                                (new Date(booking.rentalEndDate).getTime() -
                                  new Date(booking.rentalStartDate).getTime()) /
                                  (1000 * 60 * 60 * 24),
                              )}{" "}
                            days
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="mr-3 text-purple-500 mt-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-gray-900">
                            <span className="font-medium">Pickup:</span> {booking.pickUpLocation}
                          </div>
                          <div className="text-sm text-gray-500">
                            <span className="font-medium">Return:</span> {booking.dropOffLocation}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="mr-3 text-green-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(booking.totalAmount)}</div>
                          <div className="text-sm text-gray-500">
                            {booking.paymentMethod?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1.5 inline-flex items-center text-xs font-medium rounded-full border ${getStatusColorClass(
                          booking.status,
                        )}`}
                      >
                        {booking.status === "cancelled" && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                        {booking.status === "completed" && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {(!booking.status || booking.status === "active") && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        )}
                        {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingBookingId === booking._id ? (
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-lg max-w-xs ml-auto">
                          <h4 className="font-medium text-gray-900 mb-3 text-left flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2 text-purple-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit Booking
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1 text-left">
                                Pickup Date
                              </label>
                              <input
                                name="rentalStartDate"
                                type="date"
                                value={editForm.rentalStartDate}
                                onChange={handleEditChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1 text-left">
                                Return Date
                              </label>
                              <input
                                name="rentalEndDate"
                                type="date"
                                value={editForm.rentalEndDate}
                                onChange={handleEditChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1 text-left">
                                Pickup Location
                              </label>
                              <input
                                name="pickUpLocation"
                                value={editForm.pickUpLocation}
                                onChange={handleEditChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Pickup Location"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1 text-left">
                                Return Location
                              </label>
                              <input
                                name="dropOffLocation"
                                value={editForm.dropOffLocation}
                                onChange={handleEditChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Return Location"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1 text-left">
                                Special Requests
                              </label>
                              <textarea
                                name="specialRequests"
                                value={editForm.specialRequests}
                                onChange={handleEditChange}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Special Requests (Optional)"
                              />
                            </div>
                            <div className="flex justify-end space-x-2 pt-2">
                              <button
                                onClick={() => setEditingBookingId(null)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                                disabled={isSubmitting}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => submitEdit(booking._id)}
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md hover:from-purple-700 hover:to-indigo-700 transition-colors text-sm font-medium flex items-center"
                                disabled={isSubmitting}
                              >
                                {isSubmitting && (
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                )}
                                {isSubmitting ? "Saving..." : "Save Changes"}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => showDetails(booking)}
                            className="px-3 py-1.5 bg-white text-purple-600 border border-purple-200 rounded-md hover:bg-purple-50 transition-colors text-xs font-medium shadow-sm flex items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            Details
                          </button>

                          {(!booking.status || booking.status === "active") && (
                            <>
                              <button
                                onClick={() => handleEditClick(booking)}
                                className="px-3 py-1.5 bg-white text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors text-xs font-medium shadow-sm flex items-center"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3.5 w-3.5 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => cancelBooking(booking._id)}
                                className="px-3 py-1.5 bg-white text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors text-xs font-medium shadow-sm flex items-center"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3.5 w-3.5 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* View All Vehicles Button at the bottom of the table */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-center">
            <button
              onClick={goToVehicleList}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              View All Vehicles in Tirupur
            </button>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Booking Details
                </h3>
                <button
                  onClick={closeDetailsModal}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Vehicle Information */}
                  <div className="md:w-1/3">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-purple-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Vehicle Information
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center mb-4">
                        <img
                          src={getVehicleImage(selectedBooking) || "/placeholder.svg"}
                          alt={getVehicleName(selectedBooking)}
                          className="w-20 h-20 object-cover rounded-md border border-gray-200 shadow-sm"
                        />
                        <div className="ml-4">
                          <p className="font-semibold text-gray-900">{getVehicleName(selectedBooking)}</p>
                          <p className="text-sm text-gray-600">{getVehicleDetails(selectedBooking)}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Booking ID:</span>
                          <span className="text-sm font-medium text-gray-900 max-w-[180px] truncate">
                            {selectedBooking._id}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-600">Booking Date:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatDate(selectedBooking.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Information */}
                  <div className="md:w-2/3">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-purple-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      Booking Information
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-md border border-gray-100 shadow-sm">
                          <div className="flex items-center mb-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-purple-600 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <h5 className="font-medium text-gray-900">Rental Period</h5>
                          </div>
                          <p className="text-sm text-gray-600">
                            From:{" "}
                            <span className="font-medium text-gray-900">
                              {formatDate(selectedBooking.rentalStartDate)}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600">
                            To:{" "}
                            <span className="font-medium text-gray-900">
                              {formatDate(selectedBooking.rentalEndDate)}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Duration:{" "}
                            <span className="font-medium text-gray-900">
                              {selectedBooking.totalDays ||
                                Math.ceil(
                                  (new Date(selectedBooking.rentalEndDate).getTime() -
                                    new Date(selectedBooking.rentalStartDate).getTime()) /
                                    (1000 * 60 * 60 * 24),
                                )}{" "}
                              days
                            </span>
                          </p>
                        </div>

                        <div className="bg-white p-3 rounded-md border border-gray-100 shadow-sm">
                          <div className="flex items-center mb-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-purple-600 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <h5 className="font-medium text-gray-900">Locations</h5>
                          </div>
                          <p className="text-sm text-gray-600">
                            Pickup: <span className="font-medium text-gray-900">{selectedBooking.pickUpLocation}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Return: <span className="font-medium text-gray-900">{selectedBooking.dropOffLocation}</span>
                          </p>
                        </div>

                        <div className="bg-white p-3 rounded-md border border-gray-100 shadow-sm">
                          <div className="flex items-center mb-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-purple-600 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <h5 className="font-medium text-gray-900">Payment</h5>
                          </div>
                          <p className="text-sm text-gray-600">
                            Amount:{" "}
                            <span className="font-medium text-gray-900">
                              {formatCurrency(selectedBooking.totalAmount)}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Method:{" "}
                            <span className="font-medium text-gray-900">
                              {selectedBooking.paymentMethod
                                ?.replace("_", " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </span>
                          </p>
                        </div>

                        <div className="bg-white p-3 rounded-md border border-gray-100 shadow-sm">
                          <div className="flex items-center mb-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-purple-600 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <h5 className="font-medium text-gray-900">Status</h5>
                          </div>
                          <p className="text-sm text-gray-600">
                            Current Status:
                            <span
                              className={`ml-2 px-2 py-1 inline-flex items-center text-xs font-medium rounded-full border ${getStatusColorClass(
                                selectedBooking.status,
                              )}`}
                            >
                              {selectedBooking.status
                                ? selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)
                                : "Active"}
                            </span>
                          </p>
                        </div>
                      </div>

                      {selectedBooking.additionalDrivers > 0 && (
                        <div className="mt-4 bg-white p-3 rounded-md border border-gray-100 shadow-sm">
                          <div className="flex items-center mb-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-purple-600 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                              />
                            </svg>
                            <h5 className="font-medium text-gray-900">Additional Drivers</h5>
                          </div>
                          <p className="text-sm text-gray-600">
                            Number of additional drivers:{" "}
                            <span className="font-medium text-gray-900">{selectedBooking.additionalDrivers}</span>
                          </p>
                        </div>
                      )}

                      {selectedBooking.specialRequests && (
                        <div className="mt-4 bg-white p-3 rounded-md border border-gray-100 shadow-sm">
                          <div className="flex items-center mb-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-purple-600 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                              />
                            </svg>
                            <h5 className="font-medium text-gray-900">Special Requests</h5>
                          </div>
                          <p className="text-sm text-gray-600">{selectedBooking.specialRequests}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={closeDetailsModal}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
                {(!selectedBooking.status || selectedBooking.status === "active") && (
                  <>
                    <button
                      onClick={() => {
                        closeDetailsModal()
                        handleEditClick(selectedBooking)
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit Booking
                    </button>
                    <button
                      onClick={() => {
                        closeDetailsModal()
                        cancelBooking(selectedBooking._id)
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel Booking
                    </button>
                  </>
                )}
              </div>
              
              {/* View All Vehicles Button in Modal */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-center">
                <button
                  onClick={goToVehicleList}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  View All Vehicles in Tirupur
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyBookings
