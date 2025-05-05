const mongoose = require("mongoose");
const catchAsyncError = require("../../middlewares/catchAsyncError");
const Booking = require("../../models/bookingModel");

exports.newBooking = catchAsyncError(async (req, res, next) => {
    console.log("🔹 newBooking API hit"); // Check if the function is being called

    try {
        console.log("🔹 Request Body:", req.body); // See the data received

        const {
            user,
            vehicle,
            vehicleName,
            rentalStartDate,
            rentalEndDate,
            pickUpLocation,
            dropOffLocation,
            totalAmount,
            paymentMethod,
        } = req.body;

        if (!user || !vehicle || !vehicleName || !rentalStartDate || !rentalEndDate || !pickUpLocation || !dropOffLocation || !totalAmount || !paymentMethod) {
            console.log("❌ Missing fields in request");
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        console.log("✅ All required fields are present");

        /* if (!mongoose.Types.ObjectId.isValid(user)) {
            console.log("❌ Invalid user ID format:", user);
            return res.status(400).json({ message: "Invalid user ID format" });
        }

        if (!mongoose.Types.ObjectId.isValid(vehicle)) {
            console.log("❌ Invalid vehicle ID format:", vehicle);
            return res.status(400).json({ message: "Invalid vehicle ID format" });
        } */

        console.log("✅ User and Vehicle IDs are valid");

        const newBooking = new Booking({
            user,
            vehicle,
            vehicleName,
            rentalStartDate,
            rentalEndDate,
            pickUpLocation,
            dropOffLocation,
            totalAmount,
            paymentMethod,
        });

        console.log("📝 Saving new booking:", newBooking);

        await newBooking.save();

        console.log("✅ Booking saved successfully:", newBooking);

        res.status(200).json({
            success: true,
            message: "Booking data received and saved successfully",
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


exports.getAllBookings = catchAsyncError(async (req, res, next) => {
    try {
        const bookings = await Booking.find().populate("user", "email").populate("vehicle", "name");
        
        if (!bookings || bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No bookings found",
            });
        }
        
        res.status(200).json({
            success: true,
            bookings,
        });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
});


exports.deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the booking exists
        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Delete the booking
        await Booking.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Booking deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting booking:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the booking exists
        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Delete the booking
        await Booking.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Booking canceled successfully",
        });
    } catch (error) {
        console.error("Error canceling booking:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

exports.editBooking = async (req, res) => {
    try {
        const { id } = req.params;  // Extract booking ID from URL
        const updatedData = req.body; // Extract new booking data from request body

        // Check if the booking exists
        let booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        // Update the booking
        booking = await Booking.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });

        res.status(200).json({ success: true, message: "Booking updated successfully", booking });
    } catch (error) {
        console.error("Error updating booking:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};



