const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');

// Check vehicle availability for given dates
exports.checkVehicleAvailability = async (req, res) => {
  try {
    const { vehicleId, startDate, endDate } = req.body;

    // Validate input
    if (!vehicleId || !startDate || !endDate) {
      return res.status(400).json({ message: 'Vehicle ID, start date, and end date are required' });
    }

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }
    if (start < new Date()) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }

    // Check if vehicle exists and is generally available
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    if (!vehicle.availableStatus) {
      return res.status(400).json({ message: 'Vehicle is currently unavailable' });
    }

    // Check for overlapping bookings
    const conflictingBookings = await Booking.find({
      vehicle: vehicleId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
      ],
    });

    if (conflictingBookings.length > 0) {
      return res.status(400).json({
        message: 'Vehicle is not available for the selected dates',
        conflictingBookings: conflictingBookings.map((booking) => ({
          startDate: booking.startDate,
          endDate: booking.endDate,
          status: booking.status,
        })),
      });
    }

    res.json({ message: 'Vehicle is available', available: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};