const catchAsyncError = require("../../middlewares/catchAsyncError");
const Booking = require("../../models/bookingModel");

exports.newBooking = catchAsyncError(async (req, res, next) => {
    try {
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
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

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

        await newBooking.save();

        res.status(200).json({
            success: true,
            message: "Booking data received and saved successfully",
            booking: newBooking,
        });
        console.log(newBooking)

    } catch (error) {
        console.error("Error while saving booking:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
});

exports.getAllBookings = catchAsyncError(async (req, res, next) => {
    try {
        const bookings = await Booking.find();

        res.status(200).json({
            success: true,
            message: "All bookings retrieved successfully",
            bookings,
        });
        console.log(bookings);
    } catch (error) {
        console.error("Error while fetching bookings:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
});

exports.cancelBooking = catchAsyncError(async (req, res, next) => {
    try {
        const { bookingId } = req.params;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: "Booking ID is required",
            });
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        await Booking.findByIdAndDelete(bookingId);

        res.status(200).json({
            success: true,
            message: "Booking canceled successfully",
        });

    } catch (error) {
        console.error("Error while canceling booking:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
});

exports.getUserBooking = catchAsyncError(async (req, res, next) => {
    try {
        const bookings = await Booking.find();

        res.status(200).json({
            success: true,
            message: "All bookings retrieved successfully",
            bookings,
        });
        console.log(bookings);
    } catch (error) {
        console.error("Error while fetching bookings:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
});
