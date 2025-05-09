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
} from "lucide-react"

function StaffDashboard() {
  const [vehicles, setVehicles] = useState([])
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [vehiclesList, setVehiclesList] = useState([])

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
    const tenDaysAgo = new Date()
    tenDaysAgo.setDate(today.getDate() - 10)
    const overdue = records.filter((record) => new Date(record.date) < tenDaysAgo)
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

  const COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"]

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-md border-b border-gray-700 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center">
          <Car className="h-6 w-6 text-indigo-400 mr-2" />
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
            Vehicle Maintenance Dashboard
          </h1>
        </div>
        <nav className="flex flex-wrap justify-center gap-2 md:gap-6">
          <a
            href="/staff"
            className="px-3 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-200"
          >
            Staff Dashboard
          </a>
          <a
            href="/list"
            className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
          >
            Maintenance List
          </a>
          <a
            href="/add"
            className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
          >
            Add Maintenance
          </a>
          <a
            href="/logout"
            className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
          >
            Logout
          </a>
        </nav>
      </div>

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
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
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
                    Overdue: <span className="font-medium text-red-600">{reminderCount}</span>
                  </div>
                  <a
                    href="/reminders"
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
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip
                        formatter={(value) => [`$${value}`, "Cost"]}
                        contentStyle={{
                          backgroundColor: "#fff",
                          borderRadius: "0.375rem",
                          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                        }}
                      />
                      <Legend wrapperStyle={{ paddingTop: 10 }} />
                      <Bar dataKey="cost" fill="#4f46e5" name="Cost" radius={[4, 4, 0, 0]} animationDuration={1500} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center mb-4">
                    <PieChartIcon className="h-5 w-5 text-blue-600 mr-2" />
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
                        formatter={(value) => [`$${value}`, "Cost"]}
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
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      formatter={(value) => [`$${value}`, "Cost"]}
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
                      stroke="#4f46e5"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#4f46e5", strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 6, fill: "#4f46e5", strokeWidth: 2, stroke: "#fff" }}
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
                    <h2 className="text-lg font-semibold text-gray-900">Overdue Maintenance</h2>
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
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Cost
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reminder.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(reminder.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(reminder.cost)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <a href={`/maintenance/${reminder.id}`} className="text-indigo-600 hover:text-indigo-900">
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
                      href="/reminders"
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
