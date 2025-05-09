"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { jwtDecode } from "jwt-decode"
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import Header from "../layouts/Header"
import Footer from "../layouts/Footer"
import { Search, Plus, Trash2, Eye, Car, Download, RefreshCw, Calendar, DollarSign, Star, ChevronDown, SlidersHorizontal, Clock, BarChart3, CheckCircle, XCircle, Tag, MapPin, Filter, ArrowUpDown } from 'lucide-react'

const AdminVehicleList = () => {
  const [vehicles, setVehicles] = useState([])
  const [filteredVehicles, setFilteredVehicles] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "ascending" })
  const [filterType, setFilterType] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState("grid") // grid or list
  const [vehicleTypes, setVehicleTypes] = useState([])
  const [selectedVehicleType, setSelectedVehicleType] = useState("all")
  const [rentRangeFilter, setRentRangeFilter] = useState({ min: 0, max: 100000 })
  const [maxRent, setMaxRent] = useState(0)
  const navigate = useNavigate()

  const fetchVehicles = async () => {
    try {
      setIsRefreshing(true)
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Authorization token is missing")

      const decodedToken = jwtDecode(token)
      const adminId = decodedToken.id
      if (!adminId) throw new Error("Admin ID not found in token")

      const response = await axios.get("http://localhost:1111/api/v1/admin/vehicles", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })

      if (response.data.success && response.data.vehicles.length > 0) {
        const vehiclesData = response.data.vehicles
        
        setVehicles(vehiclesData)
        setFilteredVehicles(vehiclesData)
        
        // Extract unique vehicle types
        const types = [...new Set(vehiclesData.map(v => v.vehicleType).filter(Boolean))]
        setVehicleTypes(types)
        
        // Find max rent for range filter
        const maxRentValue = Math.max(...vehiclesData.map(v => v.rentPerDay || 0))
        setMaxRent(maxRentValue)
        setRentRangeFilter({ min: 0, max: maxRentValue })
      } else {
        setError("No vehicles found.")
      }
    } catch (err) {
      setError("Failed to fetch vehicles. Please try again.")
      console.error("Error fetching vehicles:", err)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }
  

  useEffect(() => {
    fetchVehicles()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [vehicles, searchTerm, filterType, sortConfig, selectedVehicleType, rentRangeFilter])

  const deleteVehicle = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This vehicle will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#4f46e5",
      confirmButtonText: "Yes, delete it!",
      background: "#ffffff",
      color: "#1e293b",
      customClass: {
        confirmButton: "px-4 py-2 rounded-md text-white",
        cancelButton: "px-4 py-2 rounded-md text-white",
      },
    })

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:1111/api/v1/admin/vehicle/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })

        Swal.fire({
          title: "Deleted!",
          text: "The vehicle has been removed.",
          icon: "success",
          background: "#ffffff",
          color: "#1e293b",
          confirmButtonColor: "#4f46e5",
          customClass: {
            confirmButton: "px-4 py-2 rounded-md text-white",
          },
        })

        fetchVehicles()
      } catch (err) {
        Swal.fire({
          title: "Error!",
          text: "Failed to delete vehicle.",
          icon: "error",
          background: "#ffffff",
          color: "#1e293b",
          confirmButtonColor: "#dc2626",
          customClass: {
            confirmButton: "px-4 py-2 rounded-md text-white",
          },
        })
      }
    }
  }

  const handleSearch = (event) => {
    setSearchTerm(event.target.value)
  }

  const handleSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  const handleFilterChange = (type) => {
    setFilterType(type)
  }

  const handleVehicleTypeChange = (type) => {
    setSelectedVehicleType(type)
  }

  const handleRentRangeChange = (type, value) => {
    setRentRangeFilter(prev => ({
      ...prev,
      [type]: parseInt(value)
    }))
  }

  const applyFiltersAndSort = () => {
    let filtered = [...vehicles]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.year?.toString().includes(searchTerm) ||
          vehicle.licensePlateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.vehicleType?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply availability filter
    if (filterType !== "all") {
      if (filterType === "available") {
        filtered = filtered.filter((vehicle) => vehicle.availableStatus === true)
      } else if (filterType === "unavailable") {
        filtered = filtered.filter((vehicle) => vehicle.availableStatus === false)
      }
    }

    // Apply vehicle type filter
    if (selectedVehicleType !== "all") {
      filtered = filtered.filter((vehicle) => vehicle.vehicleType === selectedVehicleType)
    }

    // Apply rent range filter
    filtered = filtered.filter((vehicle) => {
      const rent = vehicle.rentPerDay || 0
      return rent >= rentRangeFilter.min && rent <= rentRangeFilter.max
    })

    // Apply sort
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key] || ""
      const bValue = b[sortConfig.key] || ""

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1
      }
      return 0
    })

    setFilteredVehicles(filtered)
  }

  const exportToCSV = () => {
    // Create CSV content
    const headers = ["Name", "Brand", "Model", "Year", "License Plate", "Vehicle Type", "Rent Per Day", "Status"]
    const csvContent = [
      headers.join(","),
      ...filteredVehicles.map((vehicle) =>
        [
          `"${vehicle.name || ""}"`,
          `"${vehicle.brand || ""}"`,
          `"${vehicle.model || ""}"`,
          vehicle.year || "",
          `"${vehicle.licensePlateNumber || ""}"`,
          `"${vehicle.vehicleType || ""}"`,
          vehicle.rentPerDay || 0,
          vehicle.availableStatus ? "Available" : "Unavailable",
        ].join(","),
      ),
    ].join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `vehicle-list-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Calculate total revenue potential (unique feature)
  const calculateTotalRevenuePotential = () => {
    return vehicles
      .filter(v => v.availableStatus === true)
      .reduce((total, vehicle) => total + (vehicle.rentPerDay || 0), 0)
  }

  // Get most popular vehicle type
  const getMostPopularVehicleType = () => {
    const typeCounts = {}
    vehicles.forEach(vehicle => {
      if (vehicle.vehicleType) {
        typeCounts[vehicle.vehicleType] = (typeCounts[vehicle.vehicleType] || 0) + 1
      }
    })
    
    let mostPopular = { type: 'None', count: 0 }
    Object.entries(typeCounts).forEach(([type, count]) => {
      if (count > mostPopular.count) {
        mostPopular = { type, count }
      }
    })
    
    return mostPopular.type
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Fleet Management</h1>
            <p className="text-gray-600 mt-1">Manage your vehicle collection efficiently</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={fetchVehicles}
              disabled={isRefreshing}
              className={`px-3 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 text-sm ${isRefreshing ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button
              onClick={exportToCSV}
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 text-sm"
            >
              <Download className="h-4 w-4" /> Export
            </button>
            <button
              onClick={() => navigate("/addvehicle")}
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-all duration-200 flex items-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4" /> Add Vehicle
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search by name, brand, model, year..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-sm"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
              
              <div className="relative">
                <button
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-sm"
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                >
                  {viewMode === "grid" ? (
                    <>
                      <BarChart3 className="h-4 w-4" /> List View
                    </>
                  ) : (
                    <>
                      <Car className="h-4 w-4" /> Grid View
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filterType}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="all">All Vehicles</option>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                  <select
                    value={selectedVehicleType}
                    onChange={(e) => handleVehicleTypeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="all">All Types</option>
                    {vehicleTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <div className="flex gap-2">
                    <select
                      value={sortConfig.key}
                      onChange={(e) => handleSort(e.target.value)}
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                      <option value="name">Name</option>
                      <option value="brand">Brand</option>
                      <option value="year">Year</option>
                      <option value="model">Model</option>
                      <option value="rentPerDay">Rent Price</option>
                    </select>
                    <button
                      onClick={() =>
                        setSortConfig({
                          ...sortConfig,
                          direction: sortConfig.direction === "ascending" ? "descending" : "ascending",
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      {sortConfig.direction === "ascending" ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4 transform rotate-180" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Rent Range Filter */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rent Price Range: {formatCurrency(rentRangeFilter.min)} - {formatCurrency(rentRangeFilter.max)}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="range"
                      min="0"
                      max={maxRent}
                      value={rentRangeFilter.min}
                      onChange={(e) => handleRentRangeChange('min', e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{formatCurrency(0)}</span>
                      <span>{formatCurrency(maxRent/2)}</span>
                    </div>
                  </div>
                  <div>
                    <input
                      type="range"
                      min={rentRangeFilter.min}
                      max={maxRent}
                      value={rentRangeFilter.max}
                      onChange={(e) => handleRentRangeChange('max', e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{formatCurrency(rentRangeFilter.min)}</span>
                      <span>{formatCurrency(maxRent)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Car className="text-indigo-600 h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-gray-500 text-sm font-medium">Total Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <CheckCircle className="text-emerald-600 h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-gray-500 text-sm font-medium">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {vehicles.filter((v) => v.availableStatus === true).length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-amber-100 rounded-lg">
                <DollarSign className="text-amber-600 h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-gray-500 text-sm font-medium">Daily Revenue Potential</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(calculateTotalRevenuePotential())}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Star className="text-blue-600 h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-gray-500 text-sm font-medium">Most Popular Type</p>
                <p className="text-xl font-bold text-gray-900 truncate">
                  {getMostPopularVehicleType()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">{filteredVehicles.length}</span> of{" "}
                <span className="font-medium">{vehicles.length}</span> vehicles
              </p>
            </div>

            {/* Vehicle Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVehicles.map((vehicle) => (
                  <div
                    key={vehicle._id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200 group"
                  >
                    <div className="relative overflow-hidden h-48">
                      <img
                        src={vehicle.images?.[0]?.url || "/placeholder.svg?height=192&width=384"}
                        alt={vehicle.name}
                        className="w-full h-full object-cover object-center transition-all duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full text-xs font-semibold text-gray-800">
                        {vehicle.year}
                      </div>
                      <div
                        className={`absolute bottom-3 left-3 px-2 py-1 rounded-full text-xs font-semibold ${vehicle.availableStatus ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {vehicle.availableStatus ? "Available" : "Unavailable"}
                      </div>
                      {vehicle.rentPerDay && (
                        <div className="absolute bottom-3 right-3 bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-semibold">
                          {formatCurrency(vehicle.rentPerDay)}/day
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="text-lg font-bold mb-1 text-gray-900 line-clamp-1">{vehicle.name}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-gray-600 font-medium">{vehicle.brand}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">{vehicle.model}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-gray-50 rounded-md p-2 text-center">
                          <p className="text-xs text-gray-500 mb-1">Fuel</p>
                          <p className="font-medium text-gray-800 text-sm">{vehicle.fuelType || "N/A"}</p>
                        </div>
                        <div className="bg-gray-50 rounded-md p-2 text-center">
                          <p className="text-xs text-gray-500 mb-1">Seats</p>
                          <p className="font-medium text-gray-800 text-sm">{vehicle.seatingCapacity || "N/A"}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => navigate(`/admin/vehicle/${vehicle._id}`)}
                          className="flex-1 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center gap-1"
                        >
                          <Eye className="h-4 w-4" /> View Details
                        </button>
                        <button
                          onClick={() => deleteVehicle(vehicle._id)}
                          className="p-2 bg-white text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-all duration-200 flex items-center justify-center"
                          aria-label="Delete vehicle"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Vehicle List View */}
            {viewMode === "list" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vehicle
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rent/Day
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredVehicles.map((vehicle) => (
                        <tr key={vehicle._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden">
                                <img 
                                  className="h-10 w-10 object-cover" 
                                  src={vehicle.images?.[0]?.url || "/placeholder.svg?height=40&width=40"} 
                                  alt={vehicle.name} 
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{vehicle.name}</div>
                                <div className="text-sm text-gray-500">{vehicle.brand} {vehicle.model} • {vehicle.year}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{vehicle.fuelType || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{vehicle.seatingCapacity || 'N/A'} seats</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Tag className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-900">{vehicle.vehicleType || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{formatCurrency(vehicle.rentPerDay || 0)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              vehicle.availableStatus ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}>
                              {vehicle.availableStatus ? "Available" : "Unavailable"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => navigate(`/admin/vehicle/${vehicle._id}`)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                View
                              </button>
                              <button
                                onClick={() => deleteVehicle(vehicle._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredVehicles.length === 0 && !loading && !error && (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
                <Car className="mx-auto text-gray-300 h-16 w-16 mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No vehicles found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search filters or add a new vehicle</p>
                <button
                  onClick={() => navigate("/addvehicle")}
                  className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-all duration-200 inline-flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Add New Vehicle
                </button>
              </div>
            )}
          </>
        )}
        
        {/* Vehicle Insights Panel - Unique Feature */}
        {!loading && filteredVehicles.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" /> 
              Fleet Insights
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 text-indigo-600 mr-2" />
                  <h4 className="font-medium text-gray-900">Average Vehicle Age</h4>
                </div>
                <p className="text-2xl font-bold text-indigo-700">
                  {(() => {
                    const currentYear = new Date().getFullYear();
                    const totalYears = vehicles.reduce((sum, v) => sum + (currentYear - (v.year || currentYear)), 0);
                    return Math.round(totalYears / (vehicles.length || 1)) + " years";
                  })()}
                </p>
                <p className="text-sm text-gray-600 mt-1">Based on manufacturing year</p>
              </div>
              
              <div className="bg-emerald-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <DollarSign className="h-5 w-5 text-emerald-600 mr-2" />
                  <h4 className="font-medium text-gray-900">Average Daily Rate</h4>
                </div>
                <p className="text-2xl font-bold text-emerald-700">
                  {formatCurrency(
                    vehicles.reduce((sum, v) => sum + (v.rentPerDay || 0), 0) / (vehicles.length || 1)
                  )}
                </p>
                <p className="text-sm text-gray-600 mt-1">Per vehicle per day</p>
              </div>
              
              <div className="bg-amber-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <MapPin className="h-5 w-5 text-amber-600 mr-2" />
                  <h4 className="font-medium text-gray-900">Fleet Utilization</h4>
                </div>
                <p className="text-2xl font-bold text-amber-700">
                  {Math.round(
                    (vehicles.filter(v => v.availableStatus === false).length / (vehicles.length || 1)) * 100
                  )}%
                </p>
                <p className="text-sm text-gray-600 mt-1">Currently in use</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default AdminVehicleList

