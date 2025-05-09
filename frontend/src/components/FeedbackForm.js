"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Swal from "sweetalert2"
import { Star } from "lucide-react"

const AddFeedbackForm = ({ vehicleID, onFeedbackAdded }) => {
  const [customerID, setCustomerID] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  // Fetch customer info from token
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const token = localStorage.getItem("token")
        if (token) {
          const res = await axios.get("http://localhost:1111/api/v1/myprofile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          const user = res.data.user
          setCustomerID(user._id)
          setCustomerName(user.name || user.fullName || "User") // Try different name fields
        }
      } catch (error) {
        console.error("Error getting current user:", error)
        setError("Please log in to submit feedback")
      } finally {
        setLoading(false)
      }
    }

    fetchCustomer()
  }, [])

  // Update the handleSubmit function to include customer name in the feedback data
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (rating === 0) {
      setError("Please select a rating")
      return
    }

    if (comment.trim() === "") {
      setError("Please enter a comment")
      return
    }

    if (comment.length < 5) {
      setError("Comment must be at least 5 characters long")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const token = localStorage.getItem("token")

      // Ensure vehicleID is properly formatted and included
      const feedbackData = {
        customerID,
        customerName, // Include customer name in the feedback data
        vehicleID, // The specific vehicle ID
        vehicleId: vehicleID, // Alternative field name in case the API uses this format
        rating,
        comment,
        datePosted: new Date().toISOString(), // Ensure date is included
      }

      console.log("Submitting feedback for vehicle:", vehicleID, "with customer name:", customerName)

      const response = await axios.post("http://localhost:1111/api/v1/feedbackform", feedbackData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 201 || response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Feedback Submitted",
          text: "✅ Feedback submitted successfully!",
          confirmButtonText: "OK",
          confirmButtonColor: "#b8860b",
        })

        // Reset form
        setRating(0)
        setComment("")

        // Notify parent component to refresh feedback list immediately
        if (onFeedbackAdded) {
          setTimeout(() => {
            onFeedbackAdded()
          }, 300) // Small delay to ensure the server has processed the new feedback
        }
      }
    } catch (error) {
      console.error("Error submitting feedback:", error)

      if (error.response?.status === 401) {
        Swal.fire({
          title: "Authentication Required",
          text: "Please log in to submit feedback",
          icon: "warning",
          confirmButtonColor: "#b8860b",
        })
      } else {
        setError(error.response?.data?.message || "Failed to submit feedback. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="w-6 h-6 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!customerID) {
    return (
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-amber-700">Please log in to submit feedback.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <h4 className="text-lg font-medium text-gray-900 mb-4">Write a Review</h4>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
          <input
            type="text"
            value={customerName}
            readOnly
            className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-300"
                  } fill-current hover:text-yellow-400 transition-colors`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Share your experience with this vehicle..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </button>
      </form>
    </div>
  )
}

export default AddFeedbackForm
