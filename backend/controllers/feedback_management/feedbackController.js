const Feedback = require('../../models/feedbackmodel');
const Complaint = require('../../models/feedbackmodel');

exports.createFeedback = async (req, res) => {
    try {
      const { customerID, vehicleID, rating, comment } = req.body;
  
      // Validate request data
      if (!customerID || !vehicleID || !rating || !comment) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      const newFeedback = new Feedback({
        customerID,
        vehicleID,
        rating,
        comment,
        datePosted: new Date(),
      });
  
      await newFeedback.save();
      res.status(201).json({ message: 'Feedback submitted successfully', feedback: newFeedback });
    } catch (error) {
      res.status(500).json({ message: 'Error submitting feedback', error: error.message });
    }
  };
  
// ✅ Get all Feedback
exports.getFeedback = async (req, res) => {
    try {
      const feedback = await Feedback.find();  // Fetch all feedback records from DB
      
      if (!feedback.length) {
        return res.status(404).json({ message: 'No feedback available' });
      }
  
      res.status(200).json(feedback);  // Return all feedback records
    } catch (error) {
      res.status(500).json({ message: 'Error fetching feedback', error: error.message });
    }
  };
  
  
  
  
  // ✅ Update Feedback
  exports.updateFeedback = async (req, res) => {
    try {
      const { rating, comment } = req.body;
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Invalid rating value' });
      }
  
      const feedback = await Feedback.findByIdAndUpdate(
        req.params.feedbackID,
        { rating, comment },
        { new: true }
      );
  
      if (!feedback) {
        return res.status(404).json({ message: 'Feedback not found' });
      }
  
      res.status(200).json({ message: 'Feedback updated successfully', feedback });
    } catch (error) {
      res.status(500).json({ message: 'Error updating feedback', error: error.message });
    }
  };
  
  // ✅ Delete Feedback
  exports.deleteFeedback = async (req, res) => {
    try {
      const feedback = await Feedback.findByIdAndDelete(req.params.feedbackID);
      if (!feedback) {
        return res.status(404).json({ message: 'Feedback not found' });
      }
      res.status(200).json({ message: 'Feedback deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting feedback', error: error.message });
    }
  };
  
  // ──────────────────────────────────────────────────────────────────────
  
  // ✅ Create Complaint
  exports.createComplaint = async (req, res) => {
    try {
      const { customerID, issueType, vehicleID, issueDescription } = req.body;
  
      if (!customerID || !issueType || !issueDescription || 
          (issueType === 'vehicle' && !vehicleID)) {
          return res.status(400).json({ message: 'All fields are required' });
      }
  
      const newComplaint = new Complaint({
        customerID,
        vehicleID: issueType === 'vehicle' ? vehicleID : null,
        issueType,
        issueDescription,
        status: 'Pending',
        dateFiled: new Date(),
      });
  
      await newComplaint.save();
      res.status(201).json({ message: 'Complaint submitted successfully', complaint: newComplaint });
    } catch (error) {
      res.status(500).json({ message: 'Error submitting complaint', error: error.message });
    }
  };
  
  // ✅ Get Complaints for a Specific Customer
  exports.getComplaints = async (req, res) => {
    try {
      const complaints = await Complaint.find({ customerID: req.params.customerID });
      if (!complaints.length) {
        return res.status(404).json({ message: 'No complaints found for this customer' });
      }
      res.status(200).json(complaints);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching complaints', error: error.message });
    }
  };