"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Header from "../layouts/Header"
import Footer from "../layouts/Footer"
import CustomerRegistrationsChart from "./CustomerRegistrationsChart"
import {
  Car,
  Calendar,
  Users,
  PenToolIcon as Tool,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Activity,
  Zap,
} from "lucide-react"

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalVehicles: 0,
    availableVehicles: 0,
    activeBookings: 0,
    pendingBookings: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentBookings: [],
    vehiclesNeedingMaintenance: 0,
    loading: true,
  })

  useEffect(() => {
    // Simulate fetching dashboard data
    const fetchDashboardData = async () => {
      try {
        // In a real application, you would fetch this data from your API
        // const token = localStorage.getItem("token")
        // const response = await axios.get("http://localhost:1111/api/v1/admin/dashboard", {
        //   headers: { Authorization: `Bearer ${token}` },
        // })
        // setDashboardData({ ...response.data, loading: false })

        // Simulated data for demonstration
        setTimeout(() => {
          setDashboardData({
            totalVehicles: 48,
            availableVehicles: 32,
            activeBookings: 16,
            pendingBookings: 7,
            totalUsers: 215,
            totalRevenue: 128750,
            recentBookings: [
              { id: "BK-7829", user: "John Smith", vehicle: "Toyota Camry", status: "Active", date: "2023-05-15" },
              { id: "BK-7830", user: "Emma Johnson", vehicle: "Honda Civic", status: "Pending", date: "2023-05-16" },
              {
                id: "BK-7831",
                user: "Michael Brown",
                vehicle: "Tesla Model 3",
                status: "Completed",
                date: "2023-05-14",
              },
              { id: "BK-7832", user: "Sophia Williams", vehicle: "BMW X5", status: "Active", date: "2023-05-15" },
            ],
            vehiclesNeedingMaintenance: 3,
            loading: false,
          })
        }, 1000)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setDashboardData((prev) => ({ ...prev, loading: false }))
      }
    }

    fetchDashboardData()
  }, [])

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back. Here's an overview of your rental business.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Vehicles */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                <Car className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Vehicles</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardData.loading ? (
                      <span className="inline-block w-12 h-6 bg-gray-200 animate-pulse rounded"></span>
                    ) : (
                      dashboardData.totalVehicles
                    )}
                  </p>
                  <p className="ml-2 text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    8%
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500">Available: </span>
                <span className="text-sm font-medium text-gray-900">
                  {dashboardData.loading ? (
                    <span className="inline-block w-8 h-4 bg-gray-200 animate-pulse rounded"></span>
                  ) : (
                    dashboardData.availableVehicles
                  )}
                </span>
              </div>
              <Link
                to="/listvehicle"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                View all
              </Link>
            </div>
          </div>

          {/* Active Bookings */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Bookings</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardData.loading ? (
                      <span className="inline-block w-12 h-6 bg-gray-200 animate-pulse rounded"></span>
                    ) : (
                      dashboardData.activeBookings
                    )}
                  </p>
                  <p className="ml-2 text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    12%
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500">Pending: </span>
                <span className="text-sm font-medium text-gray-900">
                  {dashboardData.loading ? (
                    <span className="inline-block w-8 h-4 bg-gray-200 animate-pulse rounded"></span>
                  ) : (
                    dashboardData.pendingBookings
                  )}
                </span>
              </div>
              <Link
                to="/bookinghistory"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                View all
              </Link>
            </div>
          </div>

          {/* Total Users */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardData.loading ? (
                      <span className="inline-block w-12 h-6 bg-gray-200 animate-pulse rounded"></span>
                    ) : (
                      dashboardData.totalUsers
                    )}
                  </p>
                  <p className="ml-2 text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    5%
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500">New this month: </span>
                <span className="text-sm font-medium text-gray-900">24</span>
              </div>
              <Link
                to="/adminuserlist"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                View all
              </Link>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
                <DollarSign className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">
                    {dashboardData.loading ? (
                      <span className="inline-block w-20 h-6 bg-gray-200 animate-pulse rounded"></span>
                    ) : (
                      formatCurrency(dashboardData.totalRevenue)
                    )}
                  </p>
                  <p className="ml-2 text-sm text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    15%
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500">This month: </span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(42500)}</span>
              </div>
              <Link
                to="/revenue"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                View details
              </Link>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Recent Bookings</h2>
              <Link
                to="/bookinghistory"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Booking ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Customer
                    </th>
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
                      Date
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
                  {dashboardData.loading ? (
                    // Loading skeleton
                    Array(4)
                      .fill(0)
                      .map((_, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                          </td>
                        </tr>
                      ))
                  ) : dashboardData.recentBookings.length > 0 ? (
                    dashboardData.recentBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.user}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.vehicle}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(booking.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              booking.status,
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No recent bookings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-6">
              <Link
                to="/addvehicle"
                className="flex items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
                  <Car className="h-5 w-5" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Add New Vehicle</p>
                  <p className="text-xs text-gray-500">Register a new vehicle to your fleet</p>
                </div>
              </Link>

              <Link
                to="/adminuserlist"
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Manage Users</p>
                  <p className="text-xs text-gray-500">View and manage customer accounts</p>
                </div>
              </Link>

              <Link
                to="/bookinghistory"
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="p-2 rounded-full bg-green-100 text-green-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Manage Bookings</p>
                  <p className="text-xs text-gray-500">View and process rental bookings</p>
                </div>
              </Link>

              <Link
                to="/maintenance"
                className="flex items-center p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <div className="p-2 rounded-full bg-amber-100 text-amber-600">
                  <Tool className="h-5 w-5" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Schedule Maintenance</p>
                  <p className="text-xs text-gray-500">
                    {dashboardData.vehiclesNeedingMaintenance > 0
                      ? `${dashboardData.vehiclesNeedingMaintenance} vehicles need attention`
                      : "All vehicles are in good condition"}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Analytics and Insights */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Registrations Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Customer Registrations</h2>
            </div>
            <div className="p-6">
              <CustomerRegistrationsChart />
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">System Status</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-sm text-gray-700">Booking System</span>
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  Operational
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-sm text-gray-700">Payment Processing</span>
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  Operational
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-sm text-gray-700">Vehicle Tracking</span>
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  Operational
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-yellow-500 mr-3" />
                  <span className="text-sm text-gray-700">Maintenance Module</span>
                </div>
                <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                  Degraded
                </span>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center">
                  <Zap className="h-5 w-5 text-indigo-500 mr-2" />
                  <span className="text-sm font-medium text-gray-900">System Updates</span>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Next scheduled maintenance: <span className="font-medium">June 15, 2023 (02:00 - 04:00 UTC)</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default AdminDashboard
