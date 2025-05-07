"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import Header from "../layouts/Header"
import Footer from "../layouts/Footer"
import { Car, Users, PenToolIcon as Tool, Plus, ArrowRight, AlertTriangle, Shield, BarChart3, Clock, Calendar, Tag, MapPin, Zap, RefreshCw, ChevronRight, Loader2 } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState({
    totalVehicles: 0,
    availableVehicles: 0,
    totalUsers: 0,
    blacklistedUsers: 0,
    vehicleTypes: [],
    recentUsers: [],
    vehiclesByType: [],
    vehicleAvailability: [
      { name: "Available", value: 0 },
      { name: "Unavailable", value: 0 },
    ],
  })
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsRefreshing(true)
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Authorization token is missing")

      // Fetch vehicles data
      const vehiclesResponse = await axios.get("http://localhost:1111/api/v1/admin/vehicles", {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Fetch users data
      const usersResponse = await axios.get("http://localhost:1111/api/v1/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Fetch blacklisted users
      const blacklistResponse = await axios.get("http://localhost:1111/api/v1/admin/blacklist", {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Process vehicles data
      const vehicles = vehiclesResponse.data.vehicles || []
      const availableVehicles = vehicles.filter((v) => v.availableStatus === true).length
      
      // Process vehicle types
      const typeCount = {}
      vehicles.forEach((vehicle) => {
        if (vehicle.vehicleType) {
          typeCount[vehicle.vehicleType] = (typeCount[vehicle.vehicleType] || 0) + 1
        }
      })
      
      const vehiclesByType = Object.entries(typeCount).map(([name, value]) => ({
        name,
        value,
      }))

      // Process users data
      const users = usersResponse.data.users || []
      const customers = users.filter((user) => user.role === "user")
      const blacklistedUsers = blacklistResponse.data.blacklistedUsers || []
      
      // Get recent users (last 5)
      const recentUsers = [...customers]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)

      // Update dashboard data
      setDashboardData({
        totalVehicles: vehicles.length,
        availableVehicles,
        totalUsers: customers.length,
        blacklistedUsers: blacklistedUsers.length,
        vehicleTypes: [...new Set(vehicles.map((v) => v.vehicleType).filter(Boolean))],
        recentUsers,
        vehiclesByType,
        vehicleAvailability: [
          { name: "Available", value: availableVehicles },
          { name: "Unavailable", value: vehicles.length - availableVehicles },
        ],
      })
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError("Failed to fetch dashboard data. Please try again.")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Colors for charts
  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

  // Get vehicle type distribution for pie chart
  const getVehicleTypeData = () => {
    return dashboardData.vehiclesByType
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={fetchDashboardData}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back. Here's an overview of your rental business.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={fetchDashboardData}
              disabled={isRefreshing}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isRefreshing ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              <RefreshCw className={`-ml-1 mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Vehicles */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                <Car className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Vehicles</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">
                    {loading ? <Loader2 className="h-6 w-6 animate-spin text-indigo-600" /> : dashboardData.totalVehicles}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500">Available: </span>
                <span className="text-sm font-medium text-gray-900">
                  {loading ? (
                    <span className="inline-block w-8 h-4 bg-gray-200 animate-pulse rounded"></span>
                  ) : (
                    dashboardData.availableVehicles
                  )}
                </span>
              </div>
              <button
                onClick={() => navigate("/listvehicle")}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center"
              >
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>

          {/* Total Users */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
                <Users className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">
                    {loading ? <Loader2 className="h-6 w-6 animate-spin text-emerald-600" /> : dashboardData.totalUsers}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500">Blacklisted: </span>
                <span className="text-sm font-medium text-gray-900">
                  {loading ? (
                    <span className="inline-block w-8 h-4 bg-gray-200 animate-pulse rounded"></span>
                  ) : (
                    dashboardData.blacklistedUsers
                  )}
                </span>
              </div>
              <button
                onClick={() => navigate("/adminuserlist")}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center"
              >
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>

          {/* Vehicle Types */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                <Tag className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Vehicle Types</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">
                    {loading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                    ) : (
                      dashboardData.vehicleTypes.length
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500">Most common: </span>
                <span className="text-sm font-medium text-gray-900">
                  {loading ? (
                    <span className="inline-block w-16 h-4 bg-gray-200 animate-pulse rounded"></span>
                  ) : dashboardData.vehiclesByType.length > 0 ? (
                    dashboardData.vehiclesByType.sort((a, b) => b.value - a.value)[0].name
                  ) : (
                    "N/A"
                  )}
                </span>
              </div>
              <button
                onClick={() => navigate("/listvehicle")}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center"
              >
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>

          {/* Blacklisted Users */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <Shield className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Blacklisted Users</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">
                    {loading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-red-600" />
                    ) : (
                      dashboardData.blacklistedUsers
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500">Percentage: </span>
                <span className="text-sm font-medium text-gray-900">
                  {loading ? (
                    <span className="inline-block w-8 h-4 bg-gray-200 animate-pulse rounded"></span>
                  ) : dashboardData.totalUsers > 0 ? (
                    `${((dashboardData.blacklistedUsers / dashboardData.totalUsers) * 100).toFixed(1)}%`
                  ) : (
                    "0%"
                  )}
                </span>
              </div>
              <button
                onClick={() => navigate("/adminblacklist")}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center"
              >
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Charts and Data Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Vehicle Type Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Vehicle Type Distribution</h2>
            </div>
            <div className="p-6 h-80">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
              ) : dashboardData.vehiclesByType.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getVehicleTypeData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {getVehicleTypeData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} vehicles`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <Car className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">No vehicle type data available</p>
                  <button
                    onClick={() => navigate("/addvehicle")}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Add Vehicle
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Availability */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Vehicle Availability</h2>
            </div>
            <div className="p-6 h-80">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
              ) : dashboardData.totalVehicles > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData.vehicleAvailability}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Vehicles" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <BarChart3 className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">No vehicle availability data</p>
                  <button
                    onClick={() => navigate("/addvehicle")}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Add Vehicle
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Users and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Users */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Recent Users</h2>
              <button
                onClick={() => navigate("/adminuserlist")}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center"
              >
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      User
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Phone
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Joined
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    // Loading skeleton
                    Array(5)
                      .fill(0)
                      .map((_, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
                              <div className="ml-4">
                                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                          </td>
                        </tr>
                      ))
                  ) : dashboardData.recentUsers.length > 0 ? (
                    dashboardData.recentUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name || "N/A"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.phone || "N/A"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(user.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.bannedUntil && new Date(user.bannedUntil) > new Date()
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {user.bannedUntil && new Date(user.bannedUntil) > new Date() ? "Banned" : "Active"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-4">
              <button
                onClick={() => navigate("/addvehicle")}
                className="w-full flex items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
                  <Car className="h-5 w-5" />
                </div>
                <div className="ml-4 flex-grow text-left">
                  <p className="text-sm font-medium text-gray-900">Add New Vehicle</p>
                  <p className="text-xs text-gray-500">Register a new vehicle to your fleet</p>
                </div>
                <ArrowRight className="h-5 w-5 text-indigo-600" />
              </button>

              <button
                onClick={() => navigate("/adminuserlist")}
                className="w-full flex items-center p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <div className="p-2 rounded-full bg-emerald-100 text-emerald-600">
                  <Users className="h-5 w-5" />
                </div>
                <div className="ml-4 flex-grow text-left">
                  <p className="text-sm font-medium text-gray-900">Manage Users</p>
                  <p className="text-xs text-gray-500">View and manage customer accounts</p>
                </div>
                <ArrowRight className="h-5 w-5 text-emerald-600" />
              </button>

              <button
                onClick={() => navigate("/adminblacklist")}
                className="w-full flex items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <div className="p-2 rounded-full bg-red-100 text-red-600">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="ml-4 flex-grow text-left">
                  <p className="text-sm font-medium text-gray-900">Blacklist Management</p>
                  <p className="text-xs text-gray-500">Manage blacklisted customers</p>
                </div>
                <ArrowRight className="h-5 w-5 text-red-600" />
              </button>

              <button
                onClick={() => navigate("/listvehicle")}
                className="w-full flex items-center p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <div className="p-2 rounded-full bg-amber-100 text-amber-600">
                  <Tool className="h-5 w-5" />
                </div>
                <div className="ml-4 flex-grow text-left">
                  <p className="text-sm font-medium text-gray-900">Vehicle Management</p>
                  <p className="text-xs text-gray-500">View and manage your vehicle fleet</p>
                </div>
                <ArrowRight className="h-5 w-5 text-amber-600" />
              </button>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">System Status</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                  <Clock className="h-5 w-5" />
                </div>
                <span className="text-sm text-gray-700">Vehicle Management System</span>
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                Operational
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-sm text-gray-700">User Management System</span>
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                Operational
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                  <Shield className="h-5 w-5" />
                </div>
                <span className="text-sm text-gray-700">Security System</span>
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                Operational
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                  <Calendar className="h-5 w-5" />
                </div>
                <span className="text-sm text-gray-700">Booking System</span>
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                Operational
              </span>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-indigo-500 mr-2" />
                <span className="text-sm font-medium text-gray-900">System Updates</span>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Last system update: <span className="font-medium">{formatDate(new Date())}</span>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default AdminDashboard
