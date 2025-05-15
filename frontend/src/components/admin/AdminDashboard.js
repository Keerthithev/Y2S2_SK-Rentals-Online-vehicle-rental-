
"use client"

import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import Header from "../layouts/Header"
import Footer from "../layouts/Footer"
import { Car, Users, PenToolIcon as Tool, Plus, ArrowRight, AlertTriangle, Shield, BarChart3, Clock, Calendar, Tag, MapPin, Zap, RefreshCw, ChevronRight, Loader2 } from 'lucide-react'
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
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

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

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
  
  // Refs for animations
  const metricsRef = useRef(null)
  const chartsRef = useRef(null)
  const usersTableRef = useRef(null)
  const actionsRef = useRef(null)
  const statusRef = useRef(null)

  useEffect(() => {
    fetchDashboardData()
    
    // Dashboard animations
    const dashboardTl = gsap.timeline()
    
    // Metrics animation
    gsap.fromTo(
      ".metric-card",
      { opacity: 0, y: 30, scale: 0.95 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        duration: 0.6, 
        stagger: 0.1, 
        ease: "power3.out",
        scrollTrigger: {
          trigger: metricsRef.current,
          start: "top 80%",
        }
      }
    )
    
    // Charts animation
    gsap.fromTo(
      ".chart-container",
      { opacity: 0, y: 40 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        stagger: 0.2, 
        ease: "power3.out",
        scrollTrigger: {
          trigger: chartsRef.current,
          start: "top 80%",
        }
      }
    )
    
    // Users table animation
    gsap.fromTo(
      usersTableRef.current,
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        ease: "power3.out",
        scrollTrigger: {
          trigger: usersTableRef.current,
          start: "top 80%",
        }
      }
    )
    
    // Quick actions animation
    gsap.fromTo(
      ".action-button",
      { opacity: 0, x: 30 },
      { 
        opacity: 1, 
        x: 0, 
        duration: 0.5, 
        stagger: 0.1, 
        ease: "power3.out",
        scrollTrigger: {
          trigger: actionsRef.current,
          start: "top 80%",
        }
      }
    )
    
    // System status animation
    gsap.fromTo(
      ".status-item",
      { opacity: 0, x: -20 },
      { 
        opacity: 1, 
        x: 0, 
        duration: 0.5, 
        stagger: 0.1, 
        ease: "power3.out",
        scrollTrigger: {
          trigger: statusRef.current,
          start: "top 85%",
        }
      }
    )
    
    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-700 leading-tight">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2 text-lg">Welcome back. Here's an overview of your rental business.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={fetchDashboardData}
              disabled={isRefreshing}
              className={`inline-flex items-center px-6 py-3 rounded-full shadow-sm text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform hover:-translate-y-1 transition-all duration-300 ${
                isRefreshing ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              <RefreshCw className={`-ml-1 mr-2 h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div ref={metricsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Vehicles */}
          <div className="metric-card bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md">
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
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center group"
              >
                View all <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Total Users */}
          <div className="metric-card bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md">
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
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center group"
              >
                View all <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Vehicle Types */}
          <div className="metric-card bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md">
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
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center group"
              >
                View all <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Blacklisted Users */}
          <div className="metric-card bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md">
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
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center group"
              >
                View all <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Charts and Data Visualization */}
        <div ref={chartsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Vehicle Type Distribution */}
          <div className="chart-container bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Vehicle Type Distribution</h2>
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
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-full hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-1 transition-all duration-300"
                  >
                    Add Vehicle
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Availability */}
          <div className="chart-container bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Vehicle Availability</h2>
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
                    <Bar dataKey="value" name="Vehicles" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <BarChart3 className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">No vehicle availability data</p>
                  <button
                    onClick={() => navigate("/addvehicle")}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-full hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-1 transition-all duration-300"
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
          <div ref={usersTableRef} className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Recent Users</h2>
              <button
                onClick={() => navigate("/adminuserlist")}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center group"
              >
                View all <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
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
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
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
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
          <div ref={actionsRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-4">
              <button
                onClick={() => navigate("/addvehicle")}
                className="action-button w-full flex items-center p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md"
              >
                <div className="p-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md">
                  <Car className="h-5 w-5" />
                </div>
                <div className="ml-4 flex-grow text-left">
                  <p className="text-sm font-medium text-gray-900">Add New Vehicle</p>
                  <p className="text-xs text-gray-500">Register a new vehicle to your fleet</p>
                </div>
                <ArrowRight className="h-5 w-5 text-indigo-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate("/adminuserlist")}
                className="action-button w-full flex items-center p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md"
              >
                <div className="p-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md">
                  <Users className="h-5 w-5" />
                </div>
                <div className="ml-4 flex-grow text-left">
                  <p className="text-sm font-medium text-gray-900">Manage Users</p>
                  <p className="text-xs text-gray-500">View and manage customer accounts</p>
                </div>
                <ArrowRight className="h-5 w-5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate("/adminblacklist")}
                className="action-button w-full flex items-center p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md"
              >
                <div className="p-2 rounded-full bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-md">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="ml-4 flex-grow text-left">
                  <p className="text-sm font-medium text-gray-900">Blacklist Management</p>
                  <p className="text-xs text-gray-500">Manage blacklisted customers</p>
                </div>
                <ArrowRight className="h-5 w-5 text-red-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate("/listvehicle")}
                className="action-button w-full flex items-center p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md"
              >
                <div className="p-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-md">
                  <Tool className="h-5 w-5" />
                </div>
                <div className="ml-4 flex-grow text-left">
                  <p className="text-sm font-medium text-gray-900">Vehicle Management</p>
                  <p className="text-xs text-gray-500">View and manage your vehicle fleet</p>
                </div>
                <ArrowRight className="h-5 w-5 text-amber-600 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div ref={statusRef} className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">System Status</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="status-item flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-gradient-to-r from-green-400 to-green-500 text-white shadow-sm mr-3">
                  <Clock className="h-5 w-5" />
                </div>
                <span className="text-sm text-gray-700 font-medium">Vehicle Management System</span>
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
                Operational
              </span>
            </div>

            <div className="status-item flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-gradient-to-r from-green-400 to-green-500 text-white shadow-sm mr-3">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-sm text-gray-700 font-medium">User Management System</span>
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
                Operational
              </span>
            </div>

            <div className="status-item flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-gradient-to-r from-green-400 to-green-500 text-white shadow-sm mr-3">
                  <Shield className="h-5 w-5" />
                </div>
                <span className="text-sm text-gray-700 font-medium">Security System</span>
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
                Operational
              </span>
            </div>

            <div className="status-item flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-gradient-to-r from-green-400 to-green-500 text-white shadow-sm mr-3">
                  <Calendar className="h-5 w-5" />
                </div>
                <span className="text-sm text-gray-700 font-medium">Booking System</span>
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
                Operational
              </span>
            </div>

            <div className="status-item pt-4 border-t border-gray-200">
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