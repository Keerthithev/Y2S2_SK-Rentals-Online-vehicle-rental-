// server/routes/availabilityRoutes.js
const express = require('express');
const router = express.Router();
const { checkVehicleAvailability } = require('../controllers/availabilityController');
const authMiddleware = require('../middleware/auth'); // Optional

// Check vehicle availability
router.post('/check', authMiddleware, checkVehicleAvailability); // Use authMiddleware if only authenticated users can check

module.exports = router;