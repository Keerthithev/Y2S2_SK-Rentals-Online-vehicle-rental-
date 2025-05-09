"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ChevronDown, LogOut, Settings, User, Bell, MessageSquare, HelpCircle, LogIn, UserPlus } from 'lucide-react'

const UserHeader = () => {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState(3)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      setIsLoggedIn(true)
      setUsername(localStorage.getItem("username") || "User")
      setEmail(localStorage.getItem("email") || "")
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    localStorage.removeItem("email")
    setIsLoggedIn(false)
    window.location.href = "/login"
  }

  const handleNavigation = (e) => {
    if (!isLoggedIn) {
      e.preventDefault()
      alert("Please login to access this page")
      navigate("/login")
    }
  }

  const toggleDropdown = () => {
    if (!isLoggedIn) {
      navigate("/login")
      return
    }
    setIsDropdownOpen(!isDropdownOpen)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={isLoggedIn ? "/home" : "/login"} className="flex items-center gap-2">
              <div>
                <img
                  src="/image/logo.png"
                  alt="SK Rentals Logo"
                  className="w--20 h-20 object-contain"
                />
              </div>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={isLoggedIn ? toggleMobileMenu : () => navigate("/login")}
              className="p-2 rounded-md text-indigo-100 hover:text-white focus:outline-none"
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
            <NavItem to="/home" label="Home" onClick={handleNavigation} isLoggedIn={isLoggedIn} />
            <NavItem to="/uservehiclelist" label="Vehicles" onClick={handleNavigation} isLoggedIn={isLoggedIn} />
            {/* <NavItem to="/allbookings" label="My Bookings" onClick={handleNavigation} isLoggedIn={isLoggedIn} /> */}
            <NavItem to="/contactus" label="Contact Us" onClick={handleNavigation} isLoggedIn={isLoggedIn} />
            <NavItem to="/about" label="About" onClick={handleNavigation} isLoggedIn={isLoggedIn} />

            {/* Auth Buttons or Profile Dropdown */}
            {isLoggedIn ? (
              <div className="relative ml-3">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 bg-indigo-800 text-white px-3 py-2 rounded-lg border border-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-sm font-medium truncate max-w-[100px]">{username}</div>
                    <div className="text-xs text-indigo-200 truncate max-w-[100px]">{email}</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-indigo-300" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-indigo-800 border border-indigo-700 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-indigo-700">
                      <p className="text-sm font-medium text-white">{username}</p>
                      <p className="text-xs text-indigo-300 truncate">{email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-indigo-200 hover:bg-indigo-700 hover:text-white"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        My Profile
                      </Link>
                    </div>
                    <div className="py-1 border-t border-indigo-700">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-400 hover:bg-indigo-700 hover:text-red-300"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2 ml-3">
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && isLoggedIn && (
          <div className="md:hidden mt-3 pt-3 border-t border-indigo-600">
            <div className="space-y-1 px-2">
              <MobileNavItem to="/home" label="Home" onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavItem to="/uservehiclelist" label="Vehicles" onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavItem to="/bookings" label="My Bookings" onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavItem to="/contactus" label="Contact Us" onClick={() => setIsMobileMenuOpen(false)} />
              <MobileNavItem to="/about" label="About" onClick={() => setIsMobileMenuOpen(false)} />
            </div>
            <div className="pt-4 pb-3 border-t border-indigo-600">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">{username}</div>
                  <div className="text-sm text-indigo-200">{email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1 px-2">
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base text-indigo-200 hover:bg-indigo-700 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  to="/settings"
                  className="block px-3 py-2 rounded-md text-base text-indigo-200 hover:bg-indigo-700 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base text-red-400 hover:bg-indigo-700 hover:text-red-300"
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
const NavItem = ({ to, label, onClick, isLoggedIn }) => {
  const isActive = window.location.pathname === to
  return (
    <Link
      to={isLoggedIn ? to : "#"}
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
        isActive ? "bg-indigo-800 text-white" : "text-indigo-100 hover:bg-indigo-600 hover:text-white"
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
        isActive ? "bg-indigo-800 text-white" : "text-indigo-200 hover:bg-indigo-700 hover:text-white"
      }`}
      onClick={onClick}
    >
      {label}
    </Link>
  )
}

export default UserHeader