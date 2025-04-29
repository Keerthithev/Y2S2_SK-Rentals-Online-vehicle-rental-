"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ChevronDown, LogOut, Settings, User } from "lucide-react"

const Header = () => {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setUsername(localStorage.getItem("username") || "User")
    setEmail(localStorage.getItem("email") || "")
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    localStorage.removeItem("email")
    window.location.href = "/login"
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg border-b border-gray-700">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/admindashboard" className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6"
                >
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                  <circle cx="7" cy="17" r="2" />
                  <path d="M9 17h6" />
                  <circle cx="17" cy="17" r="2" />
                </svg>
              </div>
              <div>
                <span className="font-bold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                  SK Rentals
                </span>
                <span className="hidden md:block text-xs text-gray-400 -mt-1">Admin Portal</span>
              </div>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-300 hover:text-white focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavItem to="/admindashboard" label="Dashboard" />
            <NavItem to="/adminuserlist" label="Users" />
            <NavItem to="/listvehicle" label="Vehicles" />
            <NavItem to="/bookinghistory" label="Bookings" />
            <NavItem to="/staffactivities" label="Staff" />
            <NavItem to="/adminblacklist" label="Blacklist" />
            <NavItem to="/reports" label="Reports" />
            <NavItem to="/revenue" label="Revenue" />
            <NavItem to="/messages" label="Messages" />

            {/* Profile Dropdown */}
            <div className="relative ml-3">
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors duration-200"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-sm font-medium truncate max-w-[100px]">{username}</div>
                  <div className="text-xs text-gray-400 truncate max-w-[100px]">{email}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-gray-700">
                    <p className="text-sm font-medium text-white">{username}</p>
                    <p className="text-xs text-gray-400 truncate">{email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      My Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </div>
                  <div className="py-1 border-t border-gray-700">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-gray-700">
            <div className="space-y-1 px-2">
              <MobileNavItem to="/admindashboard" label="Dashboard" onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavItem to="/adminuserlist" label="Users" onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavItem to="/listvehicle" label="Vehicles" onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavItem to="/bookinghistory" label="Bookings" onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavItem to="/staffactivities" label="Staff" onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavItem to="/adminblacklist" label="Blacklist" onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavItem to="/reports" label="Reports" onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavItem to="/revenue" label="Revenue" onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavItem to="/messages" label="Messages" onClick={() => setIsMobileMenuOpen(false)} />
            </div>
            <div className="pt-4 pb-3 border-t border-gray-700">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">{username}</div>
                  <div className="text-sm text-gray-400">{email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1 px-2">
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  to="/settings"
                  className="block px-3 py-2 rounded-md text-base text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base text-red-400 hover:bg-gray-700 hover:text-red-300"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

// Desktop Navigation Item
const NavItem = ({ to, label }) => {
  const isActive = window.location.pathname === to
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
        isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
      }`}
    >
      {label}
    </Link>
  )
}

// Mobile Navigation Item
const MobileNavItem = ({ to, label, onClick }) => {
  const isActive = window.location.pathname === to
  return (
    <Link
      to={to}
      className={`block px-3 py-2 rounded-md text-base font-medium ${
        isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
      }`}
      onClick={onClick}
    >
      {label}
    </Link>
  )
}

export default Header
