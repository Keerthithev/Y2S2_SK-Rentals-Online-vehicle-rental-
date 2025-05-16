
"use client"

import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
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

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

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
  
  // Refs for animations
  const titleRef = useRef(null)
  const tabsRef = useRef(null)
  const actionBarRef = useRef(null)
  const tableRef = useRef(null)
  const inviteFormRef = useRef(null)

  useEffect(() => {
    fetchUsers()
    
    // Initial animations
    const timeline = gsap.timeline()
    
    timeline.fromTo(
      titleRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }
    )
    .fromTo(
      tabsRef.current,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
    )
    .fromTo(
      actionBarRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: "power3.out" },
      "-=0.2"
    )
    
    // Table animation will be triggered after data loads
    
    return () => {
      // Clean up animations
      if (ScrollTrigger) {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill())
      }
    }
  }, [])
  
  // Animate table when data loads
  useEffect(() => {
    if (!loading && tableRef.current) {
      gsap.fromTo(
        tableRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }
      )
      
      // Stagger rows animation
      gsap.fromTo(
        ".user-row",
        { opacity: 0, y: 10 },
        { 
          opacity: 1, 
          y: 0, 
          stagger: 0.05, 
          duration: 0.4, 
          ease: "power3.out",
          delay: 0.2
        }
      )
    }
  }, [loading])
  
  // Animate invite form when shown
  useEffect(() => {
    if (showInviteForm && inviteFormRef.current) {
      gsap.fromTo(
        inviteFormRef.current,
        { opacity: 0, height: 0, y: -20 },
        { opacity: 1, height: "auto", y: 0, duration: 0.5, ease: "power3.out" }
      )
    }
  }, [showInviteForm])

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
    
    // Animate modal opening
    setTimeout(() => {
      gsap.fromTo(
        ".modal-content",
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power3.out" }
      )
    }, 10)
  }

  const closeUserModal = () => {
    // Animate modal closing
    gsap.to(
      ".modal-content",
      { 
        opacity: 0, 
        y: -20, 
        scale: 0.95, 
        duration: 0.3, 
        ease: "power3.in",
        onComplete: () => {
          setSelectedUser(null)
          setIsModalOpen(false)
        } 
      }
    )
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-700 leading-tight pb-2">User Management</h1>
        <div className="mb-10" ref={titleRef}>
        
          <p className="text-lg text-gray-600">Manage customers and staff members on your rental platform</p>
        </div>

        {/* Tabs */}
        <div ref={tabsRef} className="flex border-b border-gray-200 mb-8">
          <button
            className={`py-3 px-6 font-medium text-sm focus:outline-none transition-colors duration-300 ${
              activeTab === "customers"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-indigo-500"
            }`}
            onClick={() => setActiveTab("customers")}
          >
            Customers
          </button>
          <button
            className={`py-3 px-6 font-medium text-sm focus:outline-none transition-colors duration-300 ${
              activeTab === "staff"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-indigo-500"
            }`}
            onClick={() => setActiveTab("staff")}
          >
            Staff Members
          </button>
        </div>

        {/* Action Bar */}
        <div ref={actionBarRef} className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => fetchUsers()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh
            </button>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
            >
              <Download className="h-5 w-5 mr-2" />
              Export
            </button>
            {activeTab === "staff" && (
              <button
                onClick={() => setShowInviteForm(!showInviteForm)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Invite Staff
              </button>
            )}
          </div>
        </div>

        {/* Staff Invitation Form */}
        {showInviteForm && activeTab === "staff" && (
          <div 
            ref={inviteFormRef}
            className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-200"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Invite New Staff Member</h2>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={invitationStatus === "loading"}
                className={`px-6 py-2 rounded-lg shadow-sm text-white font-medium transition-all duration-300 ${
                  invitationStatus === "loading"
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-1"
                }`}
              >
                {invitationStatus === "loading" ? "Sending..." : "Send Invitation"}
              </button>
            </form>
            {invitationMessage && (
              <div
                className={`mt-4 p-3 rounded-lg ${
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
          <div className="bg-white shadow-lg rounded-xl p-12 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-t-indigo-600 border-indigo-200 rounded-full animate-spin"></div>
              <p className="mt-6 text-lg text-gray-600">Loading users...</p>
            </div>
          </div>
        ) : (
          <>
            {/* User Table */}
            <div ref={tableRef} className="bg-white shadow-lg overflow-hidden rounded-xl">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
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
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
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
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Phone
                      </th>
                      {activeTab === "customers" ? (
                        <>
                          <th
                            scope="col"
                            className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                          >
                            Address
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell"
                          >
                            Date of Birth
                          </th>
                        </>
                      ) : (
                        <>
                          <th
                            scope="col"
                            className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell"
                          >
                            Role
                          </th>
                        </>
                      )}
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(activeTab === "customers" ? customers : staffMembers).length > 0 ? (
                      (activeTab === "customers" ? customers : staffMembers).map((user) => (
                        <tr key={user._id} className="user-row hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center">
                                <span className="font-medium">
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
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                !!user.bannedUntil && new Date(user.bannedUntil) > new Date()
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {!!user.bannedUntil && new Date(user.bannedUntil) > new Date() ? "Banned" : "Active"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-3">
                              <button
                                onClick={() => openUserModal(user)}
                                className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
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
                                } transition-colors duration-200`}
                              >
                                {!!user.bannedUntil && new Date(user.bannedUntil) > new Date() ? "Unban" : "Ban"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-6 text-center text-gray-500">
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
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="modal-content bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900">User Details</h3>
                  <button onClick={closeUserModal} className="text-gray-400 hover:text-gray-500 transition-colors">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-8">
                  <div className="h-20 w-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="ml-6">
                    <h4 className="text-2xl font-bold text-gray-900">{selectedUser.name || "N/A"}</h4>
                    <p className="text-md text-indigo-600 font-medium">
                      {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Mail className="h-5 w-5 mr-2 text-indigo-500" />
                        Email
                      </div>
                      <p className="text-gray-900 font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Phone className="h-5 w-5 mr-2 text-indigo-500" />
                        Phone
                      </div>
                      <p className="text-gray-900 font-medium">{selectedUser.phone || "N/A"}</p>
                    </div>
                    {selectedUser.role === "user" && (
                      <>
                        <div>
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <MapPin className="h-5 w-5 mr-2 text-indigo-500" />
                            Address
                          </div>
                          <p className="text-gray-900 font-medium">{selectedUser.address || "N/A"}</p>
                        </div>
                        <div>
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <Calendar className="h-5 w-5 mr-2 text-indigo-500" />
                            Date of Birth
                          </div>
                          <p className="text-gray-900 font-medium">
                            {selectedUser.dateOfBirth ? new Date(selectedUser.dateOfBirth).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="space-y-6">
                    {selectedUser.role === "user" && (
                      <div>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <FileText className="h-5 w-5 mr-2 text-indigo-500" />
                          Driver's License
                        </div>
                        <p className="text-gray-900 font-medium">{selectedUser.driversLicense || "N/A"}</p>
                      </div>
                    )}
                    {selectedUser.role === "staff" && (
                      <div>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <FileText className="h-5 w-5 mr-2 text-indigo-500" />
                          Department
                        </div>
                        <p className="text-gray-900 font-medium">{selectedUser.department || "N/A"}</p>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <AlertCircle className="h-5 w-5 mr-2 text-indigo-500" />
                        Status
                      </div>
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
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
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Calendar className="h-5 w-5 mr-2 text-indigo-500" />
                        Joined
                      </div>
                      <p className="text-gray-900 font-medium">
                        {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button
                  onClick={closeUserModal}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
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
                  className={`ml-3 px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:-translate-y-1 ${
                    !!selectedUser.bannedUntil && new Date(selectedUser.bannedUntil) > new Date()
                      ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:ring-green-500"
                      : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:ring-red-500"
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
