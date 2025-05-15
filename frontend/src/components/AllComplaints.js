"use client"

import React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate, useLocation } from "react-router-dom"
import * as XLSX from "xlsx"
import {
  AlertCircle,
  CheckCircle,
  Download,
  FileText,
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
  ChevronDown,
  ChevronUp,
  Bell,
  Menu,
  Sliders,
  Timer,
} from "lucide-react"
import {
  BarChart,
  LineChart,
  PieChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  Pie,
} from "recharts"

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isFilterExpanded, setIsFilterExpanded] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState("overview")
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState([])
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  // Fetch complaints on component mount
  useEffect(() => {
    fetchComplaints()
  }, [])

  // Apply filters when complaints, search query, or filters change
  useEffect(() => {
    applyFilters()
  }, [complaints, searchQuery, statusFilter, typeFilter, sortConfig])

  // Refresh complaints when navigating back to this page
  const location = useLocation()
  useEffect(() => {
    // This will run when the component mounts or when the location changes
    // (i.e., when navigating back to this page)
    fetchComplaints()
  }, [location])

  // Set up polling to check for new complaints every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchComplaints()
    }, 30000) // 30 seconds

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId)
  }, [])

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

      // Log the actual response data to help diagnose the issue
      console.log("API Response:", response.data)

      // Store the current complaints IDs before updating state
      const previousComplaintIds = new Set(complaints.map((c) => c._id))

      // Process the response data
      let complaintsData = []

      if (Array.isArray(response.data)) {
        complaintsData = response.data
      } else if (response.data && typeof response.data === "object") {
        // Check for common API response patterns
        if (Array.isArray(response.data.complaints)) {
          complaintsData = response.data.complaints
        } else if (Array.isArray(response.data.data)) {
          complaintsData = response.data.data
        } else if (Array.isArray(response.data.results)) {
          complaintsData = response.data.results
        } else if (response.data.data && typeof response.data.data === "object" && !Array.isArray(response.data.data)) {
          // If data is an object of objects, convert to array
          const complaintsArray = Object.values(response.data.data)
          if (complaintsArray.length > 0) {
            complaintsData = complaintsArray
          } else {
            setComplaints([])
            setError("Received empty data from server")
            setLoading(false)
            return
          }
        } else {
          // If we can't find an array in the common places, log the structure and set empty array
          console.error("Unexpected data structure:", JSON.stringify(response.data, null, 2))
          setError(
            `Invalid data format: ${typeof response.data === "object" ? "Object with keys: " + Object.keys(response.data).join(", ") : typeof response.data}`,
          )
          setComplaints([])
          setLoading(false)
          return
        }
      } else {
        // If response.data is not in expected format, set to empty array and show error
        setError(`Invalid data type: ${typeof response.data}`)
        console.error("Invalid data type:", typeof response.data, response.data)
        setComplaints([])
        setLoading(false)
        return
      }

      // Update the complaints state with the processed data
      setComplaints(complaintsData)

      // Check for new complaints to add to notifications
      if (Array.isArray(complaintsData) && complaintsData.length > 0) {
        const newComplaints = complaintsData.filter((c) => !previousComplaintIds.has(c._id))

        if (newComplaints.length > 0) {
          const newNotifications = newComplaints.map((complaint) => ({
            id: complaint._id,
            title: `New ${complaint.issueType} complaint`,
            message: `From ${complaint.customerID?.name || "Unknown Customer"}`,
            time: new Date(),
            read: false,
          }))

          setNotifications((prev) => [...newNotifications, ...prev])
          setUnreadNotifications((prev) => prev + newComplaints.length)
        }
      }
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
    // Ensure complaints is an array before spreading
    if (!Array.isArray(complaints)) {
      console.error("Complaints is not an array:", complaints)
      setFilteredComplaints([])
      return
    }

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
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        )
      case "in progress":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <RefreshCw className="w-3 h-3 mr-1" />
            In Progress
          </span>
        )
      case "resolved":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Resolved
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            {status}
          </span>
        )
    }
  }

  // Calculate complaint statistics
  const getComplaintStats = () => {
    if (!Array.isArray(complaints)) return { total: 0, pending: 0, inProgress: 0, resolved: 0 }

    const total = complaints.length
    const pending = complaints.filter((c) => c.status.toLowerCase() === "pending").length
    const inProgress = complaints.filter((c) => c.status.toLowerCase() === "in progress").length
    const resolved = complaints.filter((c) => c.status.toLowerCase() === "resolved").length

    return { total, pending, inProgress, resolved }
  }

  // Generate analytics data
  const generateAnalyticsData = () => {
    if (!Array.isArray(complaints) || complaints.length === 0) {
      return {
        statusDistribution: [],
        typeDistribution: [],
        monthlyTrend: [],
        avgResolutionTime: 0,
        responseRate: 0,
        customerSatisfaction: 0,
      }
    }

    // Status distribution
    const statusCounts = {
      pending: 0,
      "in progress": 0,
      resolved: 0,
    }

    complaints.forEach((complaint) => {
      const status = complaint.status.toLowerCase()
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++
      }
    })

    const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }))

    // Type distribution
    const typeCounts = {}
    complaints.forEach((complaint) => {
      const type = complaint.issueType || "unknown"
      typeCounts[type] = (typeCounts[type] || 0) + 1
    })

    const typeDistribution = Object.entries(typeCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }))

    // Monthly trend (last 6 months)
    const now = new Date()
    const monthlyData = {}

    // Initialize the last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now)
      d.setMonth(now.getMonth() - i)
      const monthYear = `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`
      monthlyData[monthYear] = { month: monthYear, total: 0, resolved: 0 }
    }

    // Fill in the data
    complaints.forEach((complaint) => {
      const date = new Date(complaint.dateFiled)
      const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`

      // Only count if it's within the last 6 months
      if (monthlyData[monthYear]) {
        monthlyData[monthYear].total++
        if (complaint.status.toLowerCase() === "resolved") {
          monthlyData[monthYear].resolved++
        }
      }
    })

    const monthlyTrend = Object.values(monthlyData)

    // Calculate average resolution time (in days)
    let totalResolutionTime = 0
    let resolvedCount = 0

    complaints.forEach((complaint) => {
      if (complaint.status.toLowerCase() === "resolved" && complaint.dateFiled && complaint.resolutionDate) {
        const filedDate = new Date(complaint.dateFiled)
        const resolvedDate = new Date(complaint.resolutionDate)
        const timeDiff = resolvedDate - filedDate
        const daysDiff = timeDiff / (1000 * 3600 * 24)
        totalResolutionTime += daysDiff
        resolvedCount++
      }
    })

    const avgResolutionTime = resolvedCount > 0 ? (totalResolutionTime / resolvedCount).toFixed(1) : 0

    // Response rate (percentage of complaints that have received a response)
    const respondedCount = complaints.filter((c) => c.hasResponse || c.status.toLowerCase() !== "pending").length
    const responseRate = complaints.length > 0 ? ((respondedCount / complaints.length) * 100).toFixed(1) : 0

    // Customer satisfaction (mock data - would normally come from ratings)
    const customerSatisfaction = 85

    return {
      statusDistribution,
      typeDistribution,
      monthlyTrend,
      avgResolutionTime,
      responseRate,
      customerSatisfaction,
    }
  }

  const stats = getComplaintStats()
  const analyticsData = generateAnalyticsData()

  // Colors for charts
  const COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"]
  const STATUS_COLORS = {
    Pending: "#f59e0b",
    "In Progress": "#0ea5e9",
    Resolved: "#10b981",
  }

  // Custom Card Component
  const Card = ({ children, className = "" }) => (
    <div className={`bg-white shadow rounded-lg overflow-hidden ${className}`}>{children}</div>
  )

  const CardHeader = ({ children, className = "" }) => (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>{children}</div>
  )

  const CardContent = ({ children, className = "" }) => <div className={`p-6 ${className}`}>{children}</div>

  const CardTitle = ({ children, className = "" }) => (
    <h3 className={`text-lg font-medium text-gray-900 ${className}`}>{children}</h3>
  )

  const CardDescription = ({ children, className = "" }) => (
    <p className={`mt-1 text-sm text-gray-500 ${className}`}>{children}</p>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 fixed w-full z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <MessageSquare className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">ComplaintManager</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a
                  href="#"
                  className={`${activeTab === "overview" ? "border-indigo-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  onClick={() => setActiveTab("overview")}
                >
                  Dashboard
                </a>
                <a
                  href="#"
                  className={`${activeTab === "analytics" ? "border-indigo-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  onClick={() => setActiveTab("analytics")}
                >
                  Analytics
                </a>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications)
                    if (unreadNotifications > 0) {
                      setUnreadNotifications(0)
                      setNotifications(notifications.map((n) => ({ ...n, read: true })))
                    }
                  }}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 relative"
                >
                  <span className="sr-only">View notifications</span>
                  <Bell className="h-6 w-6" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </button>

                {showNotifications && (
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-sm text-gray-500">No notifications</div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`px-4 py-3 hover:bg-gray-50 ${!notification.read ? "bg-blue-50" : ""}`}
                            >
                              <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5">
                                  <MessageSquare className="h-5 w-5 text-indigo-500" />
                                </div>
                                <div className="ml-3 w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                  <p className="text-sm text-gray-500">{notification.message}</p>
                                  <p className="mt-1 text-xs text-gray-500">
                                    {new Date(notification.time).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="border-t border-gray-200 px-4 py-2">
                          <button
                            onClick={() => setNotifications([])}
                            className="text-xs text-indigo-600 hover:text-indigo-900"
                          >
                            Clear all notifications
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-3 text-sm text-gray-500 hover:text-gray-700 flex items-center"
                >
                  <span className="mr-1">Logout</span>
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <span className="sr-only">Open main menu</span>
                <Menu className="block h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <a
                href="#"
                className={`${activeTab === "overview" ? "bg-indigo-50 border-indigo-500 text-indigo-700" : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => {
                  setActiveTab("overview")
                  setIsMobileMenuOpen(false)
                }}
              >
                Dashboard
              </a>
              <a
                href="#"
                className={`${activeTab === "analytics" ? "bg-indigo-50 border-indigo-500 text-indigo-700" : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => {
                  setActiveTab("analytics")
                  setIsMobileMenuOpen(false)
                }}
              >
                Analytics
              </a>
              <button
                onClick={handleLogout}
                className="w-full text-left border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      <div className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {activeTab === "analytics" ? "Complaints Analytics" : "Complaint Management"}
            </h1>
            <p className="mt-1 text-sm text-gray-500 max-w-2xl">
              {activeTab === "analytics"
                ? "Analyze complaint trends, response times, and customer satisfaction metrics."
                : "View, filter, and respond to customer complaints. Track status and manage resolutions efficiently."}
            </p>
          </div>

          {/* Analytics Dashboard */}
          {activeTab === "analytics" && (
            <div className="mb-8">
              {/* Custom Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveAnalyticsTab("overview")}
                    className={`${
                      activeAnalyticsTab === "overview"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveAnalyticsTab("trends")}
                    className={`${
                      activeAnalyticsTab === "trends"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Trends
                  </button>
                  <button
                    onClick={() => setActiveAnalyticsTab("performance")}
                    className={`${
                      activeAnalyticsTab === "performance"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Performance
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              {activeAnalyticsTab === "overview" && (
                <div className="space-y-6">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Complaints</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-indigo-500 rounded-md p-2">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-2xl font-semibold text-gray-900">{stats.total}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Avg. Resolution Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-blue-500 rounded-md p-2">
                            <Timer className="h-5 w-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-2xl font-semibold text-gray-900">
                              {analyticsData.avgResolutionTime} <span className="text-sm text-gray-500">days</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Response Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-emerald-500 rounded-md p-2">
                            <MessageSquare className="h-5 w-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-2xl font-semibold text-gray-900">{analyticsData.responseRate}%</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Customer Satisfaction</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-amber-500 rounded-md p-2">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-2xl font-semibold text-gray-900">
                              {analyticsData.customerSatisfaction}%
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Charts Row */}
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-medium">Complaint Status Distribution</CardTitle>
                        <CardDescription>Current distribution of complaint statuses</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={analyticsData.statusDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {analyticsData.statusDistribution.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-medium">Complaint Type Distribution</CardTitle>
                        <CardDescription>Distribution of complaints by issue type</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analyticsData.typeDistribution}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="value" name="Count" fill="#4f46e5" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeAnalyticsTab === "trends" && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">Monthly Complaint Trends</CardTitle>
                      <CardDescription>Number of complaints filed and resolved over the last 6 months</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={analyticsData.monthlyTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="total" name="Total Filed" stroke="#4f46e5" strokeWidth={2} />
                            <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeAnalyticsTab === "performance" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-medium">Resolution Time Trend</CardTitle>
                        <CardDescription>Average days to resolve complaints by month</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={[
                                { month: "Jan", time: 5.2 },
                                { month: "Feb", time: 4.8 },
                                { month: "Mar", time: 4.3 },
                                { month: "Apr", time: 3.9 },
                                { month: "May", time: 3.5 },
                                { month: "Jun", time: 3.2 },
                              ]}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="time" name="Days" fill="#0ea5e9" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg font-medium">Customer Satisfaction</CardTitle>
                        <CardDescription>Satisfaction ratings over time</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={[
                                { month: "Jan", satisfaction: 78 },
                                { month: "Feb", satisfaction: 80 },
                                { month: "Mar", satisfaction: 82 },
                                { month: "Apr", satisfaction: 79 },
                                { month: "May", satisfaction: 83 },
                                { month: "Jun", satisfaction: 85 },
                              ]}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis domain={[70, 90]} />
                              <Tooltip />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="satisfaction"
                                name="Satisfaction %"
                                stroke="#f59e0b"
                                strokeWidth={2}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stats Cards */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Complaints</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{stats.total}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-amber-500 rounded-md p-3">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{stats.pending}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <RefreshCw className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{stats.inProgress}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-emerald-500 rounded-md p-3">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Resolved</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{stats.resolved}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "overview" && (
            <>
              {/* Status Messages */}
              {statusMessage && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <Info className="h-5 w-5 text-blue-400" />
                    <div className="ml-3 flex-1">
                      <p className="text-sm text-blue-700">{statusMessage}</p>
                    </div>
                    <button onClick={() => setStatusMessage("")} className="text-blue-500 hover:text-blue-700">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3 flex-1">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                    <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
                <div
                  className="px-6 py-4 border-b border-gray-200 flex justify-between items-center cursor-pointer"
                  onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                >
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <Sliders className="mr-2 h-5 w-5 text-indigo-500" />
                    Filter Complaints
                  </h2>
                  <button className="text-gray-400 hover:text-gray-500">
                    {isFilterExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                </div>

                {isFilterExpanded && (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                          Search
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="search"
                            placeholder="Name, email, or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <select
                          id="statusFilter"
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="all">All Statuses</option>
                          <option value="pending">Pending</option>
                          <option value="in progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700">
                          Issue Type
                        </label>
                        <select
                          id="typeFilter"
                          value={typeFilter}
                          onChange={(e) => setTypeFilter(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
                <h2 className="text-xl font-semibold text-gray-900">Complaints ({filteredComplaints.length})</h2>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={fetchComplaints}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </button>
                  <button
                    onClick={exportToExcel}
                    disabled={isExporting || loading || complaints.length === 0}
                    className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      (isExporting || loading || complaints.length === 0) && "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    {isExporting ? (
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Export to Excel
                  </button>
                </div>
              </div>

              {/* Complaints Table */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                {loading ? (
                  <div className="p-12 flex justify-center">
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
                      <p className="mt-4 text-gray-600">Loading complaints...</p>
                    </div>
                  </div>
                ) : filteredComplaints.length === 0 ? (
                  <div className="p-12 text-center">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      {complaints.length > 0
                        ? "Try adjusting your search filters to find what you're looking for."
                        : "There are no complaints in the system yet. New complaints will appear here when customers submit them."}
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
                              {sortConfig.key === "customerID.name" && (
                                <ArrowUpDown className="ml-1 h-4 w-4 text-indigo-500" />
                              )}
                            </div>
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort("issueType")}
                          >
                            <div className="flex items-center">
                              Issue Type
                              {sortConfig.key === "issueType" && (
                                <ArrowUpDown className="ml-1 h-4 w-4 text-indigo-500" />
                              )}
                            </div>
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort("status")}
                          >
                            <div className="flex items-center">
                              Status
                              {sortConfig.key === "status" && <ArrowUpDown className="ml-1 h-4 w-4 text-indigo-500" />}
                            </div>
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSort("dateFiled")}
                          >
                            <div className="flex items-center">
                              Date Filed
                              {sortConfig.key === "dateFiled" && (
                                <ArrowUpDown className="ml-1 h-4 w-4 text-indigo-500" />
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
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-start">
                                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <User className="h-5 w-5 text-indigo-600" />
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
                                <div className="text-sm text-gray-900 max-w-xs truncate">
                                  {complaint.issueDescription}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => toggleExpandComplaint(complaint._id)}
                                  className="text-indigo-600 hover:text-indigo-900 font-medium"
                                >
                                  {expandedComplaint === complaint._id ? "Hide Details" : "View Details"}
                                </button>
                              </td>
                            </tr>
                            {expandedComplaint === complaint._id && (
                              <tr className="bg-gray-50">
                                <td colSpan={6} className="px-6 py-4">
                                  <div className="border-t border-b border-gray-200 py-4 space-y-6">
                                    {/* Detailed Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                                          <User className="h-4 w-4 mr-1 text-gray-400" />
                                          Customer Information
                                        </h4>
                                        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                                          <div className="flex items-center mb-3">
                                            <User className="h-5 w-5 text-indigo-500 mr-2" />
                                            <span className="font-medium">{complaint.customerID?.name || "N/A"}</span>
                                          </div>
                                          <div className="flex items-center mb-3">
                                            <Mail className="h-5 w-5 text-indigo-500 mr-2" />
                                            <span>{complaint.customerID?.email || "N/A"}</span>
                                          </div>
                                          <div className="flex items-center">
                                            <Phone className="h-5 w-5 text-indigo-500 mr-2" />
                                            <span>{complaint.customerID?.phone || "N/A"}</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                                          <FileText className="h-4 w-4 mr-1 text-gray-400" />
                                          Complaint Details
                                        </h4>
                                        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                                          <div className="flex items-center mb-3">
                                            <FileText className="h-5 w-5 text-indigo-500 mr-2" />
                                            <span className="font-medium">Complaint ID: {complaint._id}</span>
                                          </div>
                                          {complaint.vehicleID && (
                                            <div className="flex items-center mb-3">
                                              <Car className="h-5 w-5 text-indigo-500 mr-2" />
                                              <span>Vehicle ID: {complaint.vehicleID}</span>
                                            </div>
                                          )}
                                          <div className="flex items-center">
                                            <Calendar className="h-5 w-5 text-indigo-500 mr-2" />
                                            <span>Filed on: {new Date(complaint.dateFiled).toLocaleString()}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Full Description */}
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                                        <MessageSquare className="h-4 w-4 mr-1 text-gray-400" />
                                        Issue Description
                                      </h4>
                                      <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                                        <p className="text-gray-700 whitespace-pre-line">
                                          {complaint.issueDescription}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Resolution (if any) */}
                                    {complaint.resolutionDescription && (
                                      <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                                          <CheckCircle className="h-4 w-4 mr-1 text-gray-400" />
                                          Resolution
                                        </h4>
                                        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                                          <p className="text-gray-700 whitespace-pre-line">
                                            {complaint.resolutionDescription}
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Reply Form (if not resolved) */}
                                    {complaint.status !== "Resolved" && (
                                      <div>
                                        <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                                          <Send className="h-4 w-4 mr-1 text-gray-400" />
                                          Reply to Customer
                                        </h4>
                                        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                                          <textarea
                                            value={replies[complaint._id] || ""}
                                            onChange={(e) => handleReplyChange(complaint._id, e.target.value)}
                                            placeholder="Enter your reply to the customer..."
                                            className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            rows={4}
                                          />
                                          <div className="mt-4 flex justify-end">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                handleReply(complaint._id)
                                              }}
                                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AllComplaints
