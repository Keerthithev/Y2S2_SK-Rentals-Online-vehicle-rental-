"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import { Car, Calendar, FileText, DollarSign, Save, X, ArrowLeft, LogOut, Plus, Bell, AlertCircle, Info, Menu, Settings, List, Wrench } from 'lucide-react'


function AddMaintenance() {
  const [vehicleId, setVehicleId] = useState("")
  const [date, setDate] = useState("")
  const [type, setType] = useState("")
  const [description, setDescription] = useState("")
  const [cost, setCost] = useState("")
  const [errors, setErrors] = useState({
    vehicleId: "",
    date: "",
    type: "",
    description: "",
    cost: "",
    general: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  // Fetch all vehicles when component mounts
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          navigate("/login")
          return
        }

        // Fetch available vehicles
        const vehiclesResponse = await axios.get("http://localhost:1111/api/v1/vehicles", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (vehiclesResponse.data.success && vehiclesResponse.data.vehicles.length > 0) {
          setVehicles(vehiclesResponse.data.vehicles)
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error)
        setErrors({
          ...errors,
          general: "Failed to load vehicles. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchVehicles()
  }, [navigate])

  const maintenanceTypes = [
    "Oil Change",
    "Brake Inspection",
    "Tire Replacement",
    "Engine Repair",
    "Battery Replacement",
    "Transmission Service",
    "Air Filter Replacement",
    "Coolant Flush",
    "Wheel Alignment",
    "Other",
  ]

  const validateForm = () => {
    const newErrors = {
      vehicleId: "",
      date: "",
      type: "",
      description: "",
      cost: "",
      general: "",
    }
    let isValid = true

    // Validate Vehicle ID
    if (!vehicleId.trim()) {
      newErrors.vehicleId = "Vehicle ID is required"
      isValid = false
    }

    // Validate Date
    if (!date) {
      newErrors.date = "Date is required"
      isValid = false
    } else {
      // Check if date is in the future
      const today = new Date().toISOString().split("T")[0]
      if (date > today) {
        newErrors.date = "Future dates are not allowed"
        isValid = false
      }
    }

    // Validate Type
    if (!type) {
      newErrors.type = "Maintenance type is required"
      isValid = false
    }

    // Validate Description
    if (!description.trim()) {
      newErrors.description = "Description is required"
      isValid = false
    } else if (description.length < 5) {
      newErrors.description = "Description must be at least 5 characters"
      isValid = false
    }

    // Validate Cost
    if (!cost) {
      newErrors.cost = "Cost is required"
      isValid = false
    } else if (isNaN(Number.parseFloat(cost)) || Number.parseFloat(cost) < 0) {
      newErrors.cost = "Cost must be a positive number"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    const data = { vehicleId, date, type, description, cost: Number.parseFloat(cost) }

    try {
      await axios.post("http://localhost:1111/api/v1/add", data, {
        headers: { "Content-Type": "application/json" },
      })

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Maintenance record saved successfully!",
        confirmButtonColor: "#6366f1",
      })

      navigate("/list")
    } catch (error) {
      console.error("Error adding the maintenance record:", error)

      setErrors({
        ...errors,
        general: "There was an error adding the maintenance record. Please try again.",
      })
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "There was an error adding the maintenance record.",
        confirmButtonColor: "#6366f1",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, logout!",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: "success",
          title: "Logged out!",
          confirmButtonColor: "#6366f1",
        })
        navigate("/login")
      }
    })
  }

  const handleCancel = () => {
    if (vehicleId || date || type || description || cost) {
      Swal.fire({
        title: "Discard changes?",
        text: "You have unsaved changes. Are you sure you want to leave?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#6366f1",
        cancelButtonColor: "#ef4444",
        confirmButtonText: "Yes, discard",
        cancelButtonText: "No, continue editing",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/list")
        }
      })
    } else {
      navigate("/list")
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
                <button
                  onClick={() => navigate("/staff")}
                  className="text-base font-medium text-white hover:text-indigo-200 transition-colors duration-200 flex items-center"
                >
                  <Settings className="h-4 w-4 mr-1" /> Dashboard
                </button>
                <button className="text-base font-medium text-indigo-300 border-b-2 border-indigo-300 flex items-center">
                  <Plus className="h-4 w-4 mr-1" /> Add Maintenance
                </button>
                <button
                  onClick={() => navigate("/list")}
                  className="text-base font-medium text-white hover:text-indigo-200 transition-colors duration-200 flex items-center"
                >
                  <List className="h-4 w-4 mr-1" /> Maintenance List
                </button>
                <button
                  onClick={() => navigate("/reminder")}
                  className="text-base font-medium text-white hover:text-indigo-200 transition-colors duration-200 flex items-center"
                >
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
                      <button className="-m-3 p-3 flex items-center rounded-md bg-indigo-50">
                        <Plus className="flex-shrink-0 h-6 w-6 text-indigo-600" />
                        <span className="ml-3 text-base font-medium text-indigo-900">Add Maintenance</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate("/list")
                          setMobileMenuOpen(false)
                        }}
                        className="-m-3 p-3 flex items-center rounded-md hover:bg-gray-50"
                      >
                        <List className="flex-shrink-0 h-6 w-6 text-indigo-600" />
                        <span className="ml-3 text-base font-medium text-gray-900">Maintenance List</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate("/reminder")
                          setMobileMenuOpen(false)
                        }}
                        className="-m-3 p-3 flex items-center rounded-md hover:bg-gray-50"
                      >
                        <Bell className="flex-shrink-0 h-6 w-6 text-indigo-600" />
                        <span className="ml-3 text-base font-medium text-gray-900">Reminders</span>
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
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bbg-indigo-600 hover:bg-indigo-700"

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
                <Wrench className="h-6 w-6 text-indigo-300 mr-2" />
                <h2 className="text-xl font-semibold text-white">Add Maintenance Record</h2>
              </div>
              <div className="text-sm text-indigo-200">
                <span className="bg-indigo-700/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                  New Entry
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Add Maintenance Record</h1>
            <p className="text-gray-600 mt-1">Enter details for a new vehicle maintenance record</p>
          </div>
          <button
            onClick={() => navigate("/list")}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to List
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            {errors.general && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                  <p className="text-sm text-red-700">{errors.general}</p>
                </div>
              </div>
            )}

            {loading ? (
              <div className="py-8 flex justify-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <p className="mt-4 text-gray-600">Loading vehicles...</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Vehicle ID */}
                <div>
                  <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Car className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="vehicleId"
                      value={vehicleId}
                      onChange={(e) => {
                        setVehicleId(e.target.value)
                        if (errors.vehicleId) setErrors({ ...errors, vehicleId: "" })
                      }}
                      className={`pl-10 w-full px-4 py-2 border ${
                        errors.vehicleId ? "border-red-300 ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                      } rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-200 appearance-none`}
                    >
                      <option value="">Select Vehicle</option>
                      {vehicles.map((vehicle) => (
                        <option key={vehicle._id} value={vehicle._id}>
                          {vehicle.name} - {vehicle.brand} {vehicle.model} ({vehicle.year})
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  {errors.vehicleId && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" /> {errors.vehicleId}
                    </p>
                  )}
                </div>

                {/* Date and Type - Two Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date */}
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Maintenance Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="date"
                        value={date}
                        onChange={(e) => {
                          setDate(e.target.value)
                          if (errors.date) setErrors({ ...errors, date: "" })
                        }}
                        className={`pl-10 w-full px-4 py-2 border ${
                          errors.date ? "border-red-300 ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                        } rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-200`}
                      />
                    </div>
                    {errors.date && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" /> {errors.date}
                      </p>
                    )}
                  </div>

                  {/* Type */}
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      Maintenance Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="type"
                        value={type}
                        onChange={(e) => {
                          setType(e.target.value)
                          if (errors.type) setErrors({ ...errors, type: "" })
                        }}
                        className={`pl-10 w-full px-4 py-2 border ${
                          errors.type ? "border-red-300 ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                        } rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-200 appearance-none bg-none`}
                      >
                        <option value="">Select Maintenance Type</option>
                        {maintenanceTypes.map((maintenanceType, index) => (
                          <option key={index} value={maintenanceType}>
                            {maintenanceType}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    {errors.type && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" /> {errors.type}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value)
                        if (errors.description) setErrors({ ...errors, description: "" })
                      }}
                      rows={4}
                      className={`w-full px-4 py-2 border ${
                        errors.description ? "border-red-300 ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                      } rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-200`}
                      placeholder="Describe the maintenance work performed"
                    ></textarea>
                  </div>
                  {errors.description ? (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" /> {errors.description}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-500 flex items-center">
                      <Info className="h-3 w-3 mr-1" /> Provide details about the maintenance work performed
                    </p>
                  )}
                </div>

             {/* Cost */}
                <div>
                  <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
                    Cost <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-sm text-gray-500 font-semibold">Rs</span>
                    </div>
                    <input
                      type="number"
                      id="cost"
                      value={cost}
                      onChange={(e) => {
                        setCost(e.target.value)
                        if (errors.cost) setErrors({ ...errors, cost: "" })
                      }}
                      step="0.01"
                      min="0"
                      className={`pl-10 w-full px-4 py-2 border ${
                        errors.cost ? "border-red-300 ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                      } rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-200`}
                      placeholder="Enter maintenance cost"
                    />
                  </div>
                  {errors.cost && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" /> {errors.cost}
                    </p>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" /> Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" /> Save Record
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Help Card */}
        <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-lg p-4">
          <div className="flex">
            <Info className="h-5 w-5 text-indigo-500 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-indigo-800">About Maintenance Records</h3>
              <p className="mt-1 text-sm text-indigo-700">
                Maintenance records help track vehicle service history. Enter accurate information to maintain a
                complete service history for each vehicle.
              </p>
              <ul className="mt-2 text-sm text-indigo-700 list-disc list-inside space-y-1">
                <li>Select the vehicle from the dropdown list</li>
                <li>Select the appropriate maintenance type for accurate reporting</li>
                <li>Include detailed descriptions for future reference</li>
                <li>Enter the exact cost for budget tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddMaintenance