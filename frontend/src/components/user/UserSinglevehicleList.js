"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate, useParams } from "react-router-dom"
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  Fuel,
  Gauge,
  Settings,
  Tag,
  Check,
  X,
  ArrowLeft,
  Share2,
  Heart,
  Star,
} from "lucide-react"
import VehicleFeedbackComponent from "../FeedbackList"
import AddFeedbackForm from "../FeedbackForm"
import Header from "../layouts/userheader"

const UserSingleVehicleWithFeedback = () => {
  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { id } = useParams()
  const navigate = useNavigate()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [averageRating, setAverageRating] = useState(0)
  const [refreshFeedback, setRefreshFeedback] = useState(0) // Changed to number for incrementing

  // Fetch single vehicle details
  const fetchVehicleDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:1111/api/v1/vehicle/${id}`)
      console.log("Vehicle data fetched:", response.data)

      if (response.data.success && response.data.vehicle) {
        setVehicle(response.data.vehicle)
          
      } else {
        setError("Vehicle not found")
      }
    } catch (err) {
      setError("Failed to fetch vehicle details")
      console.error("Error fetching vehicle details:", err)
    } finally {
      setLoading(false)
    }
  }

  // Calculate average rating from feedback
  const calculateAverageRating = async () => {
    try {
      let response
      try {
        // Try the vehicle-specific endpoint first
        response = await axios.get(`http://localhost:1111/api/v1/feedbacks/vehicle/${id}`)
      } catch (endpointError) {
        // Fallback to query parameter approach
        response = await axios.get(`http://localhost:1111/api/v1/feedbacks?vehicleID=${id}`)
      }

      if (response.data && response.data.length > 0) {
        // Filter to ensure we only count ratings for this specific vehicle
        const vehicleSpecificFeedback = response.data.filter((item) => item.vehicleID === id || item.vehicleId === id)

        if (vehicleSpecificFeedback.length > 0) {
          const totalRating = vehicleSpecificFeedback.reduce((sum, item) => sum + item.rating, 0)
          setAverageRating((totalRating / vehicleSpecificFeedback.length).toFixed(1))
        } else {
          setAverageRating(0)
        }
      } else {
        setAverageRating(0)
      }
    } catch (error) {
      console.error("Error calculating average rating:", error)
      setAverageRating(0)
    }
  }

  useEffect(() => {
    fetchVehicleDetails()
    calculateAverageRating()
    // Scroll to top when component mounts
    window.scrollTo(0, 0)
  }, [id])

  // Handle feedback refresh
  const handleFeedbackAdded = () => {
    // Force immediate refresh of feedback
    calculateAverageRating()

    // Increment the refresh counter to trigger a re-fetch in the VehicleFeedbackComponent
    setRefreshFeedback((prev) => prev + 1)

    // Add a second refresh after a short delay to catch any server-side processing delays
    setTimeout(() => {
      setRefreshFeedback((prev) => prev + 1)
      calculateAverageRating()
    }, 1000)
  }

  // Handle Next & Previous Image Navigation
  const nextImage = () => {
    if (vehicle?.images?.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % vehicle.images.length)
    }
  }

  const prevImage = () => {
    if (vehicle?.images?.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? vehicle.images.length - 1 : prevIndex - 1))
    }
  }

  // Open & Close Image Modal
  const openModal = (image, index) => {
    setSelectedImage(image)
    setCurrentImageIndex(index)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedImage(null)
  }

  // Navigate to Booking Page
  const handleBookVehicle = () => {
    navigate(`/bookingVehicle/${id}`)
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

  // Get availability status with proper styling
  const getAvailabilityStatus = () => {
    if (!vehicle) return null

    return vehicle.availableStatus ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
        <Check className="w-3 h-3 mr-1" /> Available
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <X className="w-3 h-3 mr-1" /> Unavailable
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header/>
      {/* Header removed for brevity */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/uservehiclelist")}
            className="flex items-center text-gray-600 hover:text-teal-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Back to Vehicles</span>
          </button>
        </div>

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
          vehicle && (
            <div>
              {/* Vehicle Title and Actions */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{vehicle.name}</h1>
                  <div className="flex items-center mt-2 space-x-4">
                    <div className="flex items-center">
                      <span className="text-gray-600 mr-2">{vehicle.brand}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600 mx-2">{vehicle.model}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600 ml-2">{vehicle.year}</span>
                    </div>
                    {getAvailabilityStatus()}
                  </div>
                </div>
                <div className="flex space-x-3 mt-4 md:mt-0">
                  <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Vehicle Images */}
                <div className="lg:col-span-2">
                  <div className="bg-gray-100 rounded-xl overflow-hidden">
                    {vehicle.images && vehicle.images.length > 0 ? (
                      <div className="relative">
                        <img
                          src={vehicle.images[currentImageIndex]?.url || "/placeholder.svg?height=400&width=600"}
                          alt={`${vehicle.name}`}
                          className="w-full h-[400px] object-cover object-center"
                          onClick={() => openModal(vehicle.images[currentImageIndex]?.url, currentImageIndex)}
                        />
                        {vehicle.images.length > 1 && (
                          <>
                            <button
                              onClick={prevImage}
                              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white transition-colors"
                              aria-label="Previous image"
                            >
                              <ChevronLeft className="w-5 h-5 text-gray-700" />
                            </button>
                            <button
                              onClick={nextImage}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white transition-colors"
                              aria-label="Next image"
                            >
                              <ChevronRight className="w-5 h-5 text-gray-700" />
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="h-[400px] flex items-center justify-center bg-gray-200">
                        <p className="text-gray-500">No images available</p>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Gallery */}
                  {vehicle.images && vehicle.images.length > 1 && (
                    <div className="mt-4 grid grid-cols-5 gap-2">
                      {vehicle.images.map((image, index) => (
                        <div
                          key={index}
                          className={`cursor-pointer rounded-lg overflow-hidden border-2 ${
                            currentImageIndex === index ? "border-teal-500" : "border-transparent"
                          }`}
                          onClick={() => setCurrentImageIndex(index)}
                        >
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={`${vehicle.name} thumbnail ${index + 1}`}
                            className="w-full h-16 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tabs Navigation */}
                  <div className="mt-8 border-b border-gray-200">
                    <nav className="flex space-x-8">
                      <button
                        onClick={() => setActiveTab("details")}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === "details"
                            ? "border-teal-500 text-teal-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        Vehicle Details
                      </button>
                      <button
                        onClick={() => setActiveTab("reviews")}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === "reviews"
                            ? "border-teal-500 text-teal-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        Reviews
                      </button>
                    </nav>
                  </div>

                  {/* Tab Content */}
                  <div className="py-6">
                    {activeTab === "details" && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">Description</h3>
                          <p className="mt-2 text-gray-600">{vehicle.description || "No description available."}</p>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium text-gray-900">Specifications</h3>
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex items-center">
                                <Fuel className="w-5 h-5 text-teal-600 mr-3" />
                                <div>
                                  <p className="text-sm text-gray-500">Fuel Type</p>
                                  <p className="font-medium">{vehicle.fuelType || "N/A"}</p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex items-center">
                                <Settings className="w-5 h-5 text-teal-600 mr-3" />
                                <div>
                                  <p className="text-sm text-gray-500">Transmission</p>
                                  <p className="font-medium">{vehicle.transmission || "N/A"}</p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex items-center">
                                <Users className="w-5 h-5 text-teal-600 mr-3" />
                                <div>
                                  <p className="text-sm text-gray-500">Seating Capacity</p>
                                  <p className="font-medium">{vehicle.seatingCapacity || "N/A"}</p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex items-center">
                                <Gauge className="w-5 h-5 text-teal-600 mr-3" />
                                <div>
                                  <p className="text-sm text-gray-500">Mileage</p>
                                  <p className="font-medium">{vehicle.mileage ? `${vehicle.mileage} km` : "N/A"}</p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex items-center">
                                <Tag className="w-5 h-5 text-teal-600 mr-3" />
                                <div>
                                  <p className="text-sm text-gray-500">License Plate</p>
                                  <p className="font-medium">{vehicle.licensePlateNumber || "N/A"}</p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex items-center">
                                <Calendar className="w-5 h-5 text-teal-600 mr-3" />
                                <div>
                                  <p className="text-sm text-gray-500">Year</p>
                                  <p className="font-medium">{vehicle.year || "N/A"}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "reviews" && (
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900">Customer Reviews</h3>
                          <div className="flex items-center">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-5 h-5 ${
                                    star <= averageRating ? "text-yellow-400" : "text-gray-300"
                                  } fill-current`}
                                />
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-gray-600">{averageRating} out of 5</span>
                          </div>
                        </div>

                        {/* Add Feedback Form */}
                        <div className="mt-6">
                          <AddFeedbackForm vehicleID={id} onFeedbackAdded={handleFeedbackAdded} />
                        </div>

                        {/* Vehicle-specific feedback component */}
                        <div className="mt-6">
                          <h4 className="text-lg font-medium text-gray-900 mb-4">All Reviews</h4>
                          <VehicleFeedbackComponent vehicleID={id} refreshTrigger={refreshFeedback} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking Card */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-24">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Rental Details</h3>
                      <div className="text-2xl font-bold text-teal-600">
                        {formatCurrency(vehicle.rentPerDay || 0)}
                        <span className="text-sm font-normal text-gray-500">/day</span>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Vehicle Type</span>
                        <span className="font-medium">{vehicle.vehicleType || "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Seating</span>
                        <span className="font-medium">{vehicle.seatingCapacity || "N/A"} seats</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Fuel Type</span>
                        <span className="font-medium">{vehicle.fuelType || "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Transmission</span>
                        <span className="font-medium">{vehicle.transmission || "N/A"}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleBookVehicle}
                      disabled={!vehicle.availableStatus}
                      className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
                        vehicle.availableStatus ? "bg-teal-600 hover:bg-teal-700" : "bg-gray-400 cursor-not-allowed"
                      } transition-colors flex items-center justify-center`}
                    >
                      {vehicle.availableStatus ? "Book Now" : "Currently Unavailable"}
                    </button>

                    {!vehicle.availableStatus && (
                      <p className="mt-2 text-sm text-center text-gray-500">
                        This vehicle is currently unavailable for booking.
                      </p>
                    )}

                    <div className="mt-6 text-center">
                      <p className="text-sm text-gray-500">
                        Need help?{" "}
                        <a href="/contact" className="text-teal-600 hover:underline">
                          Contact us
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Image Modal for Large View */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 bg-white/80 rounded-full p-2 text-gray-800 hover:bg-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {vehicle?.images && (
              <>
                <img
                  src={vehicle.images[currentImageIndex]?.url || "/placeholder.svg"}
                  alt={`${vehicle.name} large view`}
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                />

                {vehicle.images.length > 1 && (
                  <div className="absolute inset-x-0 bottom-10 flex justify-center space-x-2">
                    {vehicle.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation()
                          setCurrentImageIndex(index)
                        }}
                        className={`w-2.5 h-2.5 rounded-full ${
                          currentImageIndex === index ? "bg-white" : "bg-white/50"
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}

                {vehicle.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        prevImage()
                      }}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-3 shadow-md hover:bg-white transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-800" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        nextImage()
                      }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-3 shadow-md hover:bg-white transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-800" />
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default UserSingleVehicleWithFeedback
