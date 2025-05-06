"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { Search, Users, MapPin, Sliders, X } from "lucide-react"
import Header from "../layouts/userheader"

const UserVehicleList = () => {
  const [vehicles, setVehicles] = useState([])
  const [filteredVehicles, setFilteredVehicles] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filterType, setFilterType] = useState("all")
  const [vehicleTypes, setVehicleTypes] = useState([])
  const [selectedVehicleType, setSelectedVehicleType] = useState("all")
  const [rentRangeFilter, setRentRangeFilter] = useState({ min: 0, max: 100000 })
  const [maxRent, setMaxRent] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const fetchVehicles = async () => {
    try {
      const response = await axios.get("http://localhost:1111/api/v1/vehicles")

      if (response.data.success && response.data.vehicles.length > 0) {
        const vehiclesData = response.data.vehicles
        setVehicles(vehiclesData)
        setFilteredVehicles(vehiclesData)

        // Extract unique vehicle types
        const types = [...new Set(vehiclesData.map((v) => v.vehicleType).filter(Boolean))]
        setVehicleTypes(types)

        // Find max rent for range filter
        const maxRentValue = Math.max(...vehiclesData.map((v) => v.rentPerDay || 0))
        setMaxRent(maxRentValue)
        setRentRangeFilter({ min: 0, max: maxRentValue })

        setError(null)
      } else {
        setError("No vehicles found.")
      }
    } catch (err) {
      setError("Failed to fetch vehicles. Please try again.")
      console.error("Error fetching vehicles:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [vehicles, searchTerm, filterType, selectedVehicleType, rentRangeFilter])

  const handleSearch = (event) => {
    setSearchTerm(event.target.value)
  }

  const handleFilterChange = (type) => {
    setFilterType(type)
  }

  const handleVehicleTypeChange = (type) => {
    setSelectedVehicleType(type)
  }

  const handleRentRangeChange = (type, value) => {
    setRentRangeFilter((prev) => ({
      ...prev,
      [type]: Number.parseInt(value),
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

    setFilteredVehicles(filtered)
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
    <div className="min-h-screen bg-white">
      {/* Custom Header for User Site */}
     <Header/>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Find Your Perfect Rental Vehicle</h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl">
              Choose from our wide selection of premium vehicles for any occasion
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search by brand, model, type or year..."
                className="block w-full pl-10 pr-4 py-3 border border-transparent rounded-lg bg-white shadow-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Controls */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Available Vehicles</h2>
            <p className="text-gray-600">
              Showing <span className="font-medium">{filteredVehicles.length}</span> of{" "}
              <span className="font-medium">{vehicles.length}</span> vehicles
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2"
            >
              <Sliders className="h-4 w-4" />
              {showFilters ? "Hide Filters" : "Filter Options"}
            </button>

            <select
              value={filterType}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <option value="all">All Vehicles</option>
              <option value="available">Available Only</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                <select
                  value={selectedVehicleType}
                  onChange={(e) => handleVehicleTypeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="all">All Types</option>
                  {vehicleTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Range: {formatCurrency(rentRangeFilter.min)} - {formatCurrency(rentRangeFilter.max)}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="range"
                      min="0"
                      max={maxRent}
                      value={rentRangeFilter.min}
                      onChange={(e) => handleRentRangeChange("min", e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{formatCurrency(0)}</span>
                      <span>{formatCurrency(maxRent / 2)}</span>
                    </div>
                  </div>
                  <div>
                    <input
                      type="range"
                      min={rentRangeFilter.min}
                      max={maxRent}
                      value={rentRangeFilter.max}
                      onChange={(e) => handleRentRangeChange("max", e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{formatCurrency(rentRangeFilter.min)}</span>
                      <span>{formatCurrency(maxRent)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
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
            <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Vehicle Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVehicles.map((vehicle) => (
                <div
                  key={vehicle._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  onClick={() => navigate(`/vehicle/${vehicle._id}`)}
                >
                  <div className="relative">
                    <img
                      src={vehicle.images?.[0]?.url || "/placeholder.svg?height=192&width=384"}
                      alt={vehicle.name}
                      className="w-full h-48 object-cover"
                    />
                    <div
                      className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-semibold ${
                        vehicle.availableStatus ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {vehicle.availableStatus ? "Available" : "Unavailable"}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{vehicle.name}</h3>
                        <p className="text-sm text-gray-600">
                          {vehicle.brand} {vehicle.model} • {vehicle.year}
                        </p>
                      </div>
                      <div className="text-teal-600 font-bold">{formatCurrency(vehicle.rentPerDay || 0)}/day</div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{vehicle.seatingCapacity || "N/A"} seats</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <FuelIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{vehicle.fuelType || "N/A"}</span>
                        </div>
                      </div>
                    </div>

                    <button className="mt-4 w-full py-2 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredVehicles.length === 0 && !loading && (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
                <svg
                  className="mx-auto h-16 w-16 text-gray-300"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                  <circle cx="7" cy="17" r="2" />
                  <path d="M9 17h6" />
                  <circle cx="17" cy="17" r="2" />
                </svg>
                <h3 className="mt-4 text-xl font-bold text-gray-800">No vehicles found</h3>
                <p className="mt-2 text-gray-500">Try adjusting your search filters</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">SK Rentals</h3>
              <p className="text-gray-400 text-sm">
                Premium vehicle rental services for all your needs. Experience comfort, style, and reliability.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="/" className="hover:text-teal-400 transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/vehicles" className="hover:text-teal-400 transition-colors">
                    Vehicles
                  </a>
                </li>
                <li>
                  <a href="/services" className="hover:text-teal-400 transition-colors">
                    Services
                  </a>
                </li>
                <li>
                  <a href="/about" className="hover:text-teal-400 transition-colors">
                    About Us
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  123 Rental Street, City
                </li>
                <li className="flex items-center">
                  <svg
                    className="h-4 w-4 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  +1 (555) 123-4567
                </li>
                <li className="flex items-center">
                  <svg
                    className="h-4 w-4 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  info@skrentals.com
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} SK Rentals. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Custom Fuel icon since it's not in lucide-react by default
const FuelIcon = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 22h12" />
      <path d="M4 9h10" />
      <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18" />
      <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5" />
    </svg>
  )
}

export default UserVehicleList
