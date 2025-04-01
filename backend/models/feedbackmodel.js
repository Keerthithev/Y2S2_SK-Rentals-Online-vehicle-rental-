const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  customerID: {
    type: String, // Changed from ObjectId to String
    required: true,
  },
  vehicleID: {
    type: String, // Changed from ObjectId to String
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  datePosted: {
    type: Date,
    default: Date.now,
  },
});

const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;
