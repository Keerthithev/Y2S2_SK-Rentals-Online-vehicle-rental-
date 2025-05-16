const mongoose = require("mongoose");
const catchAsyncError = require("../../middlewares/catchAsyncError");
const Booking = require("../../models/bookingModel"); // Ensure this path is correct
const User = require('../../models/userModels'); // Adjust path as necessary

// Create a new booking
exports.newBooking = catchAsyncError(async (req, res, next) => {
    console.log("🔹 newBooking API hit");

    try {
        console.log("🔹 Request Body:", req.body);

        const {
            vehicleId,
            rentalStartDate,
            rentalEndDate,
            pickUpLocation,
            dropOffLocation,
            totalDays,
            totalAmount,
            paymentMethod,
            additionalDrivers,
            specialRequests,
        } = req.body;

        // Validate required fields
        if (!vehicleId || !rentalStartDate || !rentalEndDate || !pickUpLocation || !dropOffLocation || !totalAmount || !paymentMethod) {
            console.log("❌ Missing fields in request");
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        console.log("✅ All required fields are present");

        // Ensure the user is authenticated and the userId exists
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        // Parse dates properly
        const start = new Date(rentalStartDate);
        const end = new Date(rentalEndDate);

        // 🔒 Check for existing overlapping booking for the same vehicle
        const overlappingBooking = await Booking.findOne({
            vehicleId: vehicleId,
            $or: [
                {
                    rentalStartDate: { $lte: end },
                    rentalEndDate: { $gte: start }
                }
            ]
        });

        if (overlappingBooking) {
            return res.status(400).json({
                success: false,
                message: "This vehicle is already booked for the selected dates.",
            });
        }

        // Create a new booking instance with the userId
        const newBooking = new Booking({
            vehicleId,
            userId: req.user.id, // Set userId from authenticated user
            rentalStartDate,
            rentalEndDate,
            totalDays,
            totalAmount,
            paymentMethod,
            pickUpLocation,
            dropOffLocation,
            additionalDrivers,
            specialRequests,
        });

        console.log("📝 Saving new booking:", newBooking);

        await newBooking.save();

        console.log("✅ Booking saved successfully:", newBooking);

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            booking: newBooking,
        });

    } catch (error) {
        console.error("❌ Error while saving booking:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
});

// Get all bookings
exports.getAllBookings = catchAsyncError(async (req, res, next) => {
    try {
        // Fetch bookings and populate full user and vehicle details
        const bookings = await Booking.find()
            .populate("userId")  // Populate all fields from the user schema
            .populate("vehicleId");  // Populate all fields from the vehicle schema

        if (!bookings || bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No bookings found",
            });
        }

        // Send the response with the populated booking data
        res.status(200).json({
            success: true,
            bookings,
        });
    } catch (error) {
        console.error("Get all bookings error:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
});

// Cancel a booking
exports.cancelBooking = async (req, res) => {
    const bookingId = req.params.id; // Extract the booking ID from the URL parameter

    try {
        // Find the booking by ID and delete it from the database
        const deletedBooking = await Booking.findByIdAndDelete(bookingId);

        // If the booking was not found, return an error
        if (!deletedBooking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Return a success message when booking is deleted
        res.status(200).json({
            success: true,
            message: 'Booking successfully cancelled and deleted',
        });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel and delete booking',
            error: error.message,
        });
    }
};

// Get bookings for the logged-in user
exports.getMyBookings = catchAsyncError(async (req, res, next) => {
    const userId = req.user?.id;
  
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found in request",
      });
    }
  
    try {
      const myBookings = await Booking.find({ userId }).populate("vehicleId");
  
      return res.status(200).json({
        success: true,
        bookings: myBookings,
      });
    } catch (error) {
      console.error("Error fetching bookings:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch user's bookings",
        error: error.message,
      });
    }
  });

  exports.editBooking = catchAsyncError(async (req, res, next) => {
    const bookingId = req.params.id;
    const userId = req.user.id;
  
    const updated = await Booking.findOneAndUpdate(
      { _id: bookingId, userId },
      req.body,
      { new: true }
    ).populate("vehicleId");
  
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or not authorized",
      });
    }
  
    res.status(200).json({
      success: true,
      message: "Booking updated",
      booking: updated,
    });
  });
  