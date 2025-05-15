"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate, useParams } from "react-router-dom"
import {
  Car,
  X,
  Save,
  ArrowLeft,
  Trash2,
  Calendar,
  Fuel,
  Settings,
  Users,
  DollarSign,
  FileText,
  ImageIcon,
} from "lucide-react"

import Header from "../layouts/Header"
import Footer from "../layouts/Footer"

// Upload function to Cloudinary
const uploadImagesToCloudinary = async (files) => {
  const cloudinaryUrl = "https://api.cloudinary.com/v1_1/dpcl7yv77/image/upload"
  const cloudinaryPreset = "ml_default"

  const uploadedUrls = []

  for (const file of files) {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", cloudinaryPreset)

    try {
      const response = await axios.post(cloudinaryUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      uploadedUrls.push(response.data.secure_url)
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error)
      return []
    }
  }

  return uploadedUrls
}

const EditVehicle = () => {
  const [vehicle, setVehicle] = useState({
    name: "",
    brand: "",
    model: "",
    year: "",
    fuelType: "",
    transmission: "",
    seatingCapacity: "",
    rentPerDay: "",
    description: "",
    images: [], // To store Cloudinary URLs
  })

  const [selectedImages, setSelectedImages] = useState([]) // To store selected File objects
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [imagesToRemove, setImagesToRemove] = useState([])
  const { id } = useParams()
  const navigate = useNavigate()

  // Fetch vehicle data when component mounts
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`http://localhost:1111/api/v1/admin/vehicle/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        // Format the vehicle data
        const vehicleData = response.data.vehicle || {}

        // Ensure images is an array
        if (!Array.isArray(vehicleData.images)) {
          vehicleData.images = vehicleData.images ? [vehicleData.images] : []
        }

        // If images is an array of objects with url property, extract the urls
        if (vehicleData.images.length > 0 && typeof vehicleData.images[0] === "object") {
          vehicleData.images = vehicleData.images.map((img) => img.url || "")
        }

        setVehicle(vehicleData)
      } catch (err) {
        console.error("Error fetching vehicle:", err)
        setError("Failed to fetch vehicle data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchVehicle()
    } else {
      setError("Invalid vehicle ID")
    }
  }, [id])

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setVehicle((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  // Handle new image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setSelectedImages((prev) => [...prev, ...files])

    // Generate preview URLs for the selected files
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file))

    // Add new previews to existing images
    setVehicle((prevState) => ({
      ...prevState,
      images: [...prevState.images, ...newPreviewUrls],
    }))
  }

  // Remove an image from the preview
  const handleRemoveImage = (index) => {
    const updatedImages = [...vehicle.images]
    const removedImage = updatedImages[index]

    // If it's a URL (existing image), add to removal list
    if (typeof removedImage === "string" && removedImage.startsWith("http")) {
      setImagesToRemove((prev) => [...prev, removedImage])
    }

    // Remove from preview
    updatedImages.splice(index, 1)
    setVehicle((prev) => ({ ...prev, images: updatedImages }))

    // If it's a new image, remove from selectedImages as well
    if (selectedImages.length > 0) {
      const updatedSelectedImages = [...selectedImages]
      // This is a simplification - in a real app you'd need a more robust way to match
      if (index < updatedSelectedImages.length) {
        updatedSelectedImages.splice(index, 1)
        setSelectedImages(updatedSelectedImages)
      }
    }
  }

  // Handle form submission (upload images and update vehicle)
  const handleSubmit = async (e) => {
    e.preventDefault()

    setSubmitting(true)
    setError("")
    setSuccess("")

    try {
      // Filter out existing image URLs (those that start with http)
      const existingImageUrls = vehicle.images.filter(
        (img) => typeof img === "string" && img.startsWith("http") && !imagesToRemove.includes(img),
      )

      // Upload new images if any
      let newImageUrls = []
      if (selectedImages.length > 0) {
        newImageUrls = await uploadImagesToCloudinary(selectedImages)
      }

      // Combine existing and new image URLs
      const allImageUrls = [...existingImageUrls, ...newImageUrls]

      // Update vehicle data with the correct image URLs
      const updatedVehicle = {
        ...vehicle,
        images: allImageUrls,
        year: Number.parseInt(vehicle.year, 10) || 0,
        seatingCapacity: Number.parseInt(vehicle.seatingCapacity, 10) || 0,
        rentPerDay: Number.parseFloat(vehicle.rentPerDay) || 0,
      }

      // Send updated data to the backend
      await axios.put(`http://localhost:1111/api/v1/admin/vehicle/${id}`, updatedVehicle, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      setSuccess("Vehicle updated successfully!")

      // Reset selected images and removal list after successful update
      setSelectedImages([])
      setImagesToRemove([])

      // Navigate after a short delay to show success message
      setTimeout(() => {
        navigate("/listvehicle")
      }, 1500)
    } catch (err) {
      console.error("Error updating vehicle:", err)
      setError("Failed to update vehicle. Please check your inputs and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Cancel and navigate back to vehicle list
  const handleCancel = () => {
    navigate(`/admin/vehicle/${id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading vehicle data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="bg-white shadow-md rounded-lg mb-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-800">Edit Vehicle</h1>
            </div>
            <button
              onClick={() => navigate("/listvehicle")}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to List
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h2>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Name
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Car className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={vehicle.name}
                      onChange={handleInputChange}
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g. Toyota Camry XLE"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      id="brand"
                      name="brand"
                      value={vehicle.brand}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g. Toyota"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                      Model
                    </label>
                    <input
                      type="text"
                      id="model"
                      name="model"
                      value={vehicle.model}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g. Camry"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        id="year"
                        name="year"
                        value={vehicle.year}
                        onChange={handleInputChange}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="e.g. 2023"
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="rentPerDay" className="block text-sm font-medium text-gray-700 mb-1">
                      Rent per Day
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        id="rentPerDay"
                        name="rentPerDay"
                        value={vehicle.rentPerDay}
                        onChange={handleInputChange}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="e.g. 50"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                </div>

                <h2 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">Specifications</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700 mb-1">
                      Fuel Type
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Fuel className="h-4 w-4 text-gray-400" />
                      </div>
                      <select
                        id="fuelType"
                        name="fuelType"
                        value={vehicle.fuelType}
                        onChange={handleInputChange}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      >
                        <option value="">Select Fuel Type</option>
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Electric">Electric</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="CNG">CNG</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="transmission" className="block text-sm font-medium text-gray-700 mb-1">
                      Transmission
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Settings className="h-4 w-4 text-gray-400" />
                      </div>
                      <select
                        id="transmission"
                        name="transmission"
                        value={vehicle.transmission}
                        onChange={handleInputChange}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      >
                        <option value="">Select Transmission</option>
                        <option value="Automatic">Automatic</option>
                        <option value="Manual">Manual</option>
                        <option value="Semi-Automatic">Semi-Automatic</option>
                        <option value="CVT">CVT</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="seatingCapacity" className="block text-sm font-medium text-gray-700 mb-1">
                    Seating Capacity
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="seatingCapacity"
                      name="seatingCapacity"
                      value={vehicle.seatingCapacity}
                      onChange={handleInputChange}
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g. 5"
                      min="1"
                      max="50"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Description & Images</h2>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      id="description"
                      name="description"
                      value={vehicle.description}
                      onChange={handleInputChange}
                      rows="5"
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Describe the vehicle features, condition, etc."
                      required
                    ></textarea>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Images</label>

                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="images"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Upload images</span>
                          <input
                            id="images"
                            name="images"
                            type="file"
                            multiple
                            onChange={handleImageChange}
                            className="sr-only"
                            accept="image/*"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                </div>

                {/* Image Previews */}
                {vehicle.images && vehicle.images.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Current Images:</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {vehicle.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Vehicle ${index + 1}`}
                            className="h-24 w-full object-cover rounded-md border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-red-100 text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center ${
                  submitting ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {submitting ? (
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
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Vehicle
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default EditVehicle
