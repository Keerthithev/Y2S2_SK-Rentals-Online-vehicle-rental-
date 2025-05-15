"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { jwtDecode } from "jwt-decode"
import { useNavigate, useParams } from "react-router-dom"
import Header from "../layouts/Header"
import Footer from "../layouts/Footer"
import { ArrowLeft, Upload, Info, AlertCircle, Trash2 } from "lucide-react"

const EditVehicle = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formStep, setFormStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [selectedFiles, setSelectedFiles] = useState([])
  const [imagesToRemove, setImagesToRemove] = useState([])
  const [vehicleData, setVehicleData] = useState({
    name: "",
    brand: "",
    model: "",
    year: "",
    fuelType: "",
    transmission: "",
    seatingCapacity: "",
    rentPerDay: "",
    description: "",
    images: [],
    adminId: "",
    licensePlateNumber: "",
    vehicleType: "",
    mileage: "",
    isTuned: false,
    lastInsuranceDate: "",
    availableStatus: true,
    trackId: "",
  })

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

        setVehicleData(vehicleData)
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

  // Handle input change for vehicle details
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setVehicleData({
      ...vehicleData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setSelectedFiles((prev) => [...prev, ...files])

    // Generate preview URLs for the selected files
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file))

    // Add new previews to existing images
    setVehicleData((prevState) => ({
      ...prevState,
      newImages: files, // Store the file objects separately
      images: [...prevState.images, ...newPreviewUrls], // Add new preview URLs to existing images
    }))
  }

  // Remove an image from the preview
  const handleRemoveImage = (index) => {
    const updatedImages = [...vehicleData.images]
    const removedImage = updatedImages[index]

    // If it's a URL (existing image), add to removal list
    if (typeof removedImage === "string" && removedImage.startsWith("http")) {
      setImagesToRemove((prev) => [...prev, removedImage])
    }

    // Remove from preview
    updatedImages.splice(index, 1)
    setVehicleData((prev) => ({ ...prev, images: updatedImages }))

    // If it's a new image, remove from selectedFiles as well
    if (selectedFiles.length > 0) {
      const updatedSelectedFiles = [...selectedFiles]
      // This is a simplification - in a real app you'd need a more robust way to match
      if (index < updatedSelectedFiles.length) {
        updatedSelectedFiles.splice(index, 1)
        setSelectedFiles(updatedSelectedFiles)
      }
    }
  }

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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    setSuccess("")

    try {
      // Validate required fields
      const requiredFields = [
        "name",
        "brand",
        "model",
        "year",
        "fuelType",
        "transmission",
        "seatingCapacity",
        "rentPerDay",
        "description",
        "licensePlateNumber",
        "vehicleType",
        "mileage",
        "lastInsuranceDate",
        "trackId",
      ]

      for (const field of requiredFields) {
        if (!vehicleData[field]) {
          throw new Error(`Please fill in the ${field.replace(/([A-Z])/g, " $1").toLowerCase()}.`)
        }
      }

      // Validate seating capacity
      if (vehicleData.seatingCapacity <= 0 || !Number.isInteger(Number(vehicleData.seatingCapacity))) {
        throw new Error("Seating capacity must be a positive integer.")
      }

      // Validate year
      const currentYear = new Date().getFullYear()
      if (vehicleData.year < 1900 || vehicleData.year > currentYear) {
        throw new Error("Vehicle manufacturing year must be between 1900 and " + currentYear + ".")
      }

      // Validate rent per day
      if (vehicleData.rentPerDay <= 0) {
        throw new Error("Rent per day must be a positive number.")
      }

      // Filter out existing image URLs (those that start with http)
      const existingImageUrls = vehicleData.images.filter(
        (img) => typeof img === "string" && img.startsWith("http") && !imagesToRemove.includes(img),
      )

      // Upload new images if any
      let newImageUrls = []
      if (selectedFiles.length > 0) {
        newImageUrls = await uploadImagesToCloudinary(selectedFiles)
      }

      // Combine existing and new image URLs
      const allImageUrls = [...existingImageUrls, ...newImageUrls]

      // Validate images
      if (allImageUrls.length < 2) {
        throw new Error("Please ensure at least 2 images are available for the vehicle.")
      }

      // Get the token from localStorage
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Authorization token is missing")
      }

      // Decode the token to get the payload
      const decodedToken = jwtDecode(token)

      // Assuming the correct field is found, extract the adminId
      const adminId = decodedToken.id // Update this based on the actual field name
      if (!adminId) {
        throw new Error("Admin ID not found in token")
      }

      // Create form data for submission
      const formData = new FormData()
      formData.append("name", vehicleData.name)
      formData.append("brand", vehicleData.brand)
      formData.append("model", vehicleData.model)
      formData.append("year", vehicleData.year)
      formData.append("fuelType", vehicleData.fuelType)
      formData.append("transmission", vehicleData.transmission)
      formData.append("seatingCapacity", vehicleData.seatingCapacity)
      formData.append("rentPerDay", vehicleData.rentPerDay)
      formData.append("description", vehicleData.description)
      formData.append("licensePlateNumber", vehicleData.licensePlateNumber)
      formData.append("vehicleType", vehicleData.vehicleType)
      formData.append("mileage", vehicleData.mileage)
      formData.append("isTuned", vehicleData.isTuned)
      formData.append("lastInsuranceDate", vehicleData.lastInsuranceDate)
      formData.append("availableStatus", vehicleData.availableStatus)
      formData.append("trackId", vehicleData.trackId)

      // Append the image URLs
      allImageUrls.forEach((url) => formData.append("images", url))

      // Add admin ID to the form data
      formData.append("adminId", adminId)

      // Send to the backend
      await axios.put(`http://localhost:1111/api/v1/admin/vehicle/${id}`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      setSuccess("Vehicle updated successfully!")

      // Show success message
      const successModal = document.createElement("div")
      successModal.className = "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      successModal.innerHTML = `
        <div class="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl">
          <div class="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-4">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 class="text-lg font-bold text-center text-gray-900 mb-2">Vehicle Updated Successfully</h3>
          <p class="text-gray-600 text-center mb-6">The vehicle has been updated in your fleet.</p>
          <button class="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition duration-200">
            Continue
          </button>
        </div>
      `
      document.body.appendChild(successModal)

      // Add event listener to the button
      successModal.querySelector("button").addEventListener("click", () => {
        document.body.removeChild(successModal)
        navigate("/listvehicle")
      })

      // Reset selected images and removal list after successful update
      setSelectedFiles([])
      setImagesToRemove([])
    } catch (err) {
      setError(err.message || "Failed to update vehicle. Please check your inputs and try again.")
      console.error("Error updating vehicle:", err.response?.data || err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const nextStep = (e) => {
    e.preventDefault()
    setFormStep(2)
    window.scrollTo(0, 0)
  }

  const prevStep = () => {
    setFormStep(1)
    window.scrollTo(0, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading vehicle data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate("/listvehicle")}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vehicle List
          </button>
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                formStep >= 1 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              1
            </div>
            <div className={`w-12 h-1 ${formStep >= 2 ? "bg-indigo-600" : "bg-gray-200"}`}></div>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                formStep >= 2 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              2
            </div>
          </div>
          <div className="w-24"></div> {/* Spacer for alignment */}
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 bg-indigo-600 text-white">
            <h1 className="text-2xl font-bold">
              {formStep === 1 ? "Edit Vehicle - Basic Information" : "Edit Vehicle - Additional Details"}
            </h1>
            <p className="text-indigo-100 mt-1">
              {formStep === 1
                ? "Update the basic details of the vehicle"
                : "Update specifications and images of the vehicle"}
            </p>
          </div>

          {error && (
            <div className="mx-6 mt-6 flex items-start p-4 border-l-4 border-red-500 bg-red-50">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mx-6 mt-6 flex items-start p-4 border-l-4 border-green-500 bg-green-50">
              <svg
                className="w-5 h-5 text-green-500 mr-3 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <p className="text-green-700">{success}</p>
            </div>
          )}

          <form onSubmit={formStep === 1 ? nextStep : handleSubmit} encType="multipart/form-data" className="p-6">
            {formStep === 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vehicle Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Name*</label>
                  <input
                    type="text"
                    name="name"
                    value={vehicleData.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. Toyota Prius"
                    required
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand*</label>
                  <input
                    type="text"
                    name="brand"
                    value={vehicleData.brand}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. Toyota"
                    required
                  />
                </div>

                {/* Model */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model*</label>
                  <input
                    type="text"
                    name="model"
                    value={vehicleData.model}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 2022 Hybrid"
                    required
                  />
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year*</label>
                  <input
                    type="number"
                    name="year"
                    value={vehicleData.year}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 2023"
                    required
                  />
                </div>

                {/* Traccar Device ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Traccar Device ID*</label>
                  <input
                    type="text"
                    name="trackId"
                    value={vehicleData.trackId}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter Traccar device ID"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This is the ID from your Traccar mobile app or GPS tracker
                  </p>
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type*</label>
                  <select
                    name="fuelType"
                    value={vehicleData.fuelType}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select Fuel Type</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                {/* Transmission */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transmission*</label>
                  <select
                    name="transmission"
                    value={vehicleData.transmission}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select Transmission</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type*</label>
                  <select
                    name="vehicleType"
                    value={vehicleData.vehicleType}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select Vehicle Type</option>
                    <option value="Economy cars">Economy cars</option>
                    <option value="Compact cars">Compact cars</option>
                    <option value="SUVs">SUVs</option>
                    <option value="Luxury cars">Luxury cars</option>
                    <option value="Vans">Vans</option>
                    <option value="KDH vans">KDH vans</option>
                    <option value="Motorbikes">Motorbikes</option>
                    <option value="Electric bikes">Electric bikes</option>
                  </select>
                </div>

                {/* License Plate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Plate Number*</label>
                  <input
                    type="text"
                    name="licensePlateNumber"
                    value={vehicleData.licensePlateNumber}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. ABC-1234"
                    required
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                  <textarea
                    name="description"
                    value={vehicleData.description}
                    onChange={handleInputChange}
                    className="w-full h-24 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Short description about the vehicle"
                    required
                  ></textarea>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Seating Capacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seating Capacity*</label>
                  <input
                    type="number"
                    name="seatingCapacity"
                    value={vehicleData.seatingCapacity}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 5"
                    required
                  />
                </div>

                {/* Rent Per Day */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rent per Day (Rs)*</label>
                  <input
                    type="number"
                    name="rentPerDay"
                    value={vehicleData.rentPerDay}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 5000"
                    required
                  />
                </div>

                {/* Mileage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mileage (km)*</label>
                  <input
                    type="number"
                    name="mileage"
                    value={vehicleData.mileage}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 15000"
                    required
                  />
                </div>

                {/* Insurance Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Insurance Date*</label>
                  <input
                    type="date"
                    name="lastInsuranceDate"
                    value={vehicleData.lastInsuranceDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Is Tuned */}
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">Performance Tuned</label>
                  <div className="relative inline-block w-12 align-middle select-none">
                    <input
                      type="checkbox"
                      name="isTuned"
                      id="isTuned"
                      checked={vehicleData.isTuned}
                      onChange={() => setVehicleData({ ...vehicleData, isTuned: !vehicleData.isTuned })}
                      className="sr-only"
                    />
                    <label
                      htmlFor="isTuned"
                      className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                        vehicleData.isTuned ? "bg-indigo-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
                          vehicleData.isTuned ? "translate-x-6" : "translate-x-0"
                        }`}
                      ></span>
                    </label>
                  </div>
                </div>

                {/* Available */}
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">Available for Rent</label>
                  <div className="relative inline-block w-12 align-middle select-none">
                    <input
                      type="checkbox"
                      name="availableStatus"
                      id="availableStatus"
                      checked={vehicleData.availableStatus}
                      onChange={() => setVehicleData({ ...vehicleData, availableStatus: !vehicleData.availableStatus })}
                      className="sr-only"
                    />
                    <label
                      htmlFor="availableStatus"
                      className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
                        vehicleData.availableStatus ? "bg-indigo-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
                          vehicleData.availableStatus ? "translate-x-6" : "translate-x-0"
                        }`}
                      ></span>
                    </label>
                  </div>
                </div>

                {/* Current Images */}
                {vehicleData.images && vehicleData.images.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Images</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {vehicleData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Vehicle ${index + 1}`}
                            className="h-24 w-full object-cover rounded-lg border border-gray-200"
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
                    <p className="text-xs text-gray-500 mt-2">
                      Hover over an image and click the trash icon to remove it. At least 2 images are required.
                    </p>
                  </div>
                )}

                {/* Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload New Images</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center">
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-4 text-center">
                      Drag and drop images here, or click to select files
                      <br />
                      <span className="text-xs">(At least 2 images total are required)</span>
                    </p>
                    <input
                      type="file"
                      name="images"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              {formStep === 1 ? (
                <div></div>
              ) : (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className={`px-8 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors ${
                  submitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {submitting ? "Processing..." : formStep === 1 ? "Continue" : "Update Vehicle"}
              </button>
            </div>
          </form>

          {/* Help section */}
          <div className="bg-indigo-50 p-6 border-t border-indigo-100">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-indigo-500 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium text-indigo-800 mb-1">Tips for updating a vehicle</h3>
                <ul className="text-sm text-indigo-700 list-disc pl-5 space-y-1">
                  <li>Ensure all information is accurate and up-to-date</li>
                  <li>Maintain at least 2 high-quality images of the vehicle</li>
                  <li>Double-check the license plate number and insurance date</li>
                  <li>Update the description to reflect any changes or new features</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default EditVehicle
