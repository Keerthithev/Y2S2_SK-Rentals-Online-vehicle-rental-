"use client"

import { useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
  ArrowLeft,
} from "lucide-react"

const Register = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const role = queryParams.get("role") || "user"

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    driversLicense: "",
    isPhoneVerified: true,
    role: role,
    agreeToTerms: false,
  })

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [currentStep, setCurrentStep] = useState(1)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })

    // Clear field-specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      })
    }
  }

  const validateStep1 = () => {
    const errors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

    if (!formData.name.trim()) {
      errors.name = "Full name is required"
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      errors.password = "Password is required"
    } else if (!passwordRegex.test(formData.password)) {
      errors.password =
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
    }

    if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = "Passwords do not match"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep2 = () => {
    const errors = {}
    const phoneRegex = /^[0-9]{10}$/
    const licenseRegex = /^[A-Z]{2}-\d{10}$/

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required"
    } else if (!phoneRegex.test(formData.phone)) {
      errors.phone = "Phone number must be 10 digits"
    }

    if (!formData.address.trim()) {
      errors.address = "Address is required"
    }

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required"
    } else {
      const birthDate = new Date(formData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      if (age < 18) {
        errors.dateOfBirth = "You must be at least 18 years old"
      }
    }

    if (!formData.driversLicense.trim()) {
      errors.driversLicense = "Driver's license is required"
    } else if (!licenseRegex.test(formData.driversLicense)) {
      errors.driversLicense = "License format should be XX-1234567890"
    }

    if (!formData.agreeToTerms) {
      errors.agreeToTerms = "You must agree to the terms and conditions"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNextStep = (e) => {
    e.preventDefault()
    if (validateStep1()) {
      setCurrentStep(2)
      window.scrollTo(0, 0)
    }
  }

  const handlePrevStep = () => {
    setCurrentStep(1)
    window.scrollTo(0, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep2()) {
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("http://localhost:1111/api/v1/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
          dateOfBirth: formData.dateOfBirth,
          driversLicense: formData.driversLicense,
          isPhoneVerified: formData.isPhoneVerified,
          role: formData.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Registration failed. Please try again.")
        window.scrollTo(0, 0)
      } else {
        setSuccess("Registration successful! You will be redirected to login.")
        setTimeout(() => {
          navigate("/login")
        }, 3000)
      }
    } catch (error) {
      setError("Failed to connect to server. Please check your internet connection and try again.")
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 mb-4">
            <Car className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
          <p className="mt-2 text-gray-600">Join SK Rentals to access premium vehicle rentals</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= 1 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                1
              </div>
              <div className="text-sm font-medium ml-2 hidden sm:block">Account Details</div>
            </div>
            <div className={`w-24 h-1 mx-2 ${currentStep >= 2 ? "bg-indigo-600" : "bg-gray-200"}`}></div>
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= 2 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              <div className="text-sm font-medium ml-2 hidden sm:block">Personal Information</div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Registration Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>{success}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {currentStep === 1 ? (
            <form onSubmit={handleNextStep}>
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Step 1: Account Details</h2>
                <p className="mt-1 text-sm text-gray-500">Please provide your basic account information</p>
              </div>

              <div className="px-6 py-6 space-y-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      Full Name <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        formErrors.name ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="John Doe"
                      required
                    />
                    {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      Email Address <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        formErrors.email ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="you@example.com"
                      required
                    />
                    {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    <div className="flex items-center">
                      <Lock className="h-4 w-4 text-gray-400 mr-2" />
                      Password <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        formErrors.password ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="••••••••"
                      required
                    />
                    {formErrors.password && <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>}
                    <p className="mt-1 text-xs text-gray-500">
                      Password must be at least 8 characters and include uppercase, lowercase, number, and special
                      character
                    </p>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    <div className="flex items-center">
                      <Lock className="h-4 w-4 text-gray-400 mr-2" />
                      Confirm Password <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        formErrors.confirmPassword ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="••••••••"
                      required
                    />
                    {formErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Link>
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Continue
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Step 2: Personal Information</h2>
                <p className="mt-1 text-sm text-gray-500">Please provide your personal details</p>
              </div>

              <div className="px-6 py-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        Phone Number <span className="text-red-500">*</span>
                      </div>
                    </label>
                    <div className="mt-1">
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                          formErrors.phone ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="1234567890"
                        required
                      />
                      {formErrors.phone && <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>}
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        Date of Birth <span className="text-red-500">*</span>
                      </div>
                    </label>
                    <div className="mt-1">
                      <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                          formErrors.dateOfBirth ? "border-red-300" : "border-gray-300"
                        }`}
                        required
                      />
                      {formErrors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{formErrors.dateOfBirth}</p>}
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      Address <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        formErrors.address ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Enter your full address"
                      required
                    ></textarea>
                    {formErrors.address && <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>}
                  </div>
                </div>

                {/* Driver's License */}
                <div>
                  <label htmlFor="driversLicense" className="block text-sm font-medium text-gray-700">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      Driver's License <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="driversLicense"
                      name="driversLicense"
                      value={formData.driversLicense}
                      onChange={handleChange}
                      className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        formErrors.driversLicense ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="XX-1234567890"
                      required
                    />
                    {formErrors.driversLicense && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.driversLicense}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">Format: XX-1234567890 (e.g., AB-1234567890)</p>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="agreeToTerms"
                      name="agreeToTerms"
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="agreeToTerms" className="font-medium text-gray-700">
                      I agree to the{" "}
                      <a href="#" className="text-indigo-600 hover:text-indigo-500">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-indigo-600 hover:text-indigo-500">
                        Privacy Policy
                      </a>
                    </label>
                    {formErrors.agreeToTerms && <p className="mt-1 text-sm text-red-600">{formErrors.agreeToTerms}</p>}
                  </div>
                </div>

                {/* Information Notice */}
                <div className="rounded-md bg-blue-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Info className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Information</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>
                          Your driver's license information is required for verification purposes. We prioritize the
                          security of your personal information and comply with all data protection regulations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {loading ? (
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
                      Registering...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// Car icon component
const Car = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
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
  )
}

export default Register
