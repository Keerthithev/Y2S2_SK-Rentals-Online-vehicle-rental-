"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Header from "../layouts/Header"
import Footer from "../layouts/Footer"
import {
  Search,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Download,
} from "lucide-react"

const AdminUserList = () => {
  const [users, setUsers] = useState([])
  const [email, setEmail] = useState("")
  const [invitationMessage, setInvitationMessage] = useState("")
  const [invitationStatus, setInvitationStatus] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "ascending" })
  const [activeTab, setActiveTab] = useState("customers")
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await axios.get("http://localhost:1111/api/v1/admin/users", {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      setUsers(response.data.users)
    } catch (error) {
      console.error("Error fetching users:", error.response?.data?.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleBan = async (id, isCurrentlyBanned) => {
    const message = isCurrentlyBanned
      ? "Are you sure you want to unban this user?"
      : "Are you sure you want to ban this user for 30 days?"

    const shouldProceed = window.confirm(message)

    if (shouldProceed) {
      if (!isCurrentlyBanned) {
        const reasonInput = prompt("Please provide a reason for banning this user:")
        if (reasonInput) {
          try {
            await axios.put(
              `http://localhost:1111/api/v1/admin/user/ban/${id}`,
              {
                isBanned: true,
                reason: reasonInput,
              },
              {
                withCredentials: true,
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
              },
            )
            setUsers(
              users.map((user) =>
                user._id === id ? { ...user, bannedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } : user,
              ),
            )
          } catch (error) {
            console.error("Error toggling ban:", error.response?.data?.message)
          }
        } else {
          alert("Please provide a reason for the action.")
        }
      } else {
        try {
          await axios.put(
            `http://localhost:1111/api/v1/admin/user/ban/${id}`,
            { isBanned: false },
            {
              withCredentials: true,
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            },
          )
          setUsers(users.map((user) => (user._id === id ? { ...user, bannedUntil: null } : user)))
        } catch (error) {
          console.error("Error unbanning user:", error.response?.data?.message)
        }
      }
    }
  }

  const handleStaffInvite = async (e) => {
    e.preventDefault()
    setInvitationStatus("loading")
    try {
      const response = await axios.post(
        "http://localhost:1111/api/v1/admin/staff/invite",
        { email },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      )
      setInvitationMessage(response.data.message)
      setInvitationStatus("success")
      setEmail("")
      setTimeout(() => {
        setShowInviteForm(false)
        setInvitationMessage("")
        setInvitationStatus("")
      }, 3000)
    } catch (error) {
      setInvitationMessage(error.response?.data?.message || "Error sending invitation.")
      setInvitationStatus("error")
    }
  }

  const handleSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  const sortedUsers = [...users].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? -1 : 1
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? 1 : -1
    }
    return 0
  })

  const filteredUsers = sortedUsers.filter((user) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower) ||
      user.address?.toLowerCase().includes(searchLower)
    )
  })

  // Filter users based on role
  const customers = filteredUsers.filter((user) => user.role === "user")
  const staffMembers = filteredUsers.filter((user) => user.role === "staff")

  const openUserModal = (user) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const closeUserModal = () => {
    setSelectedUser(null)
    setIsModalOpen(false)
  }

  const exportToCSV = () => {
    const dataToExport = activeTab === "customers" ? customers : staffMembers
    const headers =
      activeTab === "customers"
        ? ["Name", "Email", "Phone", "Address", "Date of Birth", "Driver's License", "Status"]
        : ["Name", "Email", "Phone", "Department", "Role", "Status"]

    const csvContent = [
      headers.join(","),
      ...dataToExport.map((user) => {
        if (activeTab === "customers") {
          return [
            user.name || "N/A",
            user.email || "N/A",
            user.phone || "N/A",
            (user.address || "N/A").replace(/,/g, " "),
            user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "N/A",
            user.driversLicense || "N/A",
            !!user.bannedUntil && new Date(user.bannedUntil) > new Date() ? "Banned" : "Active",
          ].join(",")
        } else {
          return [
            user.name || "N/A",
            user.email || "N/A",
            user.phone || "N/A",
            user.department || "N/A",
            user.role || "N/A",
            !!user.bannedUntil && new Date(user.bannedUntil) > new Date() ? "Banned" : "Active",
          ].join(",")
        }
      }),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${activeTab}_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage customers and staff members</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-3 px-6 font-medium text-sm focus:outline-none ${
              activeTab === "customers"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("customers")}
          >
            Customers
          </button>
          <button
            className={`py-3 px-6 font-medium text-sm focus:outline-none ${
              activeTab === "staff"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("staff")}
          >
            Staff Members
          </button>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => fetchUsers()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            {activeTab === "staff" && (
              <button
                onClick={() => setShowInviteForm(!showInviteForm)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Staff
              </button>
            )}
          </div>
        </div>

        {/* Staff Invitation Form */}
        {showInviteForm && activeTab === "staff" && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Invite New Staff Member</h2>
            <form onSubmit={handleStaffInvite} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-grow">
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter staff email address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={invitationStatus === "loading"}
                className={`px-6 py-2 rounded-md text-white font-medium ${
                  invitationStatus === "loading"
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {invitationStatus === "loading" ? "Sending..." : "Send Invitation"}
              </button>
            </form>
            {invitationMessage && (
              <div
                className={`mt-4 p-3 rounded-md ${
                  invitationStatus === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                }`}
              >
                <div className="flex">
                  {invitationStatus === "success" ? (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mr-2" />
                  )}
                  <p>{invitationMessage}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white shadow rounded-lg p-8 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading users...</p>
            </div>
          </div>
        ) : (
          <>
            {/* User Table */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center">
                          Full Name
                          {sortConfig.key === "name" && (
                            <span className="ml-1">
                              {sortConfig.direction === "ascending" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("email")}
                      >
                        <div className="flex items-center">
                          Email
                          {sortConfig.key === "email" && (
                            <span className="ml-1">
                              {sortConfig.direction === "ascending" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Phone
                      </th>
                      {activeTab === "customers" ? (
                        <>
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
                        </>
                      ) : (
                        <>
                         
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell"
                          >
                            Role
                          </th>
                        </>
                      )}
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(activeTab === "customers" ? customers : staffMembers).length > 0 ? (
                      (activeTab === "customers" ? customers : staffMembers).map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-gray-600 font-medium">
                                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name || "N/A"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.phone || "N/A"}</div>
                          </td>
                          {activeTab === "customers" ? (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                <div className="text-sm text-gray-900 truncate max-w-xs">{user.address || "N/A"}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                                <div className="text-sm text-gray-900">
                                  {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "N/A"}
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                            
                              <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                                <div className="text-sm text-gray-900">{user.role}</div>
                              </td>
                            </>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                !!user.bannedUntil && new Date(user.bannedUntil) > new Date()
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {!!user.bannedUntil && new Date(user.bannedUntil) > new Date() ? "Banned" : "Active"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => openUserModal(user)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                View
                              </button>
                              <button
                                onClick={() =>
                                  toggleBan(user._id, !!user.bannedUntil && new Date(user.bannedUntil) > new Date())
                                }
                                className={`${
                                  !!user.bannedUntil && new Date(user.bannedUntil) > new Date()
                                    ? "text-green-600 hover:text-green-900"
                                    : "text-red-600 hover:text-red-900"
                                }`}
                              >
                                {!!user.bannedUntil && new Date(user.bannedUntil) > new Date() ? "Unban" : "Ban"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                          No {activeTab === "customers" ? "customers" : "staff members"} found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* User Detail Modal */}
        {isModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-900">User Details</h3>
                  <button onClick={closeUserModal} className="text-gray-400 hover:text-gray-500">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xl font-bold">
                    {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="ml-4">
                    <h4 className="text-xl font-bold text-gray-900">{selectedUser.name || "N/A"}</h4>
                    <p className="text-sm text-gray-500">
                      {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </div>
                      <p className="text-gray-900">{selectedUser.email}</p>
                    </div>
                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <Phone className="h-4 w-4 mr-2" />
                        Phone
                      </div>
                      <p className="text-gray-900">{selectedUser.phone || "N/A"}</p>
                    </div>
                    {selectedUser.role === "user" && (
                      <>
                        <div>
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <MapPin className="h-4 w-4 mr-2" />
                            Address
                          </div>
                          <p className="text-gray-900">{selectedUser.address || "N/A"}</p>
                        </div>
                        <div>
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <Calendar className="h-4 w-4 mr-2" />
                            Date of Birth
                          </div>
                          <p className="text-gray-900">
                            {selectedUser.dateOfBirth ? new Date(selectedUser.dateOfBirth).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="space-y-4">
                    {selectedUser.role === "user" && (
                      <div>
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <FileText className="h-4 w-4 mr-2" />
                          Driver's License
                        </div>
                        <p className="text-gray-900">{selectedUser.driversLicense || "N/A"}</p>
                      </div>
                    )}
                    {selectedUser.role === "staff" && (
                      <div>
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <FileText className="h-4 w-4 mr-2" />
                          Department
                        </div>
                        <p className="text-gray-900">{selectedUser.department || "N/A"}</p>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Status
                      </div>
                      <div
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          !!selectedUser.bannedUntil && new Date(selectedUser.bannedUntil) > new Date()
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {!!selectedUser.bannedUntil && new Date(selectedUser.bannedUntil) > new Date()
                          ? "Banned until " + new Date(selectedUser.bannedUntil).toLocaleDateString()
                          : "Active"}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        Joined
                      </div>
                      <p className="text-gray-900">
                        {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button
                  onClick={closeUserModal}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    toggleBan(
                      selectedUser._id,
                      !!selectedUser.bannedUntil && new Date(selectedUser.bannedUntil) > new Date(),
                    )
                    closeUserModal()
                  }}
                  className={`ml-3 px-4 py-2 rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    !!selectedUser.bannedUntil && new Date(selectedUser.bannedUntil) > new Date()
                      ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                      : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                  }`}
                >
                  {!!selectedUser.bannedUntil && new Date(selectedUser.bannedUntil) > new Date()
                    ? "Unban User"
                    : "Ban User"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default AdminUserList
