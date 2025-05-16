"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
  Star,
  MessageSquare,
  Search,
  RefreshCw,
  Download,
  Loader2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  ArrowUpDown,
  Filter,
  User,
  Mail,
  Phone,
  Clock,
  BarChart,
} from "lucide-react"

const AllFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([])
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [sentimentFilter, setSentimentFilter] = useState("all")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [sortConfig, setSortConfig] = useState({ key: "datePosted", direction: "desc" })
  const [expandedFeedback, setExpandedFeedback] = useState(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isFilterExpanded, setIsFilterExpanded] = useState(true)
  const [statusMessage, setStatusMessage] = useState("")
  const [customerDetails, setCustomerDetails] = useState({})

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [feedbacks, searchQuery, sentimentFilter, ratingFilter, sortConfig])

  const fetchFeedbacks = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await axios.get("http://localhost:1111/api/v1/feedbacks/all")
      setFeedbacks(res.data)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch feedbacks.")
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomerInfo = async (customerId) => {
    // Skip if we already have this customer's details or if no customer ID
    if (!customerId || customerDetails[customerId]) return

    try {
      const res = await axios.get(`http://localhost:1111/api/v1/customers/${customerId}`)
      setCustomerDetails((prev) => ({
        ...prev,
        [customerId]: res.data,
      }))
    } catch (err) {
      console.error(`Failed to fetch customer details for ID ${customerId}:`, err)
      // Store a placeholder if we couldn't get the data
      setCustomerDetails((prev) => ({
        ...prev,
        [customerId]: { name: customerId, email: "Not available", phone: "Not available" },
      }))
    }
  }

  const applyFilters = () => {
    if (!Array.isArray(feedbacks)) {
      console.error("Feedbacks is not an array:", feedbacks)
      setFilteredFeedbacks([])
      return
    }

    let result = [...feedbacks]

    // Apply search filter
    if (searchQuery) {
      const term = searchQuery.toLowerCase()
      result = result.filter(
        (feedback) =>
          (feedback.customerID && feedback.customerID.toLowerCase().includes(term)) ||
          (feedback.comment && feedback.comment.toLowerCase().includes(term)),
      )
    }

    // Apply sentiment filter
    if (sentimentFilter !== "all") {
      result = result.filter(
        (feedback) => feedback.sentiment && feedback.sentiment.toLowerCase() === sentimentFilter.toLowerCase(),
      )
    }

    // Apply rating filter
    if (ratingFilter !== "all") {
      const rating = Number.parseInt(ratingFilter)
      result = result.filter((feedback) => feedback.rating === rating)
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        // Handle date fields
        if (sortConfig.key === "datePosted") {
          return sortConfig.direction === "asc"
            ? new Date(a.datePosted) - new Date(b.datePosted)
            : new Date(b.datePosted) - new Date(a.datePosted)
        }

        // Handle regular fields
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1
        }
        return 0
      })
    }

    setFilteredFeedbacks(result)
  }

  const resetFilters = () => {
    setSearchQuery("")
    setSentimentFilter("all")
    setRatingFilter("all")
  }

  const handleSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const toggleExpandFeedback = async (id) => {
    if (expandedFeedback === id) {
      setExpandedFeedback(null)
    } else {
      setExpandedFeedback(id)

      // Fetch customer info when expanding feedback
      const feedback = feedbacks.find((f) => f._id === id)
      if (feedback && feedback.customerID) {
        await fetchCustomerInfo(feedback.customerID)
      }
    }
  }

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={`w-5 h-5 ${star <= rating ? "text-yellow-400" : "text-gray-300"} fill-current`} />
        ))}
      </div>
    )
  }

  const getSentimentBadge = (sentiment) => {
    if (!sentiment) return null

    switch (sentiment.toLowerCase()) {
      case "positive":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ThumbsUp className="w-3 h-3 mr-1" />
            Positive
          </span>
        )
      case "negative":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            <ThumbsDown className="w-3 h-3 mr-1" />
            Negative
          </span>
        )
      case "neutral":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <MessageSquare className="w-3 h-3 mr-1" />
            Neutral
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            {sentiment}
          </span>
        )
    }
  }

  const exportToCSV = () => {
    if (!window.confirm("Do you want to export all feedbacks to CSV?")) {
      return
    }

    setIsExporting(true)

    try {
      // Prepare data for export
      const exportData = feedbacks.map((feedback) => ({
        "Customer ID": feedback.customerID || "Anonymous",
        Rating: feedback.rating,
        Comment: feedback.comment,
        Sentiment: feedback.sentiment || "N/A",
        "Date Posted": new Date(feedback.datePosted).toLocaleDateString(),
      }))

      // Convert to CSV
      const headers = Object.keys(exportData[0])
      const csvContent = [
        headers.join(","),
        ...exportData.map((row) =>
          headers.map((header) => `"${row[header].toString().replace(/"/g, '""')}"`).join(","),
        ),
      ].join("\n")

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `Feedbacks_${new Date().toISOString().split("T")[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setStatusMessage("Export completed successfully")
      setTimeout(() => setStatusMessage(""), 3000)
    } catch (error) {
      console.error("Export error:", error)
      setStatusMessage("Failed to export data. Please try again.")
      setTimeout(() => setStatusMessage(""), 5000)
    } finally {
      setIsExporting(false)
    }
  }

  // Calculate feedback statistics
  const getFeedbackStats = () => {
    if (!Array.isArray(feedbacks)) return { total: 0, positive: 0, negative: 0, neutral: 0, avgRating: 0 }

    const total = feedbacks.length
    const positive = feedbacks.filter((f) => f.sentiment && f.sentiment.toLowerCase() === "positive").length
    const negative = feedbacks.filter((f) => f.sentiment && f.sentiment.toLowerCase() === "negative").length
    const neutral = feedbacks.filter((f) => f.sentiment && f.sentiment.toLowerCase() === "neutral").length

    let totalRating = 0
    feedbacks.forEach((feedback) => {
      if (feedback.rating) totalRating += feedback.rating
    })
    const avgRating = total > 0 ? (totalRating / total).toFixed(1) : 0

    return { total, positive, negative, neutral, avgRating }
  }

  const getCustomerById = (id) => {
    return customerDetails[id] || null
  }

  const renderFeedbackDetails = (feedback) => {
    const customer = feedback.customerID ? getCustomerById(feedback.customerID) : null

    return (
      <div className="border-t border-gray-200 px-6 py-5 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Information */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
              <User className="h-4 w-4 mr-2 text-indigo-500" />
              Customer Information
            </h4>
            <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
              <div className="flex items-center mb-3">
                <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {customer ? customer.name : feedback.customerID || "Anonymous"}
                  </p>
                  {customer && customer.email && (
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <Mail className="h-3 w-3 mr-1" /> {customer.email}
                    </p>
                  )}
                  {customer && customer.phone && (
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <Phone className="h-3 w-3 mr-1" /> {customer.phone}
                    </p>
                  )}
                </div>
              </div>
              {feedback.customerID && !customer && (
                <div className="text-sm text-gray-500 italic">
                  <p>Customer ID: {feedback.customerID}</p>
                </div>
              )}
            </div>
          </div>

          {/* Feedback Details */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
              <MessageSquare className="h-4 w-4 mr-2 text-indigo-500" />
              Feedback Details
            </h4>
            <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 mr-2" />
                  <span className="text-sm font-medium">Rating: {feedback.rating}/5</span>
                </div>
                <div>{getSentimentBadge(feedback.sentiment)}</div>
              </div>
              <div className="flex items-center mb-3">
                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">
                  Submitted on {new Date(feedback.datePosted).toLocaleDateString()} at{" "}
                  {new Date(feedback.datePosted).toLocaleTimeString()}
                </span>
              </div>
              {feedback.categories && feedback.categories.length > 0 && (
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-700">Categories:</span>
                  <div className="flex flex-wrap mt-1">
                    {feedback.categories.map((category, index) => (
                      <span
                        key={index}
                        className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full mr-1 mb-1"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-3">
                <span className="text-sm font-medium text-gray-700">Feedback ID:</span>
                <span className="text-sm text-gray-600 ml-2">{feedback._id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full Comment Section */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
            <MessageSquare className="h-4 w-4 mr-2 text-indigo-500" />
            Full Comment
          </h4>
          <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
            <p className="text-gray-700 whitespace-pre-line">{feedback.comment}</p>
          </div>
        </div>

        {/* Sentiment Analysis */}
        {feedback.sentiment && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
              <BarChart className="h-4 w-4 mr-2 text-indigo-500" />
              Sentiment Analysis
            </h4>
            <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
              <div className="flex items-start">
                <div className="mr-4 flex-1">
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">Overall Sentiment:</span>
                    <span className="ml-2">{getSentimentBadge(feedback.sentiment)}</span>
                  </div>
                  {feedback.keywords && feedback.keywords.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Key Topics:</p>
                      <div className="flex flex-wrap">
                        {feedback.keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full mr-1 mb-1"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {feedback.sentiment.toLowerCase() === "positive" && (
                    <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
                      <ThumbsUp className="h-8 w-8 text-emerald-500" />
                    </div>
                  )}
                  {feedback.sentiment.toLowerCase() === "negative" && (
                    <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                      <ThumbsDown className="h-8 w-8 text-red-500" />
                    </div>
                  )}
                  {feedback.sentiment.toLowerCase() === "neutral" && (
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-8 w-8 text-blue-500" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions Section */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setExpandedFeedback(null)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close Details
          </button>
        </div>
      </div>
    )
  }

  const stats = getFeedbackStats()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-1">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Customer Feedback</h1>
          <p className="mt-1 text-sm text-gray-500 max-w-2xl">
            View and analyze customer feedback to improve your services and customer satisfaction.
          </p>
        </div>

        {/* Status Messages */}
        {statusMessage && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-1">
                <p className="text-sm text-blue-700">{statusMessage}</p>
              </div>
              <button onClick={() => setStatusMessage("")} className="text-blue-500 hover:text-blue-700">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3 flex-1">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Feedbacks</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.total}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-emerald-500 rounded-md p-3">
                  <ThumbsUp className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Positive</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.positive}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Neutral</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.neutral}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                  <ThumbsDown className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Negative</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.negative}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg. Rating</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stats.avgRating}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div
            className="px-6 py-4 border-b border-gray-200 flex justify-between items-center cursor-pointer"
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          >
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Filter className="mr-2 h-5 w-5 text-indigo-500" />
              Filter Feedbacks
            </h2>
            <button className="text-gray-400 hover:text-gray-500">
              {isFilterExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>

          {isFilterExpanded && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                    Search
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="search"
                      placeholder="Customer ID or comment..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="sentimentFilter" className="block text-sm font-medium text-gray-700">
                    Sentiment
                  </label>
                  <select
                    id="sentimentFilter"
                    value={sentimentFilter}
                    onChange={(e) => setSentimentFilter(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="all">All Sentiments</option>
                    <option value="positive">Positive</option>
                    <option value="neutral">Neutral</option>
                    <option value="negative">Negative</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="ratingFilter" className="block text-sm font-medium text-gray-700">
                    Rating
                  </label>
                  <select
                    id="ratingFilter"
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="all">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
          <h2 className="text-xl font-semibold text-gray-900">Feedbacks ({filteredFeedbacks.length})</h2>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={fetchFeedbacks}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={exportToCSV}
              disabled={isExporting || loading || feedbacks.length === 0}
              className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                (isExporting || loading || feedbacks.length === 0) && "opacity-50 cursor-not-allowed"
              }`}
            >
              {isExporting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
              Export to CSV
            </button>
          </div>
        </div>

        {/* Feedbacks Table/List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
                <p className="mt-4 text-gray-600">Loading feedbacks...</p>
              </div>
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No feedbacks found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {feedbacks.length > 0
                  ? "Try adjusting your search filters to find what you're looking for."
                  : "There are no feedbacks in the system yet. New feedbacks will appear here when customers submit them."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("customerID")}
                    >
                      <div className="flex items-center">
                        Customer
                        {sortConfig.key === "customerID" && <ArrowUpDown className="ml-1 h-4 w-4 text-indigo-500" />}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("rating")}
                    >
                      <div className="flex items-center">
                        Rating
                        {sortConfig.key === "rating" && <ArrowUpDown className="ml-1 h-4 w-4 text-indigo-500" />}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("sentiment")}
                    >
                      <div className="flex items-center">
                        Sentiment
                        {sortConfig.key === "sentiment" && <ArrowUpDown className="ml-1 h-4 w-4 text-indigo-500" />}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("datePosted")}
                    >
                      <div className="flex items-center">
                        Date
                        {sortConfig.key === "datePosted" && <ArrowUpDown className="ml-1 h-4 w-4 text-indigo-500" />}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Comment
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
                  {filteredFeedbacks.map((feedback) => (
                    <>
                      <tr
                        key={feedback._id}
                        className={`hover:bg-gray-50 ${expandedFeedback === feedback._id ? "bg-gray-50" : ""}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {feedback.customerID || "Anonymous"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{renderStars(feedback.rating)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getSentimentBadge(feedback.sentiment)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-500 mr-1.5" />
                            <span>{new Date(feedback.datePosted).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">{feedback.comment}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => toggleExpandFeedback(feedback._id)}
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            {expandedFeedback === feedback._id ? "Hide Details" : "View Details"}
                          </button>
                        </td>
                      </tr>
                      {expandedFeedback === feedback._id && (
                        <tr>
                          <td colSpan={6} className="p-0">
                            {renderFeedbackDetails(feedback)}
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AllFeedbacks
