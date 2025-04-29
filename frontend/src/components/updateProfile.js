"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import Header from "./layouts/Header"
import Footer from "./layouts/Footer"
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Info,
} from "lucide-react"

const UpdateProfile = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    driversLicense: "",
  })

  const [originalData, setOriginalData] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formErrors, setFormErrors] = useState({})
  const navigate = useNavigate()

  // Fetch user profile when the component loads
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get("http://localhost:1111/api/v1/myprofile", {
          headers: { Authorization: `Bearer ${token}` },
        })

        const userData = {
          name: response.data.user.name || "",
          email: response.data.user.email || "",
          phone: response.data.user.phone || "",
          address: response.data.user.address || "",
          dateOfBirth: response.data.user.dateOfBirth ? response.data.user.dateOfBirth.split("T")[0] : "",
          driversLicense: response.data.user.driversLicense || "",
        }

        setFormData(userData)
        setOriginalData(userData)
        setError("")
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile information")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Clear field-specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      })
    }
  }

  // Validate form
  const validateForm = () => {
    const errors = {}

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Name is required"
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid"
    }

    // Phone validation (optional but validate format if provided)
    if (formData.phone && !/^[0-9+\-\s()]{7,15}$/.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number"
    }

    // Driver's license validation (optional but validate format if provided)
    if (formData.driversLicense && formData.driversLicense.length < 5) {
      errors.driversLicense = "Please enter a valid driver's license number"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Check if form has been modified
  const isFormModified = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData)
  }

  // Handle form submission to update the profile
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form before submission
    if (!validateForm()) {
      return
    }

    // Check if anything has changed
    if (!isFormModified()) {
      setSuccess("No changes to save")
      setTimeout(() => setSuccess(""), 3000)
      return
    }

    setSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      const response = await axios.put("http://localhost:1111/api/v1/update", formData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.success) {
        setSuccess("Profile updated successfully")
        setOriginalData(formData)

        // Redirect after a short delay to show success message
        setTimeout(() => {
          navigate("/profile")
        }, 2000)
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile")
      window.scrollTo(0, 0)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle cancel and return to profile
  const handleCancel = () => {
    if (isFormModified()) {
      const confirmCancel = window.confirm("You have unsaved changes. Are you sure you want to cancel?")
      if (confirmCancel) {
        navigate("/profile")
      }
    } else {
      navigate("/profile")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex items-center">
          <button
            onClick={handleCancel}
            className="mr-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Back to Profile</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-gray-600 mt-1">Update your personal information</p>
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

        {/* Loading State */}
        {loading ? (
          <div className="bg-white shadow rounded-lg p-8 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading your profile...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
              <p className="mt-1 text-sm text-gray-500">Update your personal details and contact information.</p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      Full Name <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      formErrors.name ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      Email Address <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      formErrors.email ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
                </div>

                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      Phone Number
                    </div>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      formErrors.phone ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  {formErrors.phone && <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>}
                </div>

                {/* Date of Birth Field */}
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      Date of Birth
                    </div>
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Address Field */}
              <div className="mb-6">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    Address
                  </div>
                </label>
                <textarea
                  id="address"
                  name="address"
                  placeholder="Enter your full address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
              </div>

              {/* Driver's License Field */}
              <div className="mb-8">
                <label htmlFor="driversLicense" className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-gray-400 mr-2" />
                    Driver's License Number
                  </div>
                </label>
                <input
                  type="text"
                  id="driversLicense"
                  name="driversLicense"
                  placeholder="Enter your driver's license number"
                  value={formData.driversLicense}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    formErrors.driversLicense ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {formErrors.driversLicense && <p className="mt-1 text-sm text-red-600">{formErrors.driversLicense}</p>}
                <p className="mt-2 text-sm text-gray-500 flex items-start">
                  <Info className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  Your driver's license is required for vehicle rentals and will be verified for security purposes.
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 border-t border-gray-200 pt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !isFormModified()}
                  className={`flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    submitting || !isFormModified()
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
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
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default UpdateProfile
