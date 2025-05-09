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
  Calendar,
  Clock,
} from "lucide-react"

function ReminderPage() {
  const navigate = useNavigate()
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

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
      const tenDaysAgo = new Date()
      tenDaysAgo.setDate(today.getDate() - 10)

      const overdue = records.filter((record) => new Date(record.date) < tenDaysAgo)
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

  const handleMarkAsDone = async (id) => {
    try {
      await axios.put(`http://localhost:1111/api/v1/maintenances/edit/${id}`, {
        status: "Done",
      })
      setReminders(reminders.filter((r) => r._id !== id))
      setSuccess("Maintenance status updated to Done.")
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error updating status:", error)
      setError("Something went wrong while updating the status.")
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      navigate("/login")
    }
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
        return "bg-red-100 text-red-800"
      case "Battery Replacement":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Car className="h-6 w-6 text-indigo-400 mr-2" />
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
            Vehicle Maintenance
          </h1>
        </div>
        <nav className="flex gap-4">
          <button onClick={() => navigate("/staff")} className="hover:underline">Dashboard</button>
          <button onClick={() => navigate("/add")} className="hover:underline">Add Maintenance</button>
          <button onClick={() => navigate("/list")} className="hover:underline">List</button>
          <button className="text-indigo-300 underline">Reminders</button>
          <button onClick={handleLogout} className="hover:underline">Logout</button>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Overdue Maintenance</h2>
          <button
            onClick={fetchReminders}
            disabled={isRefreshing}
            className="px-4 py-2 border rounded-md text-sm flex items-center gap-2 bg-white text-gray-700 hover:bg-gray-100"
          >
            <RefreshCw className={`${isRefreshing ? "animate-spin" : ""} h-4 w-4`} /> Refresh
          </button>
        </div>

        {/* Alerts */}
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

        {/* Loading */}
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
              <div
                key={reminder._id}
                className="flex justify-between items-start md:items-center border rounded-lg p-4 shadow-sm hover:shadow transition"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    Vehicle ID: {reminder.vehicleId}
                  </h3>
                  <p className="text-sm text-gray-500 mb-1">Last Maintenance: {formatDate(reminder.date)}</p>
                  <span
                    className={`inline-block text-xs px-2 py-1 rounded-full font-semibold ${getTypeColor(
                      reminder.type,
                    )}`}
                  >
                    {reminder.type}
                  </span>
                  <p className="mt-2 text-sm text-gray-600">{reminder.description}</p>
                </div>
                <button
                  onClick={() => handleMarkAsDone(reminder._id)}
                  className="mt-4 md:mt-0 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
                >
                  Mark as Done
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReminderPage
