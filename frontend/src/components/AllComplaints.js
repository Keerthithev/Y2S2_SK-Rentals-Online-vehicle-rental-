"use client"

import React from "react"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import * as XLSX from "xlsx"
import {
  AlertCircle,
  CheckCircle,
  Download,
  FileText,
  Filter,
  Loader2,
  LogOut,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  User,
  Mail,
  Phone,
  Car,
  Calendar,
  Clock,
  X,
  Info,
  ArrowUpDown,
} from "lucide-react"

const AllComplaints = () => {
  const [complaints, setComplaints] = useState([])
  const [filteredComplaints, setFilteredComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [statusMessage, setStatusMessage] = useState("")
  const [replies, setReplies] = useState({})
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sortConfig, setSortConfig] = useState({ key: "dateFiled", direction: "desc" })
  const [expandedComplaint, setExpandedComplaint] = useState(null)
  const [isExporting, setIsExporting] = useState(false)
  const navigate = useNavigate()

  // Fetch complaints on component mount
  useEffect(() => {
    fetchComplaints()
  }, [])

  // Apply filters when complaints, search query, or filters change
  useEffect(() => {
    applyFilters()
  }, [complaints, searchQuery, statusFilter, typeFilter, sortConfig])

  const fetchComplaints = async () => {
    setLoading(true)
    setError("")
    setStatusMessage("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Authentication required. Please log in.")
        setLoading(false)
        return
      }

      const headers = { Authorization: `Bearer ${token}` }
      const response = await axios.get("http://localhost:1111/api/v1/complaints/all", { headers })

      setComplaints(response.data)
    } catch (error) {
      console.error("Error fetching complaints:", error)
      setError(
        error.response?.data?.message || "Failed to load complaints. Please check your connection and try again.",
      )
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let result = [...complaints]

    // Apply search filter
    if (searchQuery) {
      const term = searchQuery.toLowerCase()
      result = result.filter(
        (complaint) =>
          (complaint.customerID?.name && complaint.customerID.name.toLowerCase().includes(term)) ||
          (complaint.customerID?.email && complaint.customerID.email.toLowerCase().includes(term)) ||
          (complaint.issueDescription && complaint.issueDescription.toLowerCase().includes(term)) ||
          (complaint.vehicleID && complaint.vehicleID.toLowerCase().includes(term)),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((complaint) => complaint.status.toLowerCase() === statusFilter.toLowerCase())
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((complaint) => complaint.issueType === typeFilter)
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        // Handle nested properties like customerID.name
        if (sortConfig.key.includes(".")) {
          const [parent, child] = sortConfig.key.split(".")
          const aValue = a[parent] ? a[parent][child] : ""
          const bValue = b[parent] ? b[parent][child] : ""

          if (aValue < bValue) {
            return sortConfig.direction === "asc" ? -1 : 1
          }
          if (aValue > bValue) {
            return sortConfig.direction === "asc" ? 1 : -1
          }
          return 0
        } else {
          // Handle date fields
          if (sortConfig.key === "dateFiled") {
            return sortConfig.direction === "asc"
              ? new Date(a.dateFiled) - new Date(b.dateFiled)
              : new Date(b.dateFiled) - new Date(a.dateFiled)
          }

          // Handle regular fields
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === "asc" ? -1 : 1
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === "asc" ? 1 : -1
          }
          return 0
        }
      })
    }

    setFilteredComplaints(result)
  }

  const resetFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setTypeFilter("all")
  }

  const handleSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const handleReplyChange = (complaintID, value) => {
    setReplies({ ...replies, [complaintID]: value })
  }

  const handleReply = async (complaintID) => {
    const reply = replies[complaintID]
    if (!reply?.trim()) {
      // Show error message
      setStatusMessage("Please enter a reply before submitting")
      setTimeout(() => setStatusMessage(""), 3000)
      return
    }

    // Confirm before submitting
    if (!window.confirm("Are you sure you want to submit this reply?")) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      const response = await axios.put(
        `http://localhost:1111/api/v1/complaints/reply/${complaintID}`,
        { reply },
        { headers },
      )

      if (response.status === 200) {
        setStatusMessage("Reply submitted successfully")
        fetchComplaints() // Refresh data
        setReplies({ ...replies, [complaintID]: "" }) // Clear input
        setTimeout(() => setStatusMessage(""), 3000)
      }
    } catch (error) {
      console.error("Error submitting reply:", error)
      setStatusMessage("Failed to submit reply. Please try again.")
      setTimeout(() => setStatusMessage(""), 5000)
    }
  }

  const exportToExcel = async () => {
    if (!window.confirm("Do you want to export all complaints to Excel?")) {
      return
    }

    setIsExporting(true)

    try {
      // Prepare data for export
      const exportData = complaints.map((complaint) => ({
        "Complaint ID": complaint._id,
        "Customer Name": complaint.customerID?.name || "N/A",
        "Customer Email": complaint.customerID?.email || "N/A",
        "Customer Phone": complaint.customerID?.phone || "N/A",
        "Issue Type": complaint.issueType,
        "Vehicle ID": complaint.vehicleID || "N/A",
        Description: complaint.issueDescription,
        Status: complaint.status,
        "Date Filed": new Date(complaint.dateFiled).toLocaleDateString(),
        Resolution: complaint.resolutionDescription || "N/A",
      }))

      // Create worksheet and workbook
      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Complaints Report")

      // Generate filename with date
      const date = new Date().toISOString().split("T")[0]
      const filename = `Complaints_Report_${date}.xlsx`

      // Write file
      XLSX.writeFile(workbook, filename)

      setStatusMessage("Export completed successfully")
      setTimeout(() => setStatusMessage(""), 3000)
    } catch (error) {
      console.error("Export error:", error)
      setStatusMessage("Failed to export data. Please try again.")
      setTimeout(() => setStatusMessage(""), 5000)
    } finally {
      setIsExporting(false)
    }
  }

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token")
      navigate("/login")
    }
  }

  const toggleExpandComplaint = (id) => {
    if (expandedComplaint === id) {
      setExpandedComplaint(null)
    } else {
      setExpandedComplaint(id)
    }
  }

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        )
      case "in progress":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <RefreshCw className="w-3 h-3 mr-1" />
            In Progress
          </span>
        )
      case "resolved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Resolved
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <MessageSquare className="mr-2 h-7 w-7 text-emerald-600" />
              All Complaints
            </h1>
            <p className="mt-1 text-gray-500">Manage and respond to customer complaints</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            <button
              onClick={exportToExcel}
              disabled={isExporting || loading || complaints.length === 0}
              className={`flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${
                (isExporting || loading || complaints.length === 0) && "opacity-50 cursor-not-allowed"
              }`}
            >
              {isExporting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
              Export to Excel
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {statusMessage && (
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
            <div className="flex">
              <Info className="h-5 w-5 text-blue-400" />
              <div className="ml-3">
                <p className="text-sm text-blue-700">{statusMessage}</p>
              </div>
              <button onClick={() => setStatusMessage("")} className="ml-auto text-blue-500 hover:text-blue-700">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button onClick={() => setError("")} className="ml-auto text-red-500 hover:text-red-700">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Filter className="mr-2 h-5 w-5 text-gray-500" />
              Filter Complaints
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    placeholder="Search by name, email, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div>
                <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Type
                </label>
                <select
                  id="typeFilter"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">All Types</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="service">Service</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={resetFilters}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Complaints ({filteredComplaints.length})</h2>
            <button
              onClick={fetchComplaints}
              className="flex items-center text-sm text-emerald-600 hover:text-emerald-800"
            >
              <RefreshCw className="mr-1 h-4 w-4" />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
                <p className="mt-4 text-gray-600">Loading complaints...</p>
              </div>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
              <p className="text-gray-500">
                {complaints.length > 0
                  ? "Try adjusting your search filters"
                  : "There are no complaints in the system yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("customerID.name")}
                    >
                      <div className="flex items-center">
                        Customer
                        {sortConfig.key === "customerID.name" && <ArrowUpDown className="ml-1 h-4 w-4" />}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("issueType")}
                    >
                      <div className="flex items-center">
                        Issue Type
                        {sortConfig.key === "issueType" && <ArrowUpDown className="ml-1 h-4 w-4" />}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center">
                        Status
                        {sortConfig.key === "status" && <ArrowUpDown className="ml-1 h-4 w-4" />}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("dateFiled")}
                    >
                      <div className="flex items-center">
                        Date Filed
                        {sortConfig.key === "dateFiled" && <ArrowUpDown className="ml-1 h-4 w-4" />}
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredComplaints.map((complaint) => (
                    <React.Fragment key={complaint._id}>
                      <tr
                        className={`hover:bg-gray-50 ${expandedComplaint === complaint._id ? "bg-gray-50" : ""}`}
                        onClick={() => toggleExpandComplaint(complaint._id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {complaint.customerID?.name || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {complaint.customerID?.email || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {complaint.issueType === "vehicle" ? (
                              <Car className="h-5 w-5 text-gray-500 mr-1.5" />
                            ) : (
                              <MessageSquare className="h-5 w-5 text-gray-500 mr-1.5" />
                            )}
                            <span className="capitalize">{complaint.issueType}</span>
                          </div>
                          {complaint.vehicleID && (
                            <div className="text-xs text-gray-500 mt-1">Vehicle ID: {complaint.vehicleID}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(complaint.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-500 mr-1.5" />
                            <span>{new Date(complaint.dateFiled).toLocaleDateString()}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(complaint.dateFiled).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">{complaint.issueDescription}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleExpandComplaint(complaint._id)
                            }}
                            className="text-emerald-600 hover:text-emerald-900"
                          >
                            {expandedComplaint === complaint._id ? "Hide Details" : "View Details"}
                          </button>
                        </td>
                      </tr>
                      {expandedComplaint === complaint._id && (
                        <tr className="bg-gray-50">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="border-t border-b border-gray-200 py-4 space-y-4">
                              {/* Detailed Information */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500 mb-2">Customer Information</h4>
                                  <div className="bg-white p-4 rounded-md shadow-sm">
                                    <div className="flex items-center mb-2">
                                      <User className="h-5 w-5 text-gray-400 mr-2" />
                                      <span className="font-medium">{complaint.customerID?.name || "N/A"}</span>
                                    </div>
                                    <div className="flex items-center mb-2">
                                      <Mail className="h-5 w-5 text-gray-400 mr-2" />
                                      <span>{complaint.customerID?.email || "N/A"}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <Phone className="h-5 w-5 text-gray-400 mr-2" />
                                      <span>{complaint.customerID?.phone || "N/A"}</span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500 mb-2">Complaint Details</h4>
                                  <div className="bg-white p-4 rounded-md shadow-sm">
                                    <div className="flex items-center mb-2">
                                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                                      <span className="font-medium">Complaint ID: {complaint._id}</span>
                                    </div>
                                    {complaint.vehicleID && (
                                      <div className="flex items-center mb-2">
                                        <Car className="h-5 w-5 text-gray-400 mr-2" />
                                        <span>Vehicle ID: {complaint.vehicleID}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center">
                                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                                      <span>Filed on: {new Date(complaint.dateFiled).toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Full Description */}
                              <div>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Issue Description</h4>
                                <div className="bg-white p-4 rounded-md shadow-sm">
                                  <p className="text-gray-700 whitespace-pre-line">{complaint.issueDescription}</p>
                                </div>
                              </div>

                              {/* Resolution (if any) */}
                              {complaint.resolutionDescription && (
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500 mb-2">Resolution</h4>
                                  <div className="bg-white p-4 rounded-md shadow-sm">
                                    <p className="text-gray-700 whitespace-pre-line">
                                      {complaint.resolutionDescription}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Reply Form (if not resolved) */}
                              {complaint.status !== "Resolved" && (
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500 mb-2">Reply to Customer</h4>
                                  <div className="bg-white p-4 rounded-md shadow-sm">
                                    <textarea
                                      value={replies[complaint._id] || ""}
                                      onChange={(e) => handleReplyChange(complaint._id, e.target.value)}
                                      placeholder="Enter your reply to the customer..."
                                      className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                      rows={4}
                                    />
                                    <div className="mt-3 flex justify-end">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleReply(complaint._id)
                                        }}
                                        className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                                      >
                                        <Send className="mr-2 h-4 w-4" />
                                        Submit Reply
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AllComplaints
