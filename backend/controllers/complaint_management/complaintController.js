// controllers/complaintController.js
const Complaint = require('../../models/complaintModel');

// ✅ Create Complaint
exports.createComplaint = async (req, res) => {
  try {
    const { customerID,customerName, issueType, vehicleID, issueDescription } = req.body;

    // Log the received request data for debugging purposes
    console.log('Received data:', req.body);

    // Validate input data
    if (!customerID||!customerName || !issueType || !issueDescription) {
      console.log('Validation failed: Missing fields');
      return res.status(400).json({ message: 'CustomerID,Customer name, issue type, and description are required' });
    }

    // If the issue type is vehicle, ensure vehicleID is provided
    if (issueType === 'vehicle' && !vehicleID) {
      console.log('Validation failed: Missing vehicleID for vehicle-related issue');
      return res.status(400).json({ message: 'Vehicle ID is required for vehicle-related complaints' });
    }

    // Create new complaint
    const newComplaint = new Complaint({
      customerID,
      customerName,
      issueType,
      vehicleID: issueType === 'vehicle' ? vehicleID : null, // Store vehicleID if issueType is vehicle
      issueDescription,
      status: 'Pending', // Default status
      dateFiled: new Date(),
    });

    // Save complaint to database
    await newComplaint.save();
    res.status(201).json({ message: 'Complaint submitted successfully!', complaint: newComplaint });
  } catch (error) {
    console.error('Error submitting complaint:', error);
    res.status(500).json({ message: 'Error submitting complaint', error: error.message });
  }
};
// In `complaintController.js`
exports.getComplaints = async (req, res) => {
  try {
    const { userID } = req.params; // Extract user ID and role from the request parameters

    if (!userID) {
      return res.status(401).json({ message: "User ID is required." });
    }

    let complaints;
   
      // Regular users can only fetch their own complaints
      complaints = await Complaint.find({ customerID: userID });
    

    if (!complaints.length) {
      return res.status(404).json({ message: "No complaints found." });
    }

    res.status(200).json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching complaints", error: error.message });
  }
};



exports.getAllComplaints = async (req, res) => {
  try {
    // Add pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Add sorting option from query string
    const sortBy = req.query.sortBy || '-createdAt'; // Default: newest first

    // Build the base query
    const query = Complaint.find()
      .populate('customerID', 'name email phone') // Only include necessary fields
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    // Execute the query
    const complaints = await query.exec();

    // Get total count for pagination info
    const total = await Complaint.countDocuments();

    if (!complaints.length) {
      return res.status(404).json({ 
        success: false,
        message: 'No complaints found.',
        data: []
      });
    }

    res.status(200).json({
      success: true,
      message: 'Complaints retrieved successfully',
      data: complaints,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching complaints',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};




exports.updateComplaintStatus = async (req, res) => {
  try {
    const { issueType, vehicleID, issueDescription } = req.body;

    // Log the incoming data
    console.log("Request Body:", req.body);

    // Find the complaint by ID
    const complaint = await Complaint.findById(req.params.complaintID);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Log current complaint data
    console.log("Current Complaint Data:", complaint);

    // Update fields based on the request data
    complaint.issueType = issueType || complaint.issueType;
    complaint.issueDescription = issueDescription || complaint.issueDescription;
    if (issueType === 'vehicle' && vehicleID) {
      complaint.vehicleID = vehicleID;
    }

    // Log the updated data before saving
    console.log("Updated Complaint Data:", complaint);

    // Save the updated complaint
await complaint.save().then(() => {
  console.log("Complaint saved successfully!");
}).catch((error) => {
  console.error("Error saving complaint:", error.message);
  throw error; // Throw error so it can be caught in the catch block
});


    // Return the updated complaint
    res.status(200).json({ message: 'Complaint updated successfully', complaint });
  } catch (error) {
    console.error('Error updating complaint:', error.message);
    res.status(500).json({ message: 'Error updating complaint', error: error.message });
  }
};


// Delete Complaint
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.complaintID);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.status(200).json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting complaint', error: error.message });
  }
};





// // ✅ Get Complaint Details by ID
// exports.getComplaintById = async (req, res) => {
//   try {
//     const complaint = await Complaint.findById(req.params.complaintID);
//     if (!complaint) {
//       return res.status(404).json({ message: 'Complaint not found' });
//     }
//     res.status(200).json(complaint);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching complaint details', error: error.message });
//   }
// };


// // ✅ Update Complaint
// exports.updateComplaint = async (req, res) => {
//   try {
//     const { issueType, issueDescription, status, resolutionDescription, vehicleID } = req.body;

//     if (!issueType || !issueDescription) {
//       return res.status(400).json({ message: 'Issue type and description are required' });
//     }

//     const updatedComplaint = await Complaint.findByIdAndUpdate(
//       req.params.complaintID,
//       {
//         issueType,
//         issueDescription,
//         status,
//         resolutionDescription,
//         vehicleID,  // Only update vehicleID if issueType is 'vehicle'
//       },
//       { new: true } // This option ensures the updated document is returned
//     );

//     if (!updatedComplaint) {
//       return res.status(404).json({ message: 'Complaint not found' });
//     }

//     res.status(200).json({
//       message: 'Complaint updated successfully',
//       complaint: updatedComplaint,
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating complaint', error: error.message });
//   }
// };



// ✅ Delete Complaint
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.complaintID);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.status(200).json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting complaint', error: error.message });
  }
};




exports.replyToComplaint = async (req, res) => {
  try {
    const { reply } = req.body;
    const complaintID = req.params.complaintID;
    console.log("keerthi")
    // Validate reply input
    if (!reply || reply.trim() === "") {
      return res.status(400).json({ message: 'Reply cannot be empty' });
    }

    // Update the complaint with the reply and status to "Resolved"
    const complaint = await Complaint.findByIdAndUpdate(complaintID, {
      status: 'Resolved',
      resolutionDescription: reply, // Save the reply in resolutionDescription
    }, { new: true });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.status(200).json({ message: 'Reply submitted successfully' });

  } catch (error) {
    console.error('Error replying to complaint:', error);
    res.status(500).json({ message: 'Error submitting the reply' });
  }
};
