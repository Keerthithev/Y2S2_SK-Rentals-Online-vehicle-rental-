"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Swal from "sweetalert2"
import { Calendar, Download, FileText, Filter, Printer, RefreshCw, Search, X } from "lucide-react"
import Header from "./layouts/Header"

const BookingList = () => {
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" })
  const [showFilters, setShowFilters] = useState(false)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" })
  const [summaryStats, setSummaryStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeBookings: 0,
    cancelledBookings: 0,
  })

  // Fetch bookings from the backend
  const fetchBookings = async () => {
    setLoading(true)
    try {
      // Make a GET request to fetch all bookings
      const res = await axios.get("http://localhost:1111/api/v1/allbookings", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })

      // Set the bookings state with the fetched data
      const bookingsData = res.data.bookings || []
      setBookings(bookingsData)
      setFilteredBookings(bookingsData)
      calculateSummaryStats(bookingsData)
    } catch (err) {
      console.error(err)
      Swal.fire("Error", "Failed to load bookings", "error")
    } finally {
      setLoading(false)
    }
  }

  // Calculate summary statistics
  const calculateSummaryStats = (bookingsData) => {
    const stats = {
      totalBookings: bookingsData.length,
      totalRevenue: bookingsData.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0),
      activeBookings: bookingsData.filter((booking) => !booking.status || booking.status === "active").length,
      cancelledBookings: bookingsData.filter((booking) => booking.status === "cancelled").length,
    }
    setSummaryStats(stats)
  }

  // Cancel a booking
  const cancelBooking = async (id) => {
    const confirm = await Swal.fire({
      title: "Cancel Booking?",
      text: "Are you sure you want to cancel this booking?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it!",
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#6b7280",
    })

    if (confirm.isConfirmed) {
      try {
        // Make a DELETE request to cancel the booking
        await axios.delete(`http://localhost:1111/api/v1/cancelbooking/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })

        // Show a success message and refresh the list
        Swal.fire("Cancelled!", "Booking cancelled successfully.", "success")
        fetchBookings() // Refresh list after cancellation
      } catch (err) {
        Swal.fire("Error", "Failed to cancel booking", "error")
      }
    }
  }

  // Handle search and filtering
  useEffect(() => {
    let result = bookings

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (booking) =>
          booking.userId?.name?.toLowerCase().includes(term) ||
          booking.vehicleId?.brand?.toLowerCase().includes(term) ||
          booking.vehicleId?.model?.toLowerCase().includes(term) ||
          booking.pickUpLocation?.toLowerCase().includes(term) ||
          booking.dropOffLocation?.toLowerCase().includes(term),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        result = result.filter((booking) => !booking.status || booking.status === "active")
      } else {
        result = result.filter((booking) => booking.status === statusFilter)
      }
    }

    // Apply date filter
    if (dateFilter.from) {
      const fromDate = new Date(dateFilter.from)
      result = result.filter((booking) => new Date(booking.rentalStartDate) >= fromDate)
    }
    if (dateFilter.to) {
      const toDate = new Date(dateFilter.to)
      toDate.setHours(23, 59, 59, 999) // End of the day
      result = result.filter((booking) => new Date(booking.rentalEndDate) <= toDate)
    }

    // Apply sorting
    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        let aValue, bValue

        // Handle nested properties
        if (sortConfig.key === "userName") {
          aValue = a.userId?.name || ""
          bValue = b.userId?.name || ""
        } else if (sortConfig.key === "vehicleName") {
          aValue = `${a.vehicleId?.brand || ""} ${a.vehicleId?.model || ""}`
          bValue = `${b.vehicleId?.brand || ""} ${b.vehicleId?.model || ""}`
        } else if (sortConfig.key === "startDate") {
          aValue = new Date(a.rentalStartDate).getTime()
          bValue = new Date(b.rentalStartDate).getTime()
        } else if (sortConfig.key === "endDate") {
          aValue = new Date(a.rentalEndDate).getTime()
          bValue = new Date(b.rentalEndDate).getTime()
        } else if (sortConfig.key === "amount") {
          aValue = a.totalAmount || 0
          bValue = b.totalAmount || 0
        } else {
          aValue = a[sortConfig.key] || ""
          bValue = b[sortConfig.key] || ""
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    }

    setFilteredBookings(result)
  }, [bookings, searchTerm, statusFilter, dateFilter, sortConfig])

  // Fetch bookings when the component mounts
  useEffect(() => {
    fetchBookings()
  }, [])

  // Handle sorting
  const requestSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Format currency
  const formatCurrency = (amount) => {
    return `Rs. ${amount.toLocaleString()}`
  }

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-200"
      case "completed":
        return "bg-green-100 text-green-800 border border-green-200"
      default:
        return "bg-blue-100 text-blue-800 border border-blue-200"
    }
  }

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setDateFilter({ from: "", to: "" })
    setSortConfig({ key: null, direction: "ascending" })
  }

  // Generate CSV data
  const generateCSV = () => {
    // Define CSV headers
    const headers = [
      "Booking ID",
      "User Name",
      "Vehicle",
      "Start Date",
      "End Date",
      "Pickup Location",
      "Return Location",
      "Total Days",
      "Total Amount",
      "Payment Method",
      "Status",
      "Booking Date",
    ]

    // Convert bookings to CSV rows
    const rows = filteredBookings.map((booking) => [
      booking._id,
      booking.userId?.name || "N/A",
      `${booking.vehicleId?.brand || ""} ${booking.vehicleId?.model || ""}`,
      formatDate(booking.rentalStartDate),
      formatDate(booking.rentalEndDate),
      booking.pickUpLocation || "N/A",
      booking.dropOffLocation || "N/A",
      booking.totalDays || "N/A",
      booking.totalAmount || 0,
      booking.paymentMethod?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "N/A",
      booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : "Active",
      formatDate(booking.createdAt),
    ])

    // Combine headers and rows
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    return csvContent
  }

  // Download CSV report
  const downloadCSVReport = () => {
    const csvContent = generateCSV()
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `bookings-report-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Generate text report
  const generateTextReport = () => {
    const reportTitle = `BOOKING REPORT - ${new Date().toLocaleDateString()}\n\n`

    const summarySection = `SUMMARY\n--------\nTotal Bookings: ${summaryStats.totalBookings}\nActive Bookings: ${summaryStats.activeBookings}\nCancelled Bookings: ${summaryStats.cancelledBookings}\nTotal Revenue: Rs. ${summaryStats.totalRevenue.toLocaleString()}\n\n`

    const bookingsHeader = `BOOKINGS DETAILS\n---------------\n`

    const bookingsDetails = filteredBookings
      .map((booking, index) => {
        return (
          `Booking #${index + 1}\n` +
          `ID: ${booking._id}\n` +
          `User: ${booking.userId?.name || "N/A"}\n` +
          `Vehicle: ${booking.vehicleId?.brand || ""} ${booking.vehicleId?.model || ""}\n` +
          `Period: ${formatDate(booking.rentalStartDate)} to ${formatDate(booking.rentalEndDate)}\n` +
          `Locations: ${booking.pickUpLocation || "N/A"} to ${booking.dropOffLocation || "N/A"}\n` +
          `Amount: Rs. ${booking.totalAmount || 0}\n` +
          `Status: ${booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : "Active"}\n` +
          `Booked on: ${formatDate(booking.createdAt)}\n` +
          `---------------------------\n`
        )
      })
      .join("\n")

    return reportTitle + summarySection + bookingsHeader + bookingsDetails
  }

  // Download text report
  const downloadTextReport = () => {
    const reportContent = generateTextReport()
    const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `bookings-report-${new Date().toISOString().split("T")[0]}.txt`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Print report
  const printReport = () => {
    const printWindow = window.open("", "_blank")

    printWindow.document.write(`
      <html>
        <head>
          <title>Bookings Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #1e40af; }
            .summary { background: #f0f9ff; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #dbeafe; padding: 10px; text-align: left; }
            td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <h1>Bookings Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          
          <div class="summary">
            <h2>Summary</h2>
            <p>Total Bookings: ${summaryStats.totalBookings}</p>
            <p>Active Bookings: ${summaryStats.activeBookings}</p>
            <p>Cancelled Bookings: ${summaryStats.cancelledBookings}</p>
            <p>Total Revenue: Rs. ${summaryStats.totalRevenue.toLocaleString()}</p>
          </div>
          
          <h2>Booking Details</h2>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Vehicle</th>
                <th>Period</th>
                <th>Locations</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredBookings
                .map(
                  (booking) => `
                <tr>
                  <td>${booking.userId?.name || "N/A"}</td>
                  <td>${booking.vehicleId?.brand || ""} ${booking.vehicleId?.model || ""}</td>
                  <td>${formatDate(booking.rentalStartDate)} to ${formatDate(booking.rentalEndDate)}</td>
                  <td>${booking.pickUpLocation || "N/A"} to ${booking.dropOffLocation || "N/A"}</td>
                  <td>Rs. ${booking.totalAmount || 0}</td>
                  <td>${booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : "Active"}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="footer">
            <p>SK Rentals - Vehicle Rental System</p>
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()

    // Print after a short delay to ensure content is loaded
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  return (
    <div >
      <Header/>
      <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-xl shadow-lg mb-6 p-6 text-white">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Booking Management</h2>
            <p className="text-blue-100 mt-1">View and manage all vehicle bookings</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
            >
              <Filter size={16} />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>

            <button
              onClick={fetchBookings}
              className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-800">{summaryStats.totalBookings}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Active Bookings</p>
              <p className="text-2xl font-bold text-gray-800">{summaryStats.activeBookings}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Cancelled Bookings</p>
              <p className="text-2xl font-bold text-gray-800">{summaryStats.cancelledBookings}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <X className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">Rs. {summaryStats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-700">Filters & Search</h3>
            <button onClick={resetFilters} className="text-sm text-blue-600 hover:text-blue-800">
              Reset All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by user, vehicle, location..."
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={dateFilter.from}
                  onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={dateFilter.to}
                  onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="font-medium text-gray-700 mb-3">Generate Reports</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={downloadCSVReport}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            Export CSV
          </button>

          <button
            onClick={downloadTextReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FileText size={16} />
            Export Text Report
          </button>

          <button
            onClick={printReport}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Printer size={16} />
            Print Report
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading bookings...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort("userName")}
                  >
                    User
                    {sortConfig.key === "userName" && (
                      <span className="ml-1">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
                    )}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort("vehicleName")}
                  >
                    Vehicle
                    {sortConfig.key === "vehicleName" && (
                      <span className="ml-1">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
                    )}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort("startDate")}
                  >
                    From
                    {sortConfig.key === "startDate" && (
                      <span className="ml-1">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
                    )}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort("endDate")}
                  >
                    To
                    {sortConfig.key === "endDate" && (
                      <span className="ml-1">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
                    )}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort("amount")}
                  >
                    Amount
                    {sortConfig.key === "amount" && (
                      <span className="ml-1">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
                    )}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort("status")}
                  >
                    Status
                    {sortConfig.key === "status" && (
                      <span className="ml-1">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.userId?.name || "N/A"}</div>
                        <div className="text-sm text-gray-500">{booking.userId?.email || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.vehicleId?.brand} {booking.vehicleId?.model}
                        </div>
                        <div className="text-sm text-gray-500">{booking.vehicleId?.year || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(booking.rentalStartDate)}</div>
                        <div className="text-sm text-gray-500">{booking.pickUpLocation || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(booking.rentalEndDate)}</div>
                        <div className="text-sm text-gray-500">{booking.dropOffLocation || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(booking.totalAmount || 0)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.paymentMethod?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(booking.status)}`}
                        >
                          {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : "Active"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {(!booking.status || booking.status === "active") && (
                            <button
                              onClick={() => cancelBooking(booking._id)}
                              className="text-orange-600 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded border border-orange-200 transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            onClick={() => {
                              // Generate individual booking report
                              const reportContent = `
BOOKING DETAILS
==============

Booking ID: ${booking._id}
User: ${booking.userId?.name || "N/A"}
Vehicle: ${booking.vehicleId?.brand || ""} ${booking.vehicleId?.model || ""}
Rental Period: ${formatDate(booking.rentalStartDate)} to ${formatDate(booking.rentalEndDate)}
Duration: ${booking.totalDays || "N/A"} days
Pickup Location: ${booking.pickUpLocation || "N/A"}
Return Location: ${booking.dropOffLocation || "N/A"}
Total Amount: ${formatCurrency(booking.totalAmount || 0)}
Payment Method: ${booking.paymentMethod?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "N/A"}
Status: ${booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : "Active"}
Booking Date: ${formatDate(booking.createdAt)}

Additional Drivers: ${booking.additionalDrivers || 0}
Special Requests: ${booking.specialRequests || "None"}
                              `

                              const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8;" })
                              const url = URL.createObjectURL(blob)
                              const link = document.createElement("a")
                              link.setAttribute("href", url)
                              link.setAttribute("download", `booking-${booking._id}.txt`)
                              document.body.appendChild(link)
                              link.click()
                              document.body.removeChild(link)
                            }}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200 transition-colors"
                          >
                            Export
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                      No bookings found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination could be added here */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-sm text-gray-500">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </div>
      </div>
    </div>
    </div>
  )
}

export default BookingList
