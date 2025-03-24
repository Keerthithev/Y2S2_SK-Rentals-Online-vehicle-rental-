const express = require("express");
const router = express.Router();
const { newBooking, getAllBookings, cancelBooking, getUserBooking } = require("../../controllers/booking_management/bookingController");

// Create new booking
router.post("/booking/new", newBooking);
router.get("/booking/all", getAllBookings);
router.get("/booking/all/:userId", getUserBooking);
router.delete("/booking/all/:bookingId", cancelBooking);


module.exports = router;
