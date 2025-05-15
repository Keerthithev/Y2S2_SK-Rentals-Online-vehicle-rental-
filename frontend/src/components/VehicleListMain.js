"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate, useLocation } from "react-router-dom"
import * as XLSX from "xlsx"
import {
  Car,
  Search,
  Calendar,
  Filter,
  Edit,
  Trash2,
  Save,
  X,
  Download,
  RefreshCw,
  Bell,
  LogOut,
  Plus,
  FileText,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Menu,
  Settings,
  List,
  Clock,
} from "lucide-react"
import Swal from "sweetalert2"

function VehicleListMain() {
  const [vehicles, setVehicles] = useState([])
  const [filteredVehicles, setFilteredVehicles] = useState([])
  const [searchVehicleId, setSearchVehicleId] = useState("")
  const [searchDate, setSearchDate] = useState("")
  const [searchType, setSearchType] = useState("")
  const [reminders, setReminders] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "descending" })
  const [vehiclesList, setVehiclesList] = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showDueSoon, setShowDueSoon] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Add the maintenance type intervals mapping
  const maintenanceIntervals = {
    "Oil Change": 90,
    "Brake Inspection": 180,
    "Tire Replacement": 365,
    "Engine Repair": null, // As needed (skip)
    "Battery Replacement": 730,
    "Transmission Service": 730,
    "Air Filter Replacement": 180,
    "Coolant Flush": 365,
    "Wheel Alignment": 180,
    Other: 180,
  }

  useEffect(() => {
    fetchMaintenanceData()
    fetchVehicles()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [vehicles, searchVehicleId, searchDate, searchType, sortConfig, showDueSoon])

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      const response = await axios.get("http://localhost:1111/api/v1/vehicles", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.success && response.data.vehicles.length > 0) {
        setVehiclesList(response.data.vehicles)
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error)
      setError("Failed to load vehicles. Please try again.")
    }
  }

  const fetchMaintenanceData = async () => {
    setLoading(true)
    setIsRefreshing(true)
    try {
      const response = await axios.get("http://localhost:1111/api/v1/maintenances")
      setVehicles(response.data)
      setFilteredVehicles(response.data)
      checkReminders(response.data)
      setError(null)
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to fetch maintenance data. Please try again.")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const checkReminders = (records) => {
    const today = new Date()

    // Filter records based on type-specific intervals
    const overdue = records.filter((record) => {
      // Skip types that don't have a reminder interval (as needed)
      if (!maintenanceIntervals[record.type]) return false

      const recordDate = new Date(record.date)
      const intervalDays = maintenanceIntervals[record.type]
      const nextDueDate = new Date(recordDate)
      nextDueDate.setDate(recordDate.getDate() + intervalDays)

      // Record is overdue if the next due date is today or earlier
      return nextDueDate <= today
    })

    setReminders(overdue)
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:1111/api/v1/maintenances/delete/${id}`)
      const updatedVehicles = vehicles.filter((vehicle) => vehicle._id !== id)
      setVehicles(updatedVehicles)
      checkReminders(updatedVehicles)
      setSuccess("Record deleted successfully")
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error deleting record:", error)
      setError("Failed to delete record. Please try again.")
      setTimeout(() => setError(null), 3000)
    }
  }

  const confirmDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You are about to delete this maintenance record. This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        handleDelete(id)
        Swal.fire({
          title: "Deleted!",
          text: "The maintenance record has been deleted.",
          icon: "success",
          confirmButtonColor: "#6366f1",
        })
      }
    })
  }

  const handleEdit = (vehicle) => {
    Swal.fire({
      title: "Edit Record",
      text: "You are about to edit this maintenance record.",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#9ca3af",
      confirmButtonText: "Continue",
    }).then((result) => {
      if (result.isConfirmed) {
        setEditingId(vehicle._id)
        setEditData({ ...vehicle })
      }
    })
  }

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:1111/api/v1/maintenances/edit/${editingId}`, editData)
      setVehicles(vehicles.map((v) => (v._id === editingId ? editData : v)))
      setEditingId(null)
      Swal.fire({
        title: "Success!",
        text: "Record updated successfully",
        icon: "success",
        confirmButtonColor: "#6366f1",
      })
    } catch (error) {
      console.error("Error updating record:", error)
      Swal.fire({
        title: "Error!",
        text: "Failed to update record. Please try again.",
        icon: "error",
        confirmButtonColor: "#6366f1",
      })
    }
  }

  const handleReminderPageNavigate = () => {
    navigate("/reminder", { state: { reminders } })
  }

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, log out!",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/login")
      }
    })
  }

  const generateReport = () => {
    try {
      // Prepare data for export
      const exportData = filteredVehicles.map((v) => {
        // Find the vehicle details
        const vehicleDetails = getVehicleDetails(v.vehicleId)
        const vehicleInfo = vehicleDetails
          ? `${vehicleDetails.name} - ${vehicleDetails.brand} ${vehicleDetails.model} (${vehicleDetails.year})`
          : v.vehicleId

        return {
          Vehicle: vehicleInfo,
          "Vehicle ID": v.vehicleId,
          Date: new Date(v.date).toLocaleDateString(),
          Type: v.type,
          Description: v.description,
          "Cost (Rs.)": v.cost,
          "Next Due": getNextDueDate(v.date, v.type),
        }
      })

      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Vehicle Maintenance")
      XLSX.writeFile(wb, `VehicleMaintenance_${new Date().toISOString().split("T")[0]}.xlsx`)

      Swal.fire({
        title: "Success!",
        text: "Report generated successfully",
        icon: "success",
        confirmButtonColor: "#6366f1",
      })
    } catch (error) {
      console.error("Error generating report:", error)
      Swal.fire({
        title: "Error!",
        text: "Failed to generate report. Please try again.",
        icon: "error",
        confirmButtonColor: "#6366f1",
      })
    }
  }

  const applyFiltersAndSort = () => {
    let filtered = [...vehicles]

    // Apply search filters
    if (searchVehicleId || searchDate || searchType) {
      filtered = filtered.filter(
        (v) =>
          (searchVehicleId === "" || v.vehicleId.toLowerCase().includes(searchVehicleId.toLowerCase())) &&
          (searchDate === "" || v.date.split("T")[0] === searchDate) &&
          (searchType === "" || v.type === searchType),
      )
    }

    // Apply "Due Soon" filter if enabled
    if (showDueSoon) {
      const today = new Date()
      const thirtyDaysFromNow = new Date(today)
      thirtyDaysFromNow.setDate(today.getDate() + 30)

      filtered = filtered.filter((record) => {
        if (!maintenanceIntervals[record.type]) return false

        const recordDate = new Date(record.date)
        const intervalDays = maintenanceIntervals[record.type]
        const nextDueDate = new Date(recordDate)
        nextDueDate.setDate(recordDate.getDate() + intervalDays)

        // Show records due within the next 30 days
        return nextDueDate > today && nextDueDate <= thirtyDaysFromNow
      })
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        // Handle date comparison
        if (sortConfig.key === "date") {
          aValue = new Date(aValue)
          bValue = new Date(bValue)
        }

        // Handle numeric comparison
        if (sortConfig.key === "cost") {
          aValue = Number.parseFloat(aValue)
          bValue = Number.parseFloat(bValue)
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

    setFilteredVehicles(filtered)
  }

  const handleSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  const clearFilters = () => {
    setSearchVehicleId("")
    setSearchDate("")
    setSearchType("")
    setShowDueSoon(false)
  }

  // Get vehicle details from vehicleId
  const getVehicleDetails = (vehicleId) => {
    return vehiclesList.find((vehicle) => vehicle._id === vehicleId)
  }

  // Format vehicle display
  const formatVehicleDisplay = (vehicleId) => {
    const vehicle = getVehicleDetails(vehicleId)
    if (vehicle) {
      return `${vehicle.name} - ${vehicle.brand} ${vehicle.model} (${vehicle.year})`
    }
    return vehicleId // Fallback to ID if vehicle not found
  }

  // Format currency
  const formatCurrency = (amount) => {
    return `Rs ${Number(amount).toLocaleString("en-LK")}`
  }

  // Add a function to calculate the next due date
  const getNextDueDate = (date, type) => {
    if (!maintenanceIntervals[type]) return "As needed"

    const recordDate = new Date(date)
    const intervalDays = maintenanceIntervals[type]
    const nextDueDate = new Date(recordDate)
    nextDueDate.setDate(recordDate.getDate() + intervalDays)

    return formatDate(nextDueDate)
  }

  // Check if maintenance is due soon (within 30 days)
  const isDueSoon = (date, type) => {
    if (!maintenanceIntervals[type]) return false

    const today = new Date()
    const thirtyDaysFromNow = new Date(today)
    thirtyDaysFromNow.setDate(today.getDate() + 30)

    const recordDate = new Date(date)
    const intervalDays = maintenanceIntervals[type]
    const nextDueDate = new Date(recordDate)
    nextDueDate.setDate(recordDate.getDate() + intervalDays)

    return nextDueDate > today && nextDueDate <= thirtyDaysFromNow
  }

  // Check if maintenance is overdue
  const isOverdue = (date, type) => {
    if (!maintenanceIntervals[type]) return false

    const today = new Date()
    const recordDate = new Date(date)
    const intervalDays = maintenanceIntervals[type]
    const nextDueDate = new Date(recordDate)
    nextDueDate.setDate(recordDate.getDate() + intervalDays)

    return nextDueDate <= today
  }

  // Get status badge for maintenance
  const getMaintenanceStatus = (date, type) => {
    if (isOverdue(date, type)) {
      return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-semibold">Overdue</span>
    } else if (isDueSoon(date, type)) {
      return <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-semibold">Due Soon</span>
    } else {
      return (
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">Up to Date</span>
      )
    }
  }

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <header className="relative">
        {/* Background with gradient and pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-800 opacity-95"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptNiA2djZoNnYtNmgtNnptLTEyIDBoNnY2aC02di02em0xMiAwaDZ2NmgtNnYtNnoiLz48cGF0aCBkPSJNMTIgMTJoNnY2aC02di02em02IDZoNnY2aC02di02em0wLTZoNnY2aC02di02em0xMiAwaDZ2NmgtNnYtNnptLTEyIDEyaDZ2NmgtNnYtNnptMTIgMGg2djZoLTZ2LTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10"></div>

        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6 md:justify-start md:space-x-10">
              {/* Logo */}
            
              <div>
                <img
                  src="/image/logo.png"
                  alt="SK Rentals Logo"
                  className="w--20 h-20 object-contain"
                />
              </div>
            
          
              {/* Mobile menu button */}
              <div className="-mr-2 -my-2 md:hidden">
                <button
                  type="button"
                  className="bg-white/10 backdrop-blur-sm rounded-md p-2 inline-flex items-center justify-center text-white hover:bg-white/20 focus:outline-none"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <span className="sr-only">Open menu</span>
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-10">
                <button
                  onClick={() => navigate("/staff")}
                  className="text-base font-medium text-white hover:text-indigo-200 transition-colors duration-200 flex items-center"
                >
                  <Settings className="h-4 w-4 mr-1" /> Dashboard
                </button>
                <button
                  onClick={() => navigate("/add")}
                  className="text-base font-medium text-white hover:text-indigo-200 transition-colors duration-200 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Maintenance
                </button>
                <button className="text-base font-medium text-indigo-300 border-b-2 border-indigo-300 flex items-center">
                  <List className="h-4 w-4 mr-1" /> Maintenance List
                </button>
                <button
                  onClick={handleReminderPageNavigate}
                  className="text-base font-medium text-white hover:text-indigo-200 transition-colors duration-200 flex items-center"
                >
                  <Bell className="h-4 w-4 mr-1" /> Reminders
                  {reminders.length > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                      {reminders.length}
                    </span>
                  )}
                </button>
              </nav>

              {/* Logout Button */}
              <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
                <button
                  onClick={handleLogout}
                  className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu, show/hide based on mobile menu state */}
          {mobileMenuOpen && (
            <div className="absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden z-20">
              <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white divide-y-2 divide-gray-50">
                <div className="pt-5 pb-6 px-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Car className="h-8 w-8 text-indigo-600" />
                      <h2 className="ml-3 text-xl font-bold text-gray-900">Vehicle Maintenance</h2>
                    </div>
                    <div className="-mr-2">
                      <button
                        type="button"
                        className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="sr-only">Close menu</span>
                        <X className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-6">
                    <nav className="grid gap-y-8">
                      <button
                        onClick={() => {
                          navigate("/staff")
                          setMobileMenuOpen(false)
                        }}
                        className="-m-3 p-3 flex items-center rounded-md hover:bg-gray-50"
                      >
                        <Settings className="flex-shrink-0 h-6 w-6 text-indigo-600" />
                        <span className="ml-3 text-base font-medium text-gray-900">Dashboard</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate("/add")
                          setMobileMenuOpen(false)
                        }}
                        className="-m-3 p-3 flex items-center rounded-md hover:bg-gray-50"
                      >
                        <Plus className="flex-shrink-0 h-6 w-6 text-indigo-600" />
                        <span className="ml-3 text-base font-medium text-gray-900">Add Maintenance</span>
                      </button>
                      <button className="-m-3 p-3 flex items-center rounded-md bg-indigo-50">
                        <List className="flex-shrink-0 h-6 w-6 text-indigo-600" />
                        <span className="ml-3 text-base font-medium text-indigo-900">Maintenance List</span>
                      </button>
                      <button
                        onClick={() => {
                          handleReminderPageNavigate()
                          setMobileMenuOpen(false)
                        }}
                        className="-m-3 p-3 flex items-center rounded-md hover:bg-gray-50"
                      >
                        <Bell className="flex-shrink-0 h-6 w-6 text-indigo-600" />
                        <span className="ml-3 text-base font-medium text-gray-900">
                          Reminders
                          {reminders.length > 0 && (
                            <span className="inline-flex items-center justify-center w-5 h-5 ml-2 text-xs font-semibold text-white bg-red-500 rounded-full">
                              {reminders.length}
                            </span>
                          )}
                        </span>
                      </button>
                    </nav>
                  </div>
                </div>
                <div className="py-6 px-5 space-y-6">
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Page Title Banner */}
          <div className="bg-white/10 backdrop-blur-sm border-t border-white/20">
            <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
              <div className="flex items-center">
                <List className="h-6 w-6 text-indigo-300 mr-2" />
                <h2 className="text-xl font-semibold text-white">Maintenance Records</h2>
              </div>
              <div className="text-sm text-indigo-200">
                <span className="bg-indigo-700/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                  {filteredVehicles.length} records
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Maintenance Records</h1>
            <p className="text-gray-600 mt-1">View and manage vehicle maintenance history</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={fetchMaintenanceData}
              disabled={isRefreshing}
              className={`px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 text-sm ${
                isRefreshing ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button
              onClick={generateReport}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 text-sm"
            >
              <Download className="h-4 w-4" /> Export to Excel
            </button>
            <button
              onClick={() => navigate("/add")}
              className="px-4 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-all duration-200 flex items-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4" /> Add Record
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <Search className="h-5 w-5 text-indigo-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Search & Filter</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Car className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  id="vehicleId"
                  value={searchVehicleId}
                  onChange={(e) => setSearchVehicleId(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                >
                  <option value="">All Vehicles</option>
                  {vehiclesList.map((vehicle) => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.name} - {vehicle.brand} {vehicle.model} ({vehicle.year})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Maintenance Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Maintenance Type
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  id="type"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                >
                  <option value="">All Types</option>
                  <option value="Oil Change">Oil Change</option>
                  <option value="Brake Inspection">Brake Inspection</option>
                  <option value="Tire Replacement">Tire Replacement</option>
                  <option value="Engine Repair">Engine Repair</option>
                  <option value="Battery Replacement">Battery Replacement</option>
                  <option value="Transmission Service">Transmission Service</option>
                  <option value="Air Filter Replacement">Air Filter Replacement</option>
                  <option value="Coolant Flush">Coolant Flush</option>
                  <option value="Wheel Alignment">Wheel Alignment</option>
                  <option value="Other">Other</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between mt-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="dueSoon"
                checked={showDueSoon}
                onChange={(e) => setShowDueSoon(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="dueSoon" className="ml-2 block text-sm text-gray-700">
                Show only maintenance due soon (next 30 days)
              </label>
            </div>
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{filteredVehicles.length}</span> of{" "}
            <span className="font-medium">{vehicles.length}</span> maintenance records
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Table Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("vehicleId")}
                      >
                        <div className="flex items-center">
                          Vehicle
                          {sortConfig.key === "vehicleId" && (
                            <span className="ml-1">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("date")}
                      >
                        <div className="flex items-center">
                          Date
                          {sortConfig.key === "date" && (
                            <span className="ml-1">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("type")}
                      >
                        <div className="flex items-center">
                          Type
                          {sortConfig.key === "type" && (
                            <span className="ml-1">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
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
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("cost")}
                      >
                        <div className="flex items-center">
                          Cost
                          {sortConfig.key === "cost" && (
                            <span className="ml-1">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" /> Next Due
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
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
                    {filteredVehicles.length > 0 ? (
                      filteredVehicles.map((v) => (
                        <tr key={v._id} className="hover:bg-gray-50">
                          {editingId === v._id ? (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <select
                                  name="vehicleId"
                                  value={editData.vehicleId}
                                  onChange={handleChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                >
                                  {vehiclesList.map((vehicle) => (
                                    <option key={vehicle._id} value={vehicle._id}>
                                      {vehicle.name} - {vehicle.brand} {vehicle.model} ({vehicle.year})
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="date"
                                  name="date"
                                  value={editData.date ? editData.date.split("T")[0] : ""}
                                  onChange={handleChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <select
                                  name="type"
                                  value={editData.type}
                                  onChange={handleChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                >
                                  <option value="Oil Change">Oil Change</option>
                                  <option value="Brake Inspection">Brake Inspection</option>
                                  <option value="Tire Replacement">Tire Replacement</option>
                                  <option value="Engine Repair">Engine Repair</option>
                                  <option value="Battery Replacement">Battery Replacement</option>
                                  <option value="Transmission Service">Transmission Service</option>
                                  <option value="Air Filter Replacement">Air Filter Replacement</option>
                                  <option value="Coolant Flush">Coolant Flush</option>
                                  <option value="Wheel Alignment">Wheel Alignment</option>
                                  <option value="Other">Other</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="text"
                                  name="description"
                                  value={editData.description}
                                  onChange={handleChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="number"
                                  name="cost"
                                  value={editData.cost}
                                  onChange={handleChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {getNextDueDate(editData.date, editData.type)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getMaintenanceStatus(editData.date, editData.type)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={handleSave}
                                  className="text-indigo-600 hover:text-indigo-900 mr-3 flex items-center"
                                >
                                  <Save className="h-4 w-4 mr-1" /> Save
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="text-gray-600 hover:text-gray-900 flex items-center"
                                >
                                  <X className="h-4 w-4 mr-1" /> Cancel
                                </button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {formatVehicleDisplay(v.vehicleId)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(v.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(
                                    v.type,
                                  )}`}
                                >
                                  {v.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{v.description}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatCurrency(v.cost)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {getNextDueDate(v.date, v.type)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">{getMaintenanceStatus(v.date, v.type)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => handleEdit(v)}
                                  className="text-indigo-600 hover:text-indigo-900 mr-3 flex items-center"
                                >
                                  <Edit className="h-4 w-4 mr-1" /> Edit
                                </button>
                                <button
                                  onClick={() => confirmDelete(v._id)}
                                  className="text-red-600 hover:text-red-900 flex items-center"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                          <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                          <p className="text-lg font-medium text-gray-900 mb-1">No maintenance records found</p>
                          <p className="text-sm text-gray-500 mb-4">
                            Try adjusting your search filters or add a new maintenance record
                          </p>
                          <button
                            onClick={() => navigate("/add")}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                          >
                            <Plus className="h-4 w-4 mr-2" /> Add Maintenance Record
                          </button>
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
    </div>
  )
}

// Helper function to get color for maintenance type
function getTypeColor(type) {
  switch (type) {
    case "Oil Change":
      return "bg-blue-100 text-blue-800"
    case "Tire Replacement":
      return "bg-green-100 text-green-800"
    case "Brake Service":
    case "Brake Inspection":
      return "bg-red-100 text-red-800"
    case "Battery Replacement":
      return "bg-purple-100 text-purple-800"
    case "Transmission Service":
      return "bg-orange-100 text-orange-800"
    case "Air Filter Replacement":
      return "bg-teal-100 text-teal-800"
    case "Coolant Flush":
      return "bg-cyan-100 text-cyan-800"
    case "Wheel Alignment":
      return "bg-indigo-100 text-indigo-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default VehicleListMain