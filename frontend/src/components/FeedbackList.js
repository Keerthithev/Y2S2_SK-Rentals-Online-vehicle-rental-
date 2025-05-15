"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Swal from "sweetalert2"
import { Star, Edit, Trash2, ThumbsUp } from "lucide-react"

const VehicleFeedbackComponent = ({ vehicleID, refreshTrigger }) => {
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [editingFeedback, setEditingFeedback] = useState(null)
  const [editedComment, setEditedComment] = useState("")
  const [editedRating, setEditedRating] = useState(1)
  const [currentUserID, setCurrentUserID] = useState(null)
  const [averageRating, setAverageRating] = useState(0)
  const [customerNames, setCustomerNames] = useState({}) // Store customer names by ID

  // Fetch current user info
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token")
        if (token) {
          const res = await axios.get("http://localhost:1111/api/v1/myprofile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          setCurrentUserID(res.data.user._id)

          // Add current user to customer names
          setCustomerNames((prev) => ({
            ...prev,
            [res.data.user._id]: res.data.user.name || "Me",
          }))
        }
      } catch (error) {
        console.error("Error fetching current user:", error)
      }
    }

    fetchCurrentUser()
  }, [])

  // Fetch feedback for this specific vehicle
  useEffect(() => {
    fetchFeedback()
  }, [vehicleID, refreshTrigger])

  // Fetch customer names for all feedback
  const fetchCustomerNames = async (feedbackList) => {
    try {
      // Create a unique list of customer IDs
      const customerIDs = [...new Set(feedbackList.map((item) => item.customerID))].filter(
        (id) => id && !customerNames[id],
      )

      if (customerIDs.length === 0) return

      // For each customer ID, make an API call to get their details
      // This is a more reliable approach than batch fetching
      for (const id of customerIDs) {
        try {
          const response = await axios.get(`http://localhost:1111/api/v1/customer/${id}`)

          // Extract the name from the response - try different possible fields
          const customerName =
            response.data.name ||
            response.data.fullName ||
            response.data.customerName ||
            `Customer ${id.substring(0, 5)}`

          // Update the customer names state
          setCustomerNames((prev) => ({
            ...prev,
            [id]: customerName,
          }))
        } catch (error) {
          console.log(`Could not fetch name for customer ${id}`)
          // Set a fallback name
          setCustomerNames((prev) => ({
            ...prev,
            [id]: `Customer ${id.substring(0, 5)}`,
          }))
        }
      }
    } catch (error) {
      console.error("Error fetching customer names:", error)
    }
  }

  // Update the fetchFeedback function to handle different API endpoint formats and provide better error handling
  const fetchFeedback = async () => {
    setLoading(true)
    try {
      // Try the vehicle-specific endpoint first (preferred approach)
      let response
      try {
        response = await axios.get(`http://localhost:1111/api/v1/feedbacks/vehicle/${vehicleID}`)
        console.log("Successfully fetched feedback using /vehicle/ endpoint")
      } catch (endpointError) {
        console.log("First endpoint failed, trying fallback endpoint")
        // Fallback to query parameter approach if the first endpoint fails
        response = await axios.get(`http://localhost:1111/api/v1/feedbacks?vehicleID=${vehicleID}`)
        console.log("Successfully fetched feedback using query parameter endpoint")
      }

      // Process the feedback data
      if (response.data && response.data.length > 0) {
        // Filter the feedback to ensure it's only for this vehicle
        // This is a safety measure in case the API doesn't filter properly
        const vehicleSpecificFeedback = response.data.filter(
          (item) => item.vehicleID === vehicleID || item.vehicleId === vehicleID,
        )

        if (vehicleSpecificFeedback.length > 0) {
          // Sort feedback by date (newest first)
          const sortedFeedback = vehicleSpecificFeedback.sort(
            (a, b) => new Date(b.datePosted || b.createdAt) - new Date(a.datePosted || a.createdAt),
          )

          setFeedback(sortedFeedback)

          // Fetch customer names for the feedback
          fetchCustomerNames(sortedFeedback)

          // Calculate average rating
          const totalRating = sortedFeedback.reduce((sum, item) => sum + item.rating, 0)
          setAverageRating((totalRating / sortedFeedback.length).toFixed(1))
        } else {
          setMessage("No feedback available for this vehicle.")
          setFeedback([])
        }
      } else {
        setMessage("No feedback available for this vehicle.")
        setFeedback([])
      }
    } catch (error) {
      console.error("Error fetching feedback:", error)
      setMessage("Unable to load feedback. Please try again later.")
      setFeedback([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this feedback?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      confirmButtonColor: "#f44336",
    })

    if (!confirmDelete.isConfirmed) return

    try {
      const token = localStorage.getItem("token")
      await axios.delete(`http://localhost:1111/api/v1/feedback/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setFeedback(feedback.filter((item) => item._id !== id))
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Your feedback has been deleted.",
        confirmButtonColor: "#b8860b",
      })
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Error deleting feedback",
        confirmButtonColor: "#f44336",
      })
    }
  }

  const handleEdit = async (item) => {
    const confirmEdit = await Swal.fire({
      title: "Edit Feedback",
      text: "Do you want to edit this feedback?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, edit it!",
      cancelButtonText: "No, cancel!",
      confirmButtonColor: "#b8860b",
    })

    if (!confirmEdit.isConfirmed) return

    setEditingFeedback(item._id)
    setEditedComment(item.comment)
    setEditedRating(item.rating)
  }

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.put(
        `http://localhost:1111/api/v1/feedback/${editingFeedback}`,
        {
          rating: editedRating,
          comment: editedComment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Update the feedback in the state
      setFeedback(feedback.map((item) => (item._id === editingFeedback ? response.data.feedback : item)))
      setEditingFeedback(null)

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Your feedback has been updated.",
        confirmButtonColor: "#b8860b",
      })
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Error updating feedback",
        confirmButtonColor: "#f44336",
      })
    }
  }

  const getSentimentBadge = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ThumbsUp className="w-3 h-3 mr-1" /> Positive
          </span>
        )
      case "negative":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            <ThumbsUp className="w-3 h-3 mr-1 rotate-180" /> Negative
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            Neutral
          </span>
        )
    }
  }

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={`w-4 h-4 ${star <= rating ? "text-yellow-400" : "text-gray-300"} fill-current`} />
        ))}
      </div>
    )
  }

  // Get customer name display
  const getCustomerName = (customerId) => {
    if (customerId === currentUserID) return "Me"

    // If we have the customer name in our state, use it
    if (customerNames[customerId]) {
      return customerNames[customerId]
    }

    // For any feedback that has customerName directly in the object
    const feedbackItem = feedback.find((item) => item.customerID === customerId)
    if (feedbackItem && feedbackItem.customerName) {
      return feedbackItem.customerName
    }

    // Fallback to a formatted ID
    return `Customer ${customerId?.substring(0, 5) || "Anonymous"}`
  }

  // Get customer initial for avatar
  const getCustomerInitial = (customerId) => {
    if (customerId === currentUserID) return "M"
    const name = customerNames[customerId]
    return name ? name.charAt(0).toUpperCase() : customerId ? customerId.charAt(0).toUpperCase() : "A"
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
        <span className="ml-3 text-teal-600 font-medium">Loading reviews...</span>
      </div>
    )
  }

  if (message && feedback.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-100 shadow-sm">
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {feedback.map((item) => (
        <div
          key={item._id}
          className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                {getCustomerInitial(item.customerID)}
              </div>
              <div className="ml-4">
                <h4 className="text-base font-semibold text-gray-900">{getCustomerName(item.customerID)}</h4>
                <div className="mt-1 flex items-center">
                  {editingFeedback === item._id ? (
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEditedRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= editedRating ? "text-yellow-400" : "text-gray-300"
                            } fill-current`}
                          />
                        </button>
                      ))}
                    </div>
                  ) : (
                    renderStars(item.rating)
                  )}
                  <span className="ml-2 text-xs text-gray-500">
                    {new Date(item.datePosted || item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {item.sentiment && <div className="mt-1">{getSentimentBadge(item.sentiment)}</div>}
              </div>
            </div>

            {/* Only show edit/delete buttons if the feedback belongs to the current user */}
            {currentUserID && item.customerID === currentUserID && (
              <div className="flex space-x-2">
                {editingFeedback === item._id ? (
                  <>
                    <button
                      onClick={handleUpdate}
                      className="px-3 py-1.5 bg-teal-600 text-white text-sm rounded-md hover:bg-teal-700 transition-colors font-medium shadow-sm flex items-center"
                    >
                      <span className="mr-1">Save</span>
                    </button>
                    <button
                      onClick={() => setEditingFeedback(null)}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors font-medium flex items-center"
                    >
                      <span className="mr-1">Cancel</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1.5 text-gray-500 hover:text-teal-600 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full"
                      aria-label="Edit feedback"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full"
                      aria-label="Delete feedback"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {editingFeedback === item._id ? (
            <div className="mt-4">
              <textarea
                value={editedComment}
                onChange={(e) => setEditedComment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                rows={3}
              />
            </div>
          ) : (
            <p className="mt-3 text-gray-700 bg-gray-50 p-4 rounded-md border-l-4 border-teal-200">{item.comment}</p>
          )}
        </div>
      ))}

      {feedback.length === 0 && message && (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-600">{message}</p>
        </div>
      )}
    </div>
  )
}

export default VehicleFeedbackComponent
