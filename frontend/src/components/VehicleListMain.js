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
} from "lucide-react"

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
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    fetchMaintenanceData()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [vehicles, searchVehicleId, searchDate, searchType, sortConfig])

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
    const tenDaysAgo = new Date()
    tenDaysAgo.setDate(today.getDate() - 10)

    const overdue = records.filter((record) => new Date(record.date) < tenDaysAgo)
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
    if (window.confirm("Are you sure you want to delete this maintenance record? This action cannot be undone.")) {
      handleDelete(id)
    }
  }

  const handleEdit = (vehicle) => {
    setEditingId(vehicle._id)
    setEditData({ ...vehicle })
  }

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:1111/api/v1/maintenances/edit/${editingId}`, editData)
      setVehicles(vehicles.map((v) => (v._id === editingId ? editData : v)))
      setEditingId(null)
      setSuccess("Record updated successfully")
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error updating record:", error)
      setError("Failed to update record. Please try again.")
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleReminderPageNavigate = () => {
    navigate("/reminder", { state: { reminders } })
  }

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      navigate("/login")
    }
  }

  const generateReport = () => {
    try {
      // Prepare data for export
      const exportData = filteredVehicles.map((v) => ({
        "Vehicle ID": v.vehicleId,
        Date: new Date(v.date).toLocaleDateString(),
        Type: v.type,
        Description: v.description,
        "Cost (Rs.)": v.cost,
      }))

      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Vehicle Maintenance")
      XLSX.writeFile(wb, `VehicleMaintenance_${new Date().toISOString().split("T")[0]}.xlsx`)

      setSuccess("Report generated successfully")
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error generating report:", error)
      setError("Failed to generate report. Please try again.")
      setTimeout(() => setError(null), 3000)
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
  }

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
            Vehicle Maintenance
          </h1>
        </div>
        <nav className="flex flex-wrap justify-center gap-2 md:gap-4">
          <button
            onClick={() => navigate("/staff")}
            className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate("/add")}
            className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> Add Maintenance
          </button>
          <button
            onClick={() => navigate("/list")}
            className="px-3 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-200"
          >
            Maintenance List
          </button>
          <button
            onClick={handleReminderPageNavigate}
            className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 flex items-center gap-1"
          >
            <Bell className="h-4 w-4" /> Reminders
            {reminders.length > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                {reminders.length}
              </span>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 flex items-center gap-1"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </nav>
      </div>

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
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-all duration-200 flex items-center gap-2 text-sm"
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
                Vehicle ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Car className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="vehicleId"
                  placeholder="Search by Vehicle ID"
                  value={searchVehicleId}
                  onChange={(e) => setSearchVehicleId(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
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
                  <option value="Tire Replacement">Tire Replacement</option>
                  <option value="Brake Service">Brake Service</option>
                  <option value="Battery Replacement">Battery Replacement</option>
                  <option value="Other">Other</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
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
                          Vehicle ID
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
                                <input
                                  type="text"
                                  name="vehicleId"
                                  value={editData.vehicleId}
                                  onChange={handleChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                />
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
                                  <option value="Tire Replacement">Tire Replacement</option>
                                  <option value="Brake Service">Brake Service</option>
                                  <option value="Battery Replacement">Battery Replacement</option>
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
                                {v.vehicleId}
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
                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                          <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                          <p className="text-lg font-medium text-gray-900 mb-1">No maintenance records found</p>
                          <p className="text-sm text-gray-500 mb-4">
                            Try adjusting your search filters or add a new maintenance record
                          </p>
                          <button
                            onClick={() => navigate("/add")}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
      return "bg-red-100 text-red-800"
    case "Battery Replacement":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default VehicleListMain
