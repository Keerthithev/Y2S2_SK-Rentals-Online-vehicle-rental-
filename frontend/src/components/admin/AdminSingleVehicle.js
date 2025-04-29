"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate, useParams } from "react-router-dom"
import Header from "../layouts/Header"
import Footer from "../layouts/Footer"
import { FaEdit, FaTrash, FaArrowLeft, FaChevronLeft, FaChevronRight } from "react-icons/fa"

const AdminSingleVehicle = () => {
  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { id } = useParams()
  const navigate = useNavigate()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  const fetchVehicleDetails = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Authorization token is missing")

      const res = await axios.get(`http://localhost:1111/api/v1/admin/vehicle/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.success && res.data.vehicle) {
        setVehicle(res.data.vehicle)
      } else {
        setError("Vehicle not found")
      }
    } catch (err) {
      setError("Failed to fetch vehicle details")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicleDetails()
  }, [id])

  const deleteVehicle = async (id) => {
    try {
      const confirm = window.confirm("Are you sure you want to delete this vehicle?")
      if (confirm) {
        await axios.delete(`http://localhost:1111/api/v1/admin/vehicle/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        alert("Vehicle deleted successfully")
        navigate("/listvehicle")
      }
    } catch {
      setError("Failed to delete vehicle")
    }
  }

  const nextImage = () => {
    if (vehicle?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % vehicle.images.length)
    }
  }

  const prevImage = () => {
    if (vehicle?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? vehicle.images.length - 1 : prev - 1))
    }
  }

  const openModal = (image) => {
    setSelectedImage(image)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedImage(null)
  }

  // Format date function
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/listvehicle")}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <FaArrowLeft /> Back to Vehicle List
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Vehicle Details</h1>
          <div className="w-24"></div> {/* Spacer for alignment */}
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          vehicle && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Image Section - Takes 1/3 on large screens */}
                <div className="lg:col-span-1 bg-gray-50 p-6">
                  <div className="relative mb-4 bg-white rounded-lg shadow-sm overflow-hidden">
                    {vehicle.images && vehicle.images.length > 0 ? (
                      <div className="aspect-w-3 aspect-h-2">
                        <img
                          src={vehicle.images[currentImageIndex]?.url || "/placeholder.svg"}
                          alt={`${vehicle.name}`}
                          className="w-full h-full object-contain cursor-pointer"
                          onClick={() => openModal(vehicle.images[currentImageIndex]?.url)}
                        />
                      </div>
                    ) : (
                      <div className="aspect-w-3 aspect-h-2 flex items-center justify-center bg-gray-100">
                        <p className="text-gray-400">No image available</p>
                      </div>
                    )}

                    {/* Image Navigation */}
                    {vehicle.images && vehicle.images.length > 1 && (
                      <div className="absolute inset-0 flex items-center justify-between px-2">
                        <button
                          onClick={prevImage}
                          className="bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-all"
                          aria-label="Previous image"
                        >
                          <FaChevronLeft />
                        </button>
                        <button
                          onClick={nextImage}
                          className="bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-all"
                          aria-label="Next image"
                        >
                          <FaChevronRight />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {vehicle.images && vehicle.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto py-2">
                      {vehicle.images.map((image, index) => (
                        <div
                          key={index}
                          className={`w-16 h-16 flex-shrink-0 cursor-pointer rounded-md overflow-hidden border-2 ${
                            currentImageIndex === index ? "border-blue-500" : "border-transparent"
                          }`}
                          onClick={() => setCurrentImageIndex(index)}
                        >
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-col gap-3">
                    <button
                      onClick={() => vehicle._id && navigate(`/editvehicle/${vehicle._id}`)}
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg transition-colors w-full"
                    >
                      <FaEdit /> Edit Vehicle
                    </button>
                    <button
                      onClick={() => deleteVehicle(vehicle._id)}
                      className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg transition-colors w-full"
                    >
                      <FaTrash /> Delete Vehicle
                    </button>
                  </div>
                </div>

                {/* Details Section - Takes 2/3 on large screens */}
                <div className="lg:col-span-2 p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-800">{vehicle.name}</h2>
                      <p className="text-gray-500 text-lg">
                        {vehicle.brand} {vehicle.model} • {vehicle.year}
                      </p>
                    </div>
                    <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-semibold">
                      Rs.{vehicle.rentPerDay}.00 / day
                    </div>
                  </div>

                  {/* Vehicle Specifications */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-sm">Fuel Type</span>
                        <span className="font-medium text-gray-800">{vehicle.fuelType}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-sm">Transmission</span>
                        <span className="font-medium text-gray-800">{vehicle.transmission}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-sm">Seating Capacity</span>
                        <span className="font-medium text-gray-800">{vehicle.seatingCapacity} seats</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-sm">License Plate</span>
                        <span className="font-medium text-gray-800">{vehicle.licensePlateNumber}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-sm">Vehicle Type</span>
                        <span className="font-medium text-gray-800">{vehicle.vehicleType}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-sm">Mileage</span>
                        <span className="font-medium text-gray-800">{vehicle.mileage} km</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Information */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <span className="text-gray-500 text-sm">Availability</span>
                        <div className="flex items-center mt-1">
                          <span
                            className={`w-3 h-3 rounded-full mr-2 ${vehicle.availableStatus ? "bg-green-500" : "bg-red-500"}`}
                          ></span>
                          <span className="font-medium text-gray-800">
                            {vehicle.availableStatus ? "Available" : "Not Available"}
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <span className="text-gray-500 text-sm">Performance Tuning</span>
                        <div className="flex items-center mt-1">
                          <span
                            className={`w-3 h-3 rounded-full mr-2 ${vehicle.isTuned ? "bg-blue-500" : "bg-gray-400"}`}
                          ></span>
                          <span className="font-medium text-gray-800">
                            {vehicle.isTuned ? "Performance Tuned" : "Standard"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Insurance & Description */}
                  <div>
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Insurance</h3>
                      <p className="text-gray-700">
                        Last Insurance Date:{" "}
                        <span className="font-medium">{formatDate(vehicle.lastInsuranceDate)}</span>
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Description</h3>
                      <p className="text-gray-700 whitespace-pre-line">{vehicle.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {/* Image Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <div
              className="relative max-w-5xl w-full bg-white rounded-xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={closeModal}
                  className="bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors"
                  aria-label="Close modal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <img
                src={selectedImage || "/placeholder.svg"}
                alt="Large view"
                className="w-full h-auto max-h-[80vh] object-contain p-2"
              />
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default AdminSingleVehicle
