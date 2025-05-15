"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { AlertCircle, CheckCircle, HelpCircle, ArrowLeft } from 'lucide-react'

const ContactComplaint = () => {
  const [customerName, setCustomerName] = useState("")
  const [issueType, setIssueType] = useState("")
  const [vehicleID, setVehicleID] = useState("")
  const [issueDescription, setIssueDescription] = useState("")
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [customerID, setCustomerID] = useState("")
  const [vehicles, setVehicles] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserAndVehicles = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          navigate("/login")
          return
        }

        const userResponse = await axios.get("http://localhost:1111/api/v1/myprofile", {
          headers: { Authorization: `Bearer ${token}` },
        })

        setCustomerName(userResponse.data.user.name)
        setCustomerID(userResponse.data.user._id)

        const vehiclesResponse = await axios.get("http://localhost:1111/api/v1/vehicles", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (vehiclesResponse.data.success && vehiclesResponse.data.vehicles.length > 0) {
          setVehicles(vehiclesResponse.data.vehicles)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setErrors({ general: "Failed to load necessary information. Please try again." })
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndVehicles()
  }, [navigate])

  const validateForm = () => {
    let tempErrors = {}
    if (!customerName.trim()) tempErrors.customerName = "Customer name is required."
    if (!issueType) tempErrors.issueType = "Issue type is required."
    if (issueType === "vehicle" && !vehicleID.trim()) tempErrors.vehicleID = "Vehicle ID is required."
    if (!issueDescription.trim()) tempErrors.issueDescription = "Issue description is required."
    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)
    const complaintData = {
      customerID,
      customerName,
      issueType,
      vehicleID: issueType === "vehicle" ? vehicleID : null,
      issueDescription,
    }

    try {
      const token = localStorage.getItem("token")
      await axios.post("http://localhost:1111/api/v1/complaintform", complaintData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSuccess(true)

      setIssueType("")
      setVehicleID("")
      setIssueDescription("")
      setErrors({})

      setTimeout(() => {
        navigate("/profile")
      }, 3000)
    } catch (error) {
      console.error("Error submitting complaint:", error)
      setErrors({
        general: "There was an error submitting your complaint. Please try again.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back</span>
        </button>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Submit a Complaint</h1>
            <p className="text-gray-600 mt-1">
              Let us know about any issues you've experienced with our vehicles or services
            </p>
          </div>

          {loading ? (
            <div className="px-6 py-12 flex justify-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Loading form...</p>
              </div>
            </div>
          ) : success ? (
            <div className="px-6 py-12">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-full bg-green-100 p-3 mb-4">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Complaint Submitted Successfully!</h2>
                <p className="text-gray-600 max-w-md mb-6">
                  Thank you for bringing this to our attention. We'll review your complaint and get back to you as soon as
                  possible.
                </p>
                <p className="text-gray-500 text-sm">Redirecting to your profile page...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-6 py-6">
              {errors.general && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                    <p className="text-sm text-red-700">{errors.general}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    value={customerName}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:outline-none"
                  />
                  {errors.customerName && <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>}
                </div>

                <div>
                  <label htmlFor="issueType" className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="issueType"
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Issue Type</option>
                    <option value="vehicle">Vehicle Issue</option>
                    <option value="service">Service Issue</option>
                  </select>
                  {errors.issueType && <p className="mt-1 text-sm text-red-600">{errors.issueType}</p>}
                </div>
              </div>

              {issueType === "vehicle" && (
                <div className="mb-6">
                  <label htmlFor="vehicleID" className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="vehicleID"
                    value={vehicleID}
                    onChange={(e) => setVehicleID(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle._id} value={vehicle._id}>
                        {vehicle.name} - {vehicle.brand} {vehicle.model} ({vehicle.year})
                      </option>
                    ))}
                  </select>
                  {errors.vehicleID && <p className="mt-1 text-sm text-red-600">{errors.vehicleID}</p>}
                </div>
              )}

              <div className="mb-6">
                <label htmlFor="issueDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="issueDescription"
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  rows={5}
                  placeholder="Please provide details about the issue you experienced..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.issueDescription && <p className="mt-1 text-sm text-red-600">{errors.issueDescription}</p>}
              </div>

              <div className="bg-blue-50 p-4 rounded-md mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <HelpCircle className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Tips for submitting a complaint</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Be specific about the issue you experienced</li>
                        <li>Include dates and times if relevant</li>
                        <li>Mention any previous communication about this issue</li>
                        <li>Suggest a resolution if you have one in mind</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    submitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {submitting ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    "Submit Complaint"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContactComplaint
