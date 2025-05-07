"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Header from "../layouts/Header"
import Footer from "../layouts/Footer"
import {
  Search,
  RefreshCw,
  AlertTriangle,
  Shield,
  UserX,
  Calendar,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react"

const AdminBlacklist = () => {
  const [blacklistedUsers, setBlacklistedUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const usersPerPage = 10

  useEffect(() => {
    fetchBlacklistedUsers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [blacklistedUsers, searchTerm, filterStatus])

  const fetchBlacklistedUsers = async () => {
    try {
      setLoading(true)
      setIsRefreshing(true)
      const response = await axios.get("http://localhost:1111/api/v1/admin/blacklist", {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.data.blacklistedUsers) {
        setBlacklistedUsers(response.data.blacklistedUsers)
        setFilteredUsers(response.data.blacklistedUsers)
        setError(null)
      } else {
        setError("No blacklisted users found")
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching blacklisted users")
      console.error("Error fetching blacklisted users:", error.response?.data?.message)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const getBanDates = (bannedUntil, banStartDate, banEndDate) => {
    if (!bannedUntil) {
      // Use original ban start and end date if user is unbanned
      return {
        startDate: banStartDate ? new Date(banStartDate).toLocaleDateString() : "Not banned",
        endDate: banEndDate ? new Date(banEndDate).toLocaleDateString() : "Not banned",
        status: "Not banned",
        statusType: "inactive",
      }
    }

    const currentDate = new Date()
    const endDate = new Date(bannedUntil)
    const startDate = new Date(endDate)
    startDate.setDate(endDate.getDate() - 30) // Assuming a 30-day ban

    if (endDate < currentDate) {
      return {
        startDate: startDate.toLocaleDateString(),
        endDate: endDate.toLocaleDateString(),
        status: "Expired",
        statusType: "expired",
      }
    } else {
      const daysRemaining = Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24))
      return {
        startDate: startDate.toLocaleDateString(),
        endDate: endDate.toLocaleDateString(),
        status: `${daysRemaining} days remaining`,
        statusType: "active",
      }
    }
  }

  const getBanReason = (banReason, bannedUntil, unbanReason) => {
    const currentDate = new Date()
    const banEndDate = bannedUntil ? new Date(bannedUntil) : null

    if (bannedUntil && banEndDate > currentDate) {
      return `Banned. Reason: ${banReason || "No reason provided"}`
    }

    if (bannedUntil && banEndDate < currentDate) {
      return `Ban expired. Reason: ${banReason || "Ban expired"}`
    }

    if (!bannedUntil && unbanReason) {
      return `Unbanned. Reason: ${unbanReason || "No reason provided"}`
    }

    return "No ban/unban reason available"
  }

  const applyFilters = () => {
    let result = [...blacklistedUsers]

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      result = result.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.phone?.toLowerCase().includes(searchLower) ||
          user.address?.toLowerCase().includes(searchLower),
      )
    }

    // Apply status filter
    if (filterStatus !== "all") {
      result = result.filter((user) => {
        const { statusType } = getBanDates(user.bannedUntil)
        return statusType === filterStatus
      })
    }

    setFilteredUsers(result)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const exportToCSV = () => {
    const headers = [
      "Full Name",
      "Email",
      "Phone Number",
      "Address",
      "Date of Birth",
      "Ban Start Date",
      "Ban End Date",
      "Ban Status",
      "Ban/Unban Reason",
    ]

    const csvContent = [
      headers.join(","),
      ...filteredUsers.map((user) => {
        const { startDate, endDate, status } = getBanDates(user.bannedUntil)
        return [
          `"${user.name || ""}"`,
          `"${user.email || ""}"`,
          `"${user.phone || ""}"`,
          `"${user.address?.replace(/,/g, " ") || ""}"`,
          `"${user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : ""}"`,
          `"${startDate}"`,
          `"${endDate}"`,
          `"${status}"`,
          `"${getBanReason(user.banReason, user.bannedUntil, user.unbanReason).replace(/"/g, '""')}"`,
        ].join(",")
      }),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `blacklisted-users-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Blacklisted Customers</h1>
          <p className="text-gray-600 mt-1">Manage and monitor blacklisted users in the system</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, phone..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Bans</option>
                  <option value="expired">Expired Bans</option>
                  <option value="inactive">Not Banned</option>
                </select>
              </div>

              <button
                onClick={fetchBlacklistedUsers}
                disabled={isRefreshing}
                className={`px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 flex items-center gap-2 ${
                  isRefreshing ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>

              <button
                onClick={exportToCSV}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white shadow rounded-lg p-8 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading blacklisted users...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">{currentUsers.length}</span> of{" "}
                <span className="font-medium">{filteredUsers.length}</span> blacklisted users
              </p>
            </div>

            {/* Table */}
            <div className="bg-white shadow overflow-hidden rounded-lg border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Full Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Contact Information
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                      >
                        Address
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell"
                      >
                        Date of Birth
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Ban Period
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell"
                      >
                        Reason
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentUsers.length > 0 ? (
                      currentUsers.map((user) => {
                        const { startDate, endDate, status, statusType } = getBanDates(user.bannedUntil)
                        return (
                          <tr key={user._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                  <UserX className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{user.name || "N/A"}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{user.email}</div>
                              <div className="text-sm text-gray-500">{user.phone || "No phone"}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                              <div className="text-sm text-gray-900 truncate max-w-xs">{user.address || "N/A"}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                              <div className="text-sm text-gray-900">
                                {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <div className="flex items-center text-sm text-gray-900">
                                  <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                  {startDate}
                                </div>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                  <Clock className="h-4 w-4 mr-1 text-gray-400" />
                                  {endDate}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  statusType === "active"
                                    ? "bg-red-100 text-red-800"
                                    : statusType === "expired"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-green-100 text-green-800"
                                }`}
                              >
                                {status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap hidden xl:table-cell">
                              <div className="text-sm text-gray-900 max-w-xs truncate">
                                {getBanReason(user.banReason, user.bannedUntil, user.unbanReason)}
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                          <p className="text-lg font-medium text-gray-900 mb-1">No blacklisted users found</p>
                          <p className="text-gray-500">
                            {searchTerm || filterStatus !== "all"
                              ? "Try adjusting your search filters"
                              : "There are no blacklisted users in the system"}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {filteredUsers.length > usersPerPage && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-lg">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{" "}
                      <span className="font-medium">
                        {indexOfLastUser > filteredUsers.length ? filteredUsers.length : indexOfLastUser}
                      </span>{" "}
                      of <span className="font-medium">{filteredUsers.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                          currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                      </button>

                      {/* Page numbers */}
                      {[...Array(totalPages).keys()].map((number) => (
                        <button
                          key={number + 1}
                          onClick={() => paginate(number + 1)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                            currentPage === number + 1
                              ? "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                              : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                          }`}
                        >
                          {number + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                          currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default AdminBlacklist
