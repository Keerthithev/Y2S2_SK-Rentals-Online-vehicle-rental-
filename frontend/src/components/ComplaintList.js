"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { jwtDecode } from "jwt-decode"
import { useNavigate } from "react-router-dom"
import Header from "./layouts/Header"
import Footer from "./layouts/Footer"
import {
  AlertCircle,
  CheckCircle,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Edit,
  X,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  MessageSquare,
} from "lucide-react"

const ComplaintsList = () => {
  const [complaints, setComplaints] = useState([])
  const [filteredComplaints, setFilteredComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [userId, setUserId] = useState("")
  const [userRole, setUserRole] = useState("")
  const [editedComplaint, setEditedComplaint] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sortConfig, setSortConfig] = useState({ key: "dateFiled", direction: "descending" })
  const [showFilters, setShowFilters] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchUserData()
  }, [])

  useEffect(() => {
    if (userId) {
      fetchComplaints()
    }
  }, [userId, userRole])

  useEffect(() => {
    applyFiltersAndSort()
  }, [complaints, searchTerm, statusFilter, typeFilter, sortConfig])

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      const decodedToken = jwtDecode(token)
      setUserRole(decodedToken.role)

      const response = await axios.get("http://localhost:1111/api/v1/myprofile", {
        headers: { Authorization: `Bearer ${token}` },
      })

      setUserId(response.data.user._id)
    } catch (error) {
      setError("Error fetching user data. Please try again.")
      console.error("Error fetching user data:", error)
      setLoading(false)
    }
  }

  const fetchComplaints = async () => {
    setIsRefreshing(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      // Determine which API endpoint to use based on user role
      const url =
        userRole === "admin" || userRole === "staff"
          ? "http://localhost:1111/api/v1/complaints"
          : `http://localhost:1111/api/v1/complaints/${userId}`

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Ensure complaints is always an array
      let complaintsData = []
      if (Array.isArray(response.data)) {
        complaintsData = response.data
      } else if (response.data && typeof response.data === "object") {
        // Check for common API response patterns
        if (Array.isArray(response.data.complaints)) {
          complaintsData = response.data.complaints
        } else if (Array.isArray(response.data.data)) {
          complaintsData = response.data.data
        } else if (response.data.data && typeof response.data.data === "object" && !Array.isArray(response.data.data)) {
          // If data is an object of objects, convert to array
          complaintsData = Object.values(response.data.data)
        }
      }

      setComplaints(complaintsData)
      setError("")
    } catch (error) {
      setError("Error fetching complaints. Please try again.")
      console.error("Error fetching complaints:", error)
      // Ensure complaints is an array even on error
      setComplaints([])
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleDelete = async (complaintId) => {
    try {
      // Show confirmation dialog
      const confirmDelete = window.confirm("Are you sure you want to delete this complaint?")
      if (!confirmDelete) return

      await axios.delete(`http://localhost:1111/api/v1/complaints/${complaintId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })

      // Update the complaints list
      setComplaints(complaints.filter((complaint) => complaint._id !== complaintId))
    } catch (error) {
      console.error("Error deleting complaint:", error)
      alert("Failed to delete complaint. Please try again.")
    }
  }

  const handleEdit = (complaint) => {
    if (complaint.status === "Resolved") {
      alert("Resolved complaints cannot be edited.")
      return
    }
    setEditedComplaint({ ...complaint })
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === "issueType" && value === "service") {
      setEditedComplaint((prevState) => ({
        ...prevState,
        [name]: value,
        vehicleID: "",
      }))
    } else {
      setEditedComplaint((prevState) => ({
        ...prevState,
        [name]: value,
      }))
    }
  }

  const handleSaveEdit = async () => {
    try {
      const { issueType, vehicleID, issueDescription } = editedComplaint

      if (!issueType || !issueDescription) {
        alert("All required fields must be filled.")
        return
      }

      const complaintData = {
        issueType,
        issueDescription,
      }

      if (issueType === "vehicle" && vehicleID) {
        complaintData.vehicleID = vehicleID
      }

      await axios.put(`http://localhost:1111/api/v1/complaints/${editedComplaint._id}`, complaintData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })

      // Update the complaints list
      fetchComplaints()
      setEditedComplaint(null)
    } catch (error) {
      console.error("Error updating complaint:", error)
      alert("Failed to update complaint. Please try again.")
    }
  }

  const handleSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  const applyFiltersAndSort = () => {
    // Ensure complaints is an array before filtering
    if (!Array.isArray(complaints)) {
      console.error("Complaints is not an array:", complaints)
      setFilteredComplaints([])
      return
    }

    let filtered = [...complaints]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (complaint) =>
          complaint.issueDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          complaint.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          complaint.vehicleID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          complaint.resolutionDescription?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((complaint) => complaint.status === statusFilter)
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((complaint) => complaint.issueType === typeFilter)
    }

    // Apply sort
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key]
      let bValue = b[sortConfig.key]

      // Handle date fields
      if (sortConfig.key === "dateFiled") {
        aValue = new Date(a.dateFiled).getTime()
        bValue = new Date(b.dateFiled).getTime()
      }

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1
      }
      return 0
    })

    setFilteredComplaints(filtered)
  }

  const exportToCSV = () => {
    // Create CSV content
    const headers = [
      "Customer Name",
      "Issue Type",
      "Vehicle ID",
      "Status",
      "Date Filed",
      "Issue Description",
      "Resolution",
    ]
    const csvContent = [
      headers.join(","),
      ...filteredComplaints.map((complaint) =>
        [
          `"${complaint.customerName || ""}"`,
          `"${complaint.issueType || ""}"`,
          `"${complaint.vehicleID || "N/A"}"`,
          `"${complaint.status || ""}"`,
          `"${new Date(complaint.dateFiled).toLocaleDateString()}"`,
          `"${(complaint.issueDescription || "").replace(/"/g, '""')}"`,
          `"${(complaint.resolutionDescription || "N/A").replace(/"/g, '""')}"`,
        ].join(","),
      ),
    ].join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `complaints-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Format date for better display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "In Progress":
        return "bg-blue-100 text-blue-800"
      case "Resolved":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {userRole === "admin" || userRole === "staff" ? "All Complaints" : "My Complaints"}
            </h1>
            <p className="text-gray-600 mt-1">
              {userRole === "admin" || userRole === "staff"
                ? "Manage and respond to customer complaints"
                : "Track and manage your submitted complaints"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={fetchComplaints}
              disabled={isRefreshing}
              className={`px-3 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 text-sm ${
                isRefreshing ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button
              onClick={exportToCSV}
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 text-sm"
            >
              <Download className="h-4 w-4" /> Export
            </button>
            <button
              onClick={() => navigate("/complaintform")}
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-all duration-200 flex items-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4" /> New Complaint
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search complaints..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-sm"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="vehicle">Vehicle Issues</option>
                    <option value="service">Service Issues</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <div className="flex gap-2">
                    <select
                      value={sortConfig.key}
                      onChange={(e) => handleSort(e.target.value)}
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                      <option value="dateFiled">Date Filed</option>
                      <option value="status">Status</option>
                      <option value="issueType">Issue Type</option>
                    </select>
                    <button
                      onClick={() =>
                        setSortConfig({
                          ...sortConfig,
                          direction: sortConfig.direction === "ascending" ? "descending" : "ascending",
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      {sortConfig.direction === "ascending" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white shadow rounded-lg p-8 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading complaints...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">{filteredComplaints.length}</span> of{" "}
                <span className="font-medium">{complaints.length}</span> complaints
              </p>
            </div>

            {/* Complaints Table */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("customerName")}
                      >
                        <div className="flex items-center">
                          Customer
                          {sortConfig.key === "customerName" && (
                            <span className="ml-1">
                              {sortConfig.direction === "ascending" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("issueType")}
                      >
                        <div className="flex items-center">
                          Issue Type
                          {sortConfig.key === "issueType" && (
                            <span className="ml-1">
                              {sortConfig.direction === "ascending" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center">
                          Status
                          {sortConfig.key === "status" && (
                            <span className="ml-1">
                              {sortConfig.direction === "ascending" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("dateFiled")}
                      >
                        <div className="flex items-center">
                          Date Filed
                          {sortConfig.key === "dateFiled" && (
                            <span className="ml-1">
                              {sortConfig.direction === "ascending" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Description
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Resolution
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredComplaints.length > 0 ? (
                      filteredComplaints.map((complaint) => (
                        <tr key={complaint._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 font-medium">
                                  {complaint.customerName ? complaint.customerName.charAt(0).toUpperCase() : "U"}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{complaint.customerName}</div>
                                {userRole === "admin" || userRole === "staff" ? (
                                  <div className="text-xs text-gray-500">ID: {complaint.customerID}</div>
                                ) : null}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 capitalize">
                              {complaint.issueType === "vehicle" ? (
                                <div className="flex flex-col">
                                  <span>Vehicle Issue</span>
                                  {complaint.vehicleID && (
                                    <span className="text-xs text-gray-500">Vehicle ID: {complaint.vehicleID}</span>
                                  )}
                                </div>
                              ) : (
                                "Service Issue"
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                complaint.status,
                              )}`}
                            >
                              {complaint.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(complaint.dateFiled)}</div>
                          </td>
                          <td className="px-6 py-4">
                            {editedComplaint && editedComplaint._id === complaint._id ? (
                              <textarea
                                name="issueDescription"
                                value={editedComplaint.issueDescription}
                                onChange={handleChange}
                                className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                                rows={3}
                              />
                            ) : (
                              <div className="text-sm text-gray-900 max-w-xs truncate">
                                {complaint.issueDescription}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {complaint.resolutionDescription || (
                                <span className="text-gray-500 italic">Not resolved yet</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              {editedComplaint && editedComplaint._id === complaint._id ? (
                                <>
                                  <button
                                    onClick={handleSaveEdit}
                                    className="text-green-600 hover:text-green-900"
                                    title="Save changes"
                                  >
                                    <CheckCircle className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => setEditedComplaint(null)}
                                    className="text-gray-600 hover:text-gray-900"
                                    title="Cancel"
                                  >
                                    <X className="h-5 w-5" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  {userRole === "user" &&
                                    complaint.customerID === userId &&
                                    complaint.status !== "Resolved" && (
                                      <>
                                        <button
                                          onClick={() => handleEdit(complaint)}
                                          className="text-indigo-600 hover:text-indigo-900"
                                          title="Edit complaint"
                                        >
                                          <Edit className="h-5 w-5" />
                                        </button>
                                        <button
                                          onClick={() => handleDelete(complaint._id)}
                                          className="text-red-600 hover:text-red-900"
                                          title="Delete complaint"
                                        >
                                          <Trash2 className="h-5 w-5" />
                                        </button>
                                      </>
                                    )}
                                  {(userRole === "admin" || userRole === "staff") && (
                                    <button
                                      onClick={() => navigate(`/complaint/${complaint._id}`)}
                                      className="text-indigo-600 hover:text-indigo-900"
                                      title="View details"
                                    >
                                      <ExternalLink className="h-5 w-5" />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <MessageSquare className="h-10 w-10 text-gray-300 mb-2" />
                            <p className="text-lg font-medium text-gray-900 mb-1">No complaints found</p>
                            <p className="text-gray-500 mb-4">
                              {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                                ? "Try adjusting your search filters"
                                : "You haven't submitted any complaints yet"}
                            </p>
                            <button
                              onClick={() => navigate("/complaintform")}
                              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
                            >
                              Submit a Complaint
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default ComplaintsList
