const express = require("express");
const router = express.Router();
const { newBooking, getAllBookings, cancelBooking, editBooking ,getUserBookings,getMyBookings} = require("../../controllers/booking_management/bookingController");
const protect = require("../../middlewares/authMiddleware"); // Import the middleware

// Create a new booking - requires user authentication
router.post("/newbook", protect, newBooking);

// Get all bookings - add protection if needed
router.get("/allbookings", protect, getAllBookings);


// Cancel a booking (same functionality as delete in this case)
router.delete('/cancelbooking/:id', cancelBooking);

router.get("/mybookings", protect, getMyBookings);
router.put('/editbooking/:id', protect, editBooking);


module.exports = router;
