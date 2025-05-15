"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import {
  Car,
  Clock,
  DollarSign,
  Bell,
  Calendar,
  BarChart3,
  PieChartIcon,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Menu,
  X,
  Settings,
  Plus,
  List,
  LogOut,
} from "lucide-react"
import Swal from "sweetalert2"

function StaffDashboard() {
  const [vehicles, setVehicles] = useState([])
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [vehiclesList, setVehiclesList] = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        // Handle not logged in case
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
    try {
      const res = await axios.get("http://localhost:1111/api/v1/maintenances")
      setVehicles(res.data)
      checkReminders(res.data)
      setError(null)
    } catch (err) {
      console.error("Error:", err)
      setError("Failed to fetch maintenance data. Please try again.")
    } finally {
      setLoading(false)
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

  // Get vehicle details from vehicleId
  const getVehicleDetails = (vehicleId) => {
    return vehiclesList.find((vehicle) => vehicle._id === vehicleId)
  }

  // Format vehicle display
  const formatVehicleDisplay = (vehicleId) => {
    const vehicle = getVehicleDetails(vehicleId)
    if (vehicle) {
      return `${vehicle.name} - ${vehicle.model}`
    }
    return vehicleId // Fallback to ID if vehicle not found
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

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

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
        window.location.href = "/login"
      }
    })
  }

  const totalCost = vehicles.reduce((sum, v) => sum + Number.parseFloat(v.cost || 0), 0)
  const totalCount = vehicles.length
  const reminderCount = reminders.length

  const costByVehicle = []
  vehicles.forEach((v) => {
    const found = costByVehicle.find((item) => item.vehicleId === v.vehicleId)
    if (found) found.cost += Number.parseFloat(v.cost || 0)
    else {
      const vehicleDisplay = formatVehicleDisplay(v.vehicleId)
      costByVehicle.push({
        vehicleId: v.vehicleId,
        vehicleName: vehicleDisplay,
        cost: Number.parseFloat(v.cost || 0),
      })
    }
  })

  const types = ["Oil Change", "Tire Replacement", "Brake Inspection", "Battery Replacement", "Other"]
  const costByType = types.map((type) => ({
    name: type,
    cost: vehicles.filter((v) => v.type === type).reduce((sum, v) => sum + Number.parseFloat(v.cost || 0), 0),
  }))

  const dateMap = {}
  vehicles.forEach((v) => {
    const date = v.date.split("T")[0]
    if (!dateMap[date]) dateMap[date] = 0
    dateMap[date] += Number.parseFloat(v.cost || 0)
  })
  const costByDate = Object.entries(dateMap)
    .map(([date, cost]) => ({ date, cost }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  const COLORS = ["#6366f1", "#8b5cf6", "#d946ef", "#ec4899", "#f43f5e"]

  // Format currency
  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount).toLocaleString("en-LK", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`
  }

  // Get maintenance type color
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
                <button className="text-base font-medium text-indigo-300 border-b-2 border-indigo-300 flex items-center">
                  <Settings className="h-4 w-4 mr-1" /> Dashboard
                </button>
                <button
                  onClick={() => (window.location.href = "/add")}
                  className="text-base font-medium text-white hover:text-indigo-200 transition-colors duration-200 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Maintenance
                </button>
                <button
                  onClick={() => (window.location.href = "/list")}
                  className="text-base font-medium text-white hover:text-indigo-200 transition-colors duration-200 flex items-center"
                >
                  <List className="h-4 w-4 mr-1" /> Maintenance List
                </button>
                <button
                  onClick={() => (window.location.href = "/reminder")}
                  className="text-base font-medium text-white hover:text-indigo-200 transition-colors duration-200 flex items-center"
                >
                  <Bell className="h-4 w-4 mr-1" /> Reminders
                  {reminderCount > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                      {reminderCount}
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
                      <button className="-m-3 p-3 flex items-center rounded-md bg-indigo-50">
                        <Settings className="flex-shrink-0 h-6 w-6 text-indigo-600" />
                        <span className="ml-3 text-base font-medium text-indigo-900">Dashboard</span>
                      </button>
                      <button
                        onClick={() => {
                          window.location.href = "/add"
                          setMobileMenuOpen(false)
                        }}
                        className="-m-3 p-3 flex items-center rounded-md hover:bg-gray-50"
                      >
                        <Plus className="flex-shrink-0 h-6 w-6 text-indigo-600" />
                        <span className="ml-3 text-base font-medium text-gray-900">Add Maintenance</span>
                      </button>
                      <button
                        onClick={() => {
                          window.location.href = "/list"
                          setMobileMenuOpen(false)
                        }}
                        className="-m-3 p-3 flex items-center rounded-md hover:bg-gray-50"
                      >
                        <List className="flex-shrink-0 h-6 w-6 text-indigo-600" />
                        <span className="ml-3 text-base font-medium text-gray-900">Maintenance List</span>
                      </button>
                      <button
                        onClick={() => {
                          window.location.href = "/reminder"
                          setMobileMenuOpen(false)
                        }}
                        className="-m-3 p-3 flex items-center rounded-md hover:bg-gray-50"
                      >
                        <Bell className="flex-shrink-0 h-6 w-6 text-indigo-600" />
                        <span className="ml-3 text-base font-medium text-gray-900">
                          Reminders
                          {reminderCount > 0 && (
                            <span className="inline-flex items-center justify-center w-5 h-5 ml-2 text-xs font-semibold text-white bg-red-500 rounded-full">
                              {reminderCount}
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
                <BarChart3 className="h-6 w-6 text-indigo-300 mr-2" />
                <h2 className="text-xl font-semibold text-white">Maintenance Analytics</h2>
              </div>
              <div className="text-sm text-indigo-200">
                <span className="bg-indigo-700/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                  {totalCount} records
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
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Maintenance Analytics</h1>
            <p className="text-gray-600 mt-1">Track and analyze vehicle maintenance data</p>
          </div>
          <button
            onClick={() => {
              fetchMaintenanceData()
              fetchVehicles()
            }}
            disabled={loading}
            className={`px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 text-sm ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh Data
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                    <Car className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-500">Total Maintenances</div>
                    <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Last 30 days: <span className="font-medium text-gray-900">{totalCount}</span>
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    8%
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-500">Total Cost</div>
                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalCost)}</div>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Average per vehicle:{" "}
                    <span className="font-medium text-gray-900">
                      {formatCurrency(totalCount ? totalCost / totalCount : 0)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    12%
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                    <Bell className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-500">Maintenance Reminders</div>
                    <div className="text-2xl font-bold text-gray-900">{reminderCount}</div>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Due for service: <span className="font-medium text-red-600">{reminderCount}</span>
                  </div>
                  <a
                    href="/reminder"
                    className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    View all <ChevronRight className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center mb-4">
                    <BarChart3 className="h-5 w-5 text-indigo-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">Cost by Vehicle</h2>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={costByVehicle} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        dataKey="vehicleName"
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: "#9CA3AF" }}
                        axisLine={{ stroke: "#9CA3AF" }}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: "#9CA3AF" }}
                        axisLine={{ stroke: "#9CA3AF" }}
                        tickFormatter={(value) => `Rs. ${value}`}
                      />
                      <Tooltip
                        formatter={(value) => [`Rs. ${value}`, "Cost"]}
                        contentStyle={{
                          backgroundColor: "#fff",
                          borderRadius: "0.375rem",
                          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                        }}
                      />
                      <Legend wrapperStyle={{ paddingTop: 10 }} />
                      <Bar dataKey="cost" fill="#6366f1" name="Cost" radius={[4, 4, 0, 0]} animationDuration={1500} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center mb-4">
                    <PieChartIcon className="h-5 w-5 text-purple-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">Cost by Maintenance Type</h2>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={costByType}
                        dataKey="cost"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                        animationDuration={1500}
                      >
                        {costByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`Rs. ${value}`, "Cost"]}
                        contentStyle={{
                          backgroundColor: "#fff",
                          borderRadius: "0.375rem",
                          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                        }}
                      />
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{ paddingTop: 20 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  <Calendar className="h-5 w-5 text-emerald-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Daily Cost Trend</h2>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={costByDate} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickLine={{ stroke: "#9CA3AF" }}
                      axisLine={{ stroke: "#9CA3AF" }}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={{ stroke: "#9CA3AF" }}
                      axisLine={{ stroke: "#9CA3AF" }}
                      tickFormatter={(value) => `Rs. ${value}`}
                    />
                    <Tooltip
                      formatter={(value) => [`Rs. ${value}`, "Cost"]}
                      contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: "0.375rem",
                        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                      }}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend wrapperStyle={{ paddingTop: 10 }} />
                    <Line
                      type="monotone"
                      dataKey="cost"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 6, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
                      name="Daily Cost"
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Maintenance Reminders Section */}
            {reminderCount > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-red-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">Due for Service</h2>
                  </div>
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {reminderCount} items
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Vehicle
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Type
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Last Service
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Next Due
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reminders.slice(0, 5).map((reminder, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatVehicleDisplay(reminder.vehicleId)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(reminder.type)}`}
                            >
                              {reminder.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(reminder.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getNextDueDate(reminder.date, reminder.type)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <a href={`/maintenance/${reminder._id}`} className="text-indigo-600 hover:text-indigo-900">
                              View
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {reminderCount > 5 && (
                  <div className="mt-4 text-center">
                    <a
                      href="/reminder"
                      className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      View all {reminderCount} reminders <ChevronRight className="h-4 w-4 ml-1" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default StaffDashboard