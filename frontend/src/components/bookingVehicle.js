import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { format, addDays, differenceInDays, isAfter, isBefore, isEqual } from "date-fns";
import { Calendar, ChevronLeft, CreditCard, DollarSign, Info, Loader, MapPin, Shield, User, Users, X } from 'lucide-react';

const BookVehicle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState("");
  const [bookingData, setBookingData] = useState({
    vehicleId: id,
    startDate: format(addDays(new Date(), 1), "yyyy-MM-dd"),
    endDate: format(addDays(new Date(), 3), "yyyy-MM-dd"),
    pickUpLocation: "",
    dropOffLocation: "",
    additionalDrivers: 0,
    specialRequests: "",
    paymentMethod: "credit_card",
    agreeToTerms: false
  });
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to decode JWT token and get expiry time
  const decodeToken = (token) => {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp;
  };

  // Fetch vehicle details and unavailable dates
  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:1111/api/v1/vehicle/${id}`);
        if (response.data.success && response.data.vehicle) {
          setVehicle(response.data.vehicle);
        } else {
          setError("Vehicle not found");
        }
      } catch (err) {
        setError("Failed to fetch vehicle details");
      } finally {
        setLoading(false);
      }
    };

    const fetchUnavailableDates = async () => {
      try {
        const response = await axios.get(`http://localhost:1111/api/v1/vehicle/${id}/unavailable-dates`);
        if (response.data.success) {
          setUnavailableDates(response.data.dates.map(date => new Date(date)));
        }
      } catch (err) {
        console.error("Error fetching unavailable dates:", err);
      }
    };

    fetchVehicleDetails();
    fetchUnavailableDates();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const calculateTotalDays = () => {
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    return differenceInDays(end, start) + 1;
  };

  const calculateTotalAmount = () => {
    const totalDays = calculateTotalDays();
    const baseAmount = totalDays * (vehicle?.rentPerDay || 0);
    const additionalDriverFee = bookingData.additionalDrivers * 25 * totalDays;
    return baseAmount + additionalDriverFee;
  };

  const areDatesValid = () => {
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    if (isBefore(end, start) || isEqual(end, start)) return false;

    for (const unavailableDate of unavailableDates) {
      if (
        (isAfter(unavailableDate, start) || isEqual(unavailableDate, start)) &&
        (isBefore(unavailableDate, end) || isEqual(unavailableDate, end))
      ) {
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!bookingData.agreeToTerms) {
      alert("Please agree to the terms and conditions");
      return;
    }

    if (!areDatesValid()) {
      alert("Selected dates are not available. Please choose different dates.");
      return;
    }

    const rentalStartDate = new Date(bookingData.startDate);
    const rentalEndDate = new Date(bookingData.endDate);

    if (isNaN(rentalStartDate) || isNaN(rentalEndDate)) {
      alert("Invalid rental dates.");
      return;
    }

    if (rentalEndDate <= rentalStartDate) {
      alert("The rental end date must be after the rental start date.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      console.log(localStorage.getItem("token"));
      if (!token) {
        navigate("/login", { state: { from: `/book/${id}` } });
        return;
      }

      const expiryTime = decodeToken(token);
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      console.log("Current Time: ", currentTime);
      console.log("Token Expiry Time: ", expiryTime);
      
      if (expiryTime && expiryTime < currentTime) {
        alert("Token has expired. Please log in again.");
        navigate("/login");
        return;
      }
      

      const totalDays = calculateTotalDays();
      const totalAmount = calculateTotalAmount();

      const response = await axios.post(
        "http://localhost:1111/api/v1/newbook",
        {
          vehicleId: id,
          rentalStartDate: rentalStartDate.toISOString(),
          rentalEndDate: rentalEndDate.toISOString(),
          totalDays,
          totalAmount,
          paymentMethod: bookingData.paymentMethod,
          pickUpLocation: bookingData.pickUpLocation,
          dropOffLocation: bookingData.dropOffLocation,
          additionalDrivers: bookingData.additionalDrivers,
          specialRequests: bookingData.specialRequests,
          agreeToTerms: true
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
     // Log the response to check the structure
    console.log("Booking API Response:", response);

    if (response.status >= 200 && response.status < 300 && response.data.success && response.data.booking) {
      // Booking was created successfully, move to the confirmation step
      setBookingSuccess(true);
      setBookingReference(response.data.booking._id || "REF123"); // Use the correct booking reference from response
      setCurrentStep(3); // Move to confirmation
    } else {
      // Show error if the response doesn't match the success criteria
      alert("Failed to create booking.");
    }
  } catch (error) {
    // Catch any other errors (network, server, etc.)
    console.error("Booking creation error:", error);
    alert("An error occurred while creating the booking.");
  }
  };
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Handle step navigation
  const nextStep = () => {
    if (currentStep === 1 && !areDatesValid()) {
      alert("Selected dates are not available. Please choose different dates.");
      return;
    }
    
    if (currentStep === 2 && (!bookingData.pickUpLocation || !bookingData.dropOffLocation)) {
      alert("Please fill in all required fields");
      return;
    }
    
    setCurrentStep(currentStep + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <X className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-center text-gray-900">Error</h2>
          <p className="mt-2 text-center text-gray-600">{error}</p>
          <div className="mt-6">
            <button
              onClick={() => navigate(-1)}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render success state
  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-teal-600 py-6 px-6">
              <div className="flex items-center justify-center">
                <div className="bg-white rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="ml-3 text-xl font-bold text-white">Booking Confirmed!</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-8">
                <p className="text-gray-600">Thank you for your booking. Your reservation has been confirmed.</p>
                <p className="mt-2 text-lg font-semibold">Booking Reference: <span className="text-teal-600">{bookingReference}</span></p>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold mb-4">Booking Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Vehicle Information</h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="font-semibold">{vehicle.name}</p>
                      <p className="text-sm text-gray-600">{vehicle.brand} {vehicle.model} ({vehicle.year})</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Rental Period</h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p><span className="text-gray-600">From:</span> {format(new Date(bookingData.startDate), "MMMM d, yyyy")}</p>
                      <p><span className="text-gray-600">To:</span> {format(new Date(bookingData.endDate), "MMMM d, yyyy")}</p>
                      <p><span className="text-gray-600">Duration:</span> {calculateTotalDays()} days</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Pickup & Return</h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p><span className="text-gray-600">Pickup:</span> {bookingData.pickupLocation}</p>
                      <p><span className="text-gray-600">Return:</span> {bookingData.dropoffLocation}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Payment Information</h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p><span className="text-gray-600">Total Amount:</span> {formatCurrency(calculateTotalAmount())}</p>
                      <p><span className="text-gray-600">Payment Method:</span> {bookingData.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => navigate('/my-bookings')}
                  className="px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                >
                  View My Bookings
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Return to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-teal-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            <span>Back to Vehicle</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Book Your Vehicle</h1>
          <p className="mt-2 text-gray-600">Complete the form below to reserve {vehicle?.name}</p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="flex justify-between">
            <div className={`flex flex-col items-center ${currentStep >= 1 ? 'text-teal-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-400'}`}>
                <Calendar className="w-5 h-5" />
              </div>
              <span className="mt-2 text-sm font-medium">Dates</span>
            </div>
            <div className="flex-1 flex items-center">
              <div className={`flex-1 h-1 ${currentStep >= 2 ? 'bg-teal-600' : 'bg-gray-200'}`}></div>
            </div>
            <div className={`flex flex-col items-center ${currentStep >= 2 ? 'text-teal-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-400'}`}>
                <MapPin className="w-5 h-5" />
              </div>
              <span className="mt-2 text-sm font-medium">Location</span>
            </div>
            <div className="flex-1 flex items-center">
              <div className={`flex-1 h-1 ${currentStep >= 3 ? 'bg-teal-600' : 'bg-gray-200'}`}></div>
            </div>
            <div className={`flex flex-col items-center ${currentStep >= 3 ? 'text-teal-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-400'}`}>
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="mt-2 text-sm font-medium">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <form onSubmit={handleSubmit}>
                {/* Step 1: Select Dates */}
                {currentStep === 1 && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Select Rental Dates</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Pickup Date
                        </label>
                        <input
                          type="date"
                          id="startDate"
                          name="startDate"
                          value={bookingData.startDate}
                          onChange={handleInputChange}
                          min={format(addDays(new Date(), 1), "yyyy-MM-dd")}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Return Date
                        </label>
                        <input
                          type="date"
                          id="endDate"
                          name="endDate"
                          value={bookingData.endDate}
                          onChange={handleInputChange}
                          min={bookingData.startDate}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                          required
                        />
                      </div>
                    </div>
                    
                    {!areDatesValid() && (
                      <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
                        <p className="text-sm">
                          <span className="font-medium">Warning:</span> The selected dates are not available or invalid. Please choose different dates.
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        onClick={nextStep}
                        className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Step 2: Location Details */}
                {currentStep === 2 && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Pickup & Return Details</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-700 mb-1">
                          Pickup Location
                        </label>
                        <input
                          type="text"
                          id="pickUpLocation"
                          name="pickUpLocation"
                          value={bookingData.pickUpLocation}
                          onChange={handleInputChange}
                          placeholder="Enter pickup location"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="dropoffLocation" className="block text-sm font-medium text-gray-700 mb-1">
                          Return Location
                        </label>
                        <input
                          type="text"
                          id="dropOffLocation"
                          name="dropOffLocation"
                          value={bookingData.dropOffLocation}
                          onChange={handleInputChange}
                          placeholder="Enter return location"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="additionalDrivers" className="block text-sm font-medium text-gray-700 mb-1">
                          Additional Drivers
                        </label>
                        <select
                          id="additionalDrivers"
                          name="additionalDrivers"
                          value={bookingData.additionalDrivers}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="0">No additional drivers</option>
                          <option value="1">1 additional driver</option>
                          <option value="2">2 additional drivers</option>
                          <option value="3">3 additional drivers</option>
                        </select>
                        <p className="mt-1 text-sm text-gray-500">$25 per additional driver per day</p>
                      </div>
                      
                      <div>
                        <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
                          Special Requests (Optional)
                        </label>
                        <textarea
                          id="specialRequests"
                          name="specialRequests"
                          value={bookingData.specialRequests}
                          onChange={handleInputChange}
                          rows="3"
                          placeholder="Any special requests or requirements"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        ></textarea>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-between">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={nextStep}
                        className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Step 3: Payment Details */}
                {currentStep === 3 && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Payment Method
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <label className={`flex items-center p-4 border rounded-md cursor-pointer ${bookingData.paymentMethod === 'credit_card' ? 'border-teal-500 bg-teal-50' : 'border-gray-300'}`}>
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="credit_card"
                              checked={bookingData.paymentMethod === 'credit_card'}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                            />
                            <div className="ml-3">
                              <span className="block text-sm font-medium">Credit Card</span>
                              <span className="block text-xs text-gray-500">Visa, Mastercard, Amex</span>
                            </div>
                          </label>
                          
                          <label className={`flex items-center p-4 border rounded-md cursor-pointer ${bookingData.paymentMethod === 'debit_card' ? 'border-teal-500 bg-teal-50' : 'border-gray-300'}`}>
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="debit_card"
                              checked={bookingData.paymentMethod === 'debit_card'}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                            />
                            <div className="ml-3">
                              <span className="block text-sm font-medium">Debit Card</span>
                              <span className="block text-xs text-gray-500">Direct from your bank</span>
                            </div>
                          </label>
                          
                          <label className={`flex items-center p-4 border rounded-md cursor-pointer ${bookingData.paymentMethod === 'paypal' ? 'border-teal-500 bg-teal-50' : 'border-gray-300'}`}>
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="paypal"
                              checked={bookingData.paymentMethod === 'paypal'}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                            />
                            <div className="ml-3">
                              <span className="block text-sm font-medium">PayPal</span>
                              <span className="block text-xs text-gray-500">Pay with your PayPal account</span>
                            </div>
                          </label>
                          
                          <label className={`flex items-center p-4 border rounded-md cursor-pointer ${bookingData.paymentMethod === 'cash' ? 'border-teal-500 bg-teal-50' : 'border-gray-300'}`}>
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="cash"
                              checked={bookingData.paymentMethod === 'cash'}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                            />
                            <div className="ml-3">
                              <span className="block text-sm font-medium">Cash</span>
                              <span className="block text-xs text-gray-500">Pay at pickup</span>
                            </div>
                          </label>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="agreeToTerms"
                              name="agreeToTerms"
                              type="checkbox"
                              checked={bookingData.agreeToTerms}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                              required
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="agreeToTerms" className="font-medium text-gray-700">
                              I agree to the terms and conditions
                            </label>
                            <p className="text-gray-500">
                              By checking this box, you agree to our{" "}
                              <a href="#" className="text-teal-600 hover:underline">
                                Terms of Service
                              </a>{" "}
                              and{" "}
                              <a href="#" className="text-teal-600 hover:underline">
                                Privacy Policy
                              </a>
                              .
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-between">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || !bookingData.agreeToTerms}
                        className={`px-6 py-2 rounded-md flex items-center ${
                          isSubmitting || !bookingData.agreeToTerms
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-teal-600 hover:bg-teal-700"
                        } text-white transition-colors`}
                      >
                        {isSubmitting && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                        {isSubmitting ? "Processing..." : "Complete Booking"}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Booking Summary</h2>
              
              <div className="mb-4">
                <div className="flex items-center">
                  <img
                    src={vehicle?.images?.[0]?.url || "/placeholder.svg"}
                    alt={vehicle?.name}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div className="ml-4">
                    <h3 className="font-medium">{vehicle?.name}</h3>
                    <p className="text-sm text-gray-600">{vehicle?.brand} {vehicle?.model}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 py-4 border-t border-b border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pickup Date</span>
                  <span>{format(new Date(bookingData.startDate), "MMM d, yyyy")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Return Date</span>
                  <span>{format(new Date(bookingData.endDate), "MMM d, yyyy")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span>{calculateTotalDays()} days</span>
                </div>
                {bookingData.additionalDrivers > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Additional Drivers</span>
                    <span>{bookingData.additionalDrivers}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3 py-4 border-b border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Rate</span>
                  <span>{formatCurrency(vehicle?.rentPerDay || 0)} × {calculateTotalDays()} days</span>
                </div>
                {bookingData.additionalDrivers > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Additional Drivers Fee</span>
                    <span>{formatCurrency(25 * bookingData.additionalDrivers * calculateTotalDays())}</span>
                  </div>
                )}
              </div>
              
              <div className="pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-xl font-bold text-teal-600">{formatCurrency(calculateTotalAmount())}</span>
                </div>
              </div>
              
              <div className="mt-6 bg-gray-50 p-4 rounded-md">
                <div className="flex">
                  <Shield className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Worry-free booking</h4>
                    <p className="mt-1 text-xs text-gray-500">Free cancellation up to 24 hours before pickup</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 bg-gray-50 p-4 rounded-md">
                <div className="flex">
                  <Info className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Need help?</h4>
                    <p className="mt-1 text-xs text-gray-500">
                      Call us at <a href="tel:+15551234567" className="text-teal-600">+1 (555) 123-4567</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookVehicle;