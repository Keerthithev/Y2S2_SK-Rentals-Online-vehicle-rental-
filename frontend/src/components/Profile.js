"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import Header from "./layouts/Header"
import Footer from "./layouts/Footer"
import { User, Mail, Phone, MapPin, Calendar, FileText, Edit2, LogOut, Shield, Clock, ChevronRight } from "lucide-react"

const Profile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get("http://localhost:1111/api/v1/myprofile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUser(response.data.user)
        setError("")
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile information")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?")
    if (confirmLogout) {
      localStorage.removeItem("token")
      localStorage.removeItem("username")
      localStorage.removeItem("email")
      navigate("/login")
    }
  }

  const handleEditProfile = () => {
    navigate("/update")
  }

  // Format date for better display
  const formatDate = (dateString) => {
    if (!dateString) return "Not provided"
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Calculate membership duration
  const getMembershipDuration = (createdAt) => {
    if (!createdAt) return "N/A"

    const joinDate = new Date(createdAt)
    const today = new Date()
    const diffTime = Math.abs(today - joinDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 30) {
      return `${diffDays} days`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} month${months > 1 ? "s" : ""}`
    } else {
      const years = Math.floor(diffDays / 365)
      const remainingMonths = Math.floor((diffDays % 365) / 30)
      return `${years} year${years > 1 ? "s" : ""}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths > 1 ? "s" : ""}` : ""}`
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">View and manage your account information</p>
        </div>

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

        {loading ? (
          <div className="bg-white shadow rounded-lg p-8 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading your profile...</p>
            </div>
          </div>
        ) : (
          user && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Summary Card */}
              <div className="lg:col-span-1">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-8">
                    <div className="flex justify-center">
                      <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center">
                        <span className="text-indigo-600 text-3xl font-bold">
                          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </span>
                      </div>
                    </div>
                    <h2 className="mt-4 text-center text-xl font-bold text-white">{user.name}</h2>
                    <p className="text-center text-indigo-200">{user.role === "user" ? "Customer" : user.role}</p>
                  </div>

                  <div className="px-6 py-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Shield className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-gray-600">Account Status:</span>
                        <span className="ml-auto font-medium text-green-600">Active</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-gray-600">Member Since:</span>
                        <span className="ml-auto font-medium text-gray-900">{formatDate(user.createdAt)}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <User className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-gray-600">Membership:</span>
                        <span className="ml-auto font-medium text-gray-900">
                          {getMembershipDuration(user.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-6">
                    <div className="flex flex-col space-y-3">
                      <button
                        onClick={handleEditProfile}
                        className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="lg:col-span-2">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                  </div>
                  <div className="px-6 py-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500 flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          Full Name
                        </p>
                        <p className="text-base font-medium text-gray-900">{user.name || "Not provided"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500 flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          Email Address
                        </p>
                        <p className="text-base font-medium text-gray-900">{user.email}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500 flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          Phone Number
                        </p>
                        <p className="text-base font-medium text-gray-900">{user.phone || "Not provided"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500 flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          Date of Birth
                        </p>
                        <p className="text-base font-medium text-gray-900">{formatDate(user.dateOfBirth)}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500 flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          Address
                        </p>
                        <p className="text-base font-medium text-gray-900">{user.address || "Not provided"}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500 flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-gray-400" />
                          Driver's License
                        </p>
                        <p className="text-base font-medium text-gray-900">{user.driversLicense || "Not provided"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                    <button className="text-sm text-indigo-600 hover:text-indigo-900 font-medium flex items-center">
                      View All <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {user.recentActivity && user.recentActivity.length > 0 ? (
                      user.recentActivity.map((activity, index) => (
                        <div key={index} className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <activity.icon className="h-5 w-5 text-indigo-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                              <p className="text-sm text-gray-500">{activity.date}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-6 py-8 text-center">
                        <p className="text-gray-500 text-sm">No recent activity to display</p>
                        <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          Browse Vehicles
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
      <Footer />
    </div>
  )
}

export default Profile
