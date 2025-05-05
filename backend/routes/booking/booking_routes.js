const express = require("express");
const router = express.Router();
const { newBooking} = require("../../controllers/booking_management/bookingController");
const { getAllBookings} = require("../../controllers/booking_management/bookingController");
//const { getUserBooking} = require("../../controllers/booking_management/bookingController");
const { cancelBooking} = require("../../controllers/booking_management/bookingController");
const { editBooking } = require("../../controllers/booking_management/bookingController");




// Create new booking
router.post("/booking/new", newBooking);
 router.get("/booking/all", getAllBookings);
//router.get("/booking/all/:userId", getUserBooking);
router.delete("/booking/delete/:id", cancelBooking);
router.put("/booking/edit/:id", editBooking); // Update booking by ID


module.exports = router;
