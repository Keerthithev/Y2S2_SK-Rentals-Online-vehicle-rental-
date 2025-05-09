// routes/complaintRoutes.js
const express = require('express');
const { createComplaint,getAllComplaints,replyToComplaint, getComplaints, updateComplaintStatus, deleteComplaint, getComplaintById,getComplaintsForUser } = require('../../controllers/complaint_management/complaintController');
const router = express.Router();

// Create Complaint
router.post('/complaintform', createComplaint);


// Get Complaints for a specific customer
router.get('/complaints/all', getAllComplaints);


// Get Complaints for a specific customer
router.get('/complaints/:userID', getComplaints);



// Update Complaint Status (Resolve or Pending)
router.put('/complaints/:complaintID', updateComplaintStatus); 

// Delete Complaint
router.delete('/complaints/:complaintID', deleteComplaint);


router.put('/complaints/reply/:complaintID', replyToComplaint);



// // Route to fetch complaint details by ID
// router.get('/complaints/details/:complaintID', getComplaintById);

// // Route to update complaint status and resolution
// router.put('/complaints/:complaintID', updateComplaintStatus);

// Route to delete a complaint
router.delete('/complaints/:complaintID', deleteComplaint);


module.exports = router;
