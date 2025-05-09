const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  customerID: {
    type: mongoose.Schema.Types.ObjectId, // Reference to User model
    required: true,
    ref: "User",
  },
  customerName: {
    type: String,
    required: true,
  },
  issueType: {
    type: String,
    enum: ['vehicle', 'service'],
    required: true,
  },
  vehicleID: {
    type: String,
    required: function() {
      return this.issueType === 'vehicle';
    },
  },
  issueDescription: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Resolved', 'In Progress'],
    default: 'Pending',
  },
  dateFiled: {
    type: Date,
    default: Date.now,
  },
  resolutionDescription: {
    type: String,
    default: '',
  },
});

module.exports = mongoose.model('Complaint', complaintSchema);
