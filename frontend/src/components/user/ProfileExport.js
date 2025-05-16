"use client"

import { useState } from "react"
import { Download, FileText, X } from 'lucide-react'

const ProfileExport = ({ user, onClose }) => {
  const [exportFormat, setExportFormat] = useState("json")
  const [showModal, setShowModal] = useState(true)

  const handleExport = () => {
    if (!user) return

    let content
    let filename
    let type

    // Format the user data based on selected format
    if (exportFormat === "json") {
      // Create a clean user object without sensitive or unnecessary data
      const exportData = {
        personalInfo: {
          name: user.name || "Not provided",
          email: user.email || "Not provided",
          phone: user.phone || "Not provided",
          address: user.address || "Not provided",
          dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "Not provided",
          driversLicense: user.driversLicense || "Not provided",
        },
        accountInfo: {
          memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Not provided",
          role: user.role || "user",
        },
      }

      content = JSON.stringify(exportData, null, 2)
      filename = `user-profile-${Date.now()}.json`
      type = "application/json"
    } else if (exportFormat === "csv") {
      // Create CSV content with headers and values
      const headers = ["Name", "Email", "Phone", "Address", "Date of Birth", "Driver's License", "Member Since", "Role"]
      const values = [
        user.name || "",
        user.email || "",
        user.phone || "",
        user.address || "",
        user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "",
        user.driversLicense || "",
        user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "",
        user.role || "user",
      ]

      content = [headers.join(","), values.map(v => `"${v.replace(/"/g, '""')}"`).join(",")].join("\n")
      filename = `user-profile-${Date.now()}.csv`
      type = "text/csv"
    } else if (exportFormat === "txt") {
      // Create plain text format
      content = [
        "USER PROFILE",
        "=============",
        "",
        "PERSONAL INFORMATION",
        `Name: ${user.name || "Not provided"}`,
        `Email: ${user.email || "Not provided"}`,
        `Phone: ${user.phone || "Not provided"}`,
        `Address: ${user.address || "Not provided"}`,
        `Date of Birth: ${user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "Not provided"}`,
        `Driver's License: ${user.driversLicense || "Not provided"}`,
        "",
        "ACCOUNT INFORMATION",
        `Member Since: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Not provided"}`,
        `Role: ${user.role || "user"}`,
      ].join("\n")
      
      filename = `user-profile-${Date.now()}.txt`
      type = "text/plain"
    }

    // Create and download the file
    const blob = new Blob([content], { type: `${type};charset=utf-8;` })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Close the modal after export
    setShowModal(false)
    onClose()
  }

  if (!showModal) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden animate-modal-appear">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-medium text-white flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Export Profile Data
          </h3>
          <button onClick={onClose} className="text-white hover:text-indigo-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Download your profile information in your preferred format.
          </p>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Format</label>
            <div className="grid grid-cols-3 gap-3">
              <div 
                className={`border rounded-md p-3 text-center cursor-pointer transition-all ${
                  exportFormat === 'json' 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                    : 'border-gray-300 hover:border-indigo-300'
                }`}
                onClick={() => setExportFormat('json')}
              >
                <p className="font-medium">JSON</p>
                <p className="text-xs text-gray-500 mt-1">Structured data</p>
              </div>
              <div 
                className={`border rounded-md p-3 text-center cursor-pointer transition-all ${
                  exportFormat === 'csv' 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                    : 'border-gray-300 hover:border-indigo-300'
                }`}
                onClick={() => setExportFormat('csv')}
              >
                <p className="font-medium">CSV</p>
                <p className="text-xs text-gray-500 mt-1">Spreadsheet</p>
              </div>
              <div 
                className={`border rounded-md p-3 text-center cursor-pointer transition-all ${
                  exportFormat === 'txt' 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                    : 'border-gray-300 hover:border-indigo-300'
                }`}
                onClick={() => setExportFormat('txt')}
              >
                <p className="font-medium">TXT</p>
                <p className="text-xs text-gray-500 mt-1">Plain text</p>
              </div>
            </div>
          </div>
          
          <div className="bg-indigo-50 rounded-md p-4 mb-6 border border-indigo-100">
            <h4 className="text-sm font-medium text-indigo-800 mb-2">Included Information:</h4>
            <ul className="text-sm text-indigo-700 space-y-1">
              <li>• Personal details (name, contact information)</li>
              <li>• Account information (member since, role)</li>
              <li>• Address and driver's license information</li>
            </ul>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileExport
