"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
  Car,
  Bell,
  Plus,
  LogOut,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  FileText,
  Wrench,
  Settings,
  Menu,
  X,
} from "lucide-react"
import Swal from "sweetalert2"

function ReminderPage() {
  const navigate = useNavigate()
  const [reminders, setReminders] = useState([])
  const [vehiclesList, setVehiclesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetchReminders()
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await axios.get("http://localhost:1111/api/v1/vehicles", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success && res.data.vehicles.length > 0) {
        setVehiclesList(res.data.vehicles)
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err)
    }
  }

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
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    setLoading(true)
    setIsRefreshing(true)
    try {
      const response = await axios.get("http://localhost:1111/api/v1/maintenances")
      const records = response.data
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
      setError(null)
    } catch (error) {
      console.error("Error fetching reminders:", error)
      setError("Failed to fetch maintenance reminders. Please try again.")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
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

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

  const getTypeColor = (type) => {
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

  const formatVehicleDisplay = (vehicleId) => {
    const vehicle = vehiclesList.find((v) => v._id === vehicleId)
    return vehicle ? `${vehicle.name} - ${vehicle.model}` : vehicleId
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
                <button
                  onClick={() => navigate("/list")}
                  className="text-base font-medium text-white hover:text-indigo-200 transition-colors duration-200 flex items-center"
                >
                  <Wrench className="h-4 w-4 mr-1" /> Maintenance List
                </button>
                <button className="text-base font-medium text-indigo-300 border-b-2 border-indigo-300 flex items-center">
                  <Bell className="h-4 w-4 mr-1" /> Reminders
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
                      <button
                        onClick={() => {
                          navigate("/list")
                          setMobileMenuOpen(false)
                        }}
                        className="-m-3 p-3 flex items-center rounded-md hover:bg-gray-50"
                      >
                        <Wrench className="flex-shrink-0 h-6 w-6 text-indigo-600" />
                        <span className="ml-3 text-base font-medium text-gray-900">Maintenance List</span>
                      </button>
                      <button className="-m-3 p-3 flex items-center rounded-md bg-indigo-50">
                        <Bell className="flex-shrink-0 h-6 w-6 text-indigo-600" />
                        <span className="ml-3 text-base font-medium text-indigo-900">Reminders</span>
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
                <Bell className="h-6 w-6 text-indigo-300 mr-2" />
                <h2 className="text-xl font-semibold text-white">Maintenance Reminders</h2>
              </div>
              <div className="text-sm text-indigo-200">
                {reminders.length > 0 ? (
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {reminders.length} overdue
                  </span>
                ) : loading ? (
                  <span>Loading...</span>
                ) : (
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    All up to date
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Maintenance Reminders</h2>
          <button
            onClick={fetchReminders}
            disabled={isRefreshing}
            className="px-4 py-2 border rounded-md text-sm flex items-center gap-2 bg-white text-gray-700 hover:bg-gray-100"
          >
            <RefreshCw className={`${isRefreshing ? "animate-spin" : ""} h-4 w-4`} /> Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-300 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" /> {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 text-green-700 border border-green-300 rounded-md flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" /> {success}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading reminders...</p>
          </div>
        ) : reminders.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <p className="text-lg font-semibold text-gray-800">No overdue maintenance</p>
            <p className="text-gray-500">All vehicles are up to date.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div key={reminder._id} className="border rounded-lg p-4 shadow-sm hover:shadow transition">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    Vehicle: {formatVehicleDisplay(reminder.vehicleId)}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-sm text-gray-500">Last Maintenance: {formatDate(reminder.date)}</p>
                    <span className="text-sm text-gray-500">•</span>
                    <p className="text-sm text-gray-500">Next Due: {getNextDueDate(reminder.date, reminder.type)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={`inline-block text-xs px-2 py-1 rounded-full font-semibold ${getTypeColor(reminder.type)}`}
                    >
                      {reminder.type}
                    </span>
                    <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-semibold">
                      Due for service
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{reminder.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReminderPage
